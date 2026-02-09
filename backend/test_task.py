import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlmodel.pool import StaticPool

from main import app
from db import get_session
from models import User, Task
from routes.auth import _create_token


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        yield session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="test_user")
def test_user_fixture(session: Session):
    user = User(id="usr_test123", email="test@example.com", name="Test User")
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="auth_cookie")
def auth_cookie_fixture(test_user: User):
    token = _create_token(test_user.id)
    return {"auth_token": token}


# --- CREATE ---

def test_create_task(client: TestClient, test_user: User, auth_cookie: dict):
    response = client.post(
        f"/api/{test_user.id}/tasks",
        json={"title": "Buy groceries", "description": "Milk, eggs, bread"},
        cookies=auth_cookie,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["data"]["task"]["title"] == "Buy groceries"
    assert body["data"]["task"]["completed"] is False


def test_create_task_without_description(client: TestClient, test_user: User, auth_cookie: dict):
    response = client.post(
        f"/api/{test_user.id}/tasks",
        json={"title": "Simple task"},
        cookies=auth_cookie,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["data"]["task"]["description"] is None


def test_create_task_unauthorized(client: TestClient, test_user: User):
    response = client.post(
        f"/api/{test_user.id}/tasks",
        json={"title": "Should fail"},
    )
    assert response.status_code == 401


# --- LIST ---

def test_list_tasks_empty(client: TestClient, test_user: User, auth_cookie: dict):
    response = client.get(f"/api/{test_user.id}/tasks", cookies=auth_cookie)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["tasks"] == []


def test_list_tasks(client: TestClient, test_user: User, auth_cookie: dict, session: Session):
    task = Task(user_id=test_user.id, title="Task 1")
    session.add(task)
    session.commit()

    response = client.get(f"/api/{test_user.id}/tasks", cookies=auth_cookie)
    assert response.status_code == 200
    body = response.json()
    assert len(body["data"]["tasks"]) == 1
    assert body["data"]["tasks"][0]["title"] == "Task 1"


# --- GET ---

def test_get_task(client: TestClient, test_user: User, auth_cookie: dict, session: Session):
    task = Task(user_id=test_user.id, title="My task")
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.get(f"/api/{test_user.id}/tasks/{task.id}", cookies=auth_cookie)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["task"]["title"] == "My task"


def test_get_task_not_found(client: TestClient, test_user: User, auth_cookie: dict):
    response = client.get(f"/api/{test_user.id}/tasks/9999", cookies=auth_cookie)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "TASK_NOT_FOUND"


# --- UPDATE ---

def test_update_task(client: TestClient, test_user: User, auth_cookie: dict, session: Session):
    task = Task(user_id=test_user.id, title="Old title")
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.put(
        f"/api/{test_user.id}/tasks/{task.id}",
        json={"title": "New title"},
        cookies=auth_cookie,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["task"]["title"] == "New title"


def test_update_task_empty_title(client: TestClient, test_user: User, auth_cookie: dict, session: Session):
    task = Task(user_id=test_user.id, title="Keep me")
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.put(
        f"/api/{test_user.id}/tasks/{task.id}",
        json={"title": "   "},
        cookies=auth_cookie,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "TITLE_EMPTY"


# --- DELETE ---

def test_delete_task(client: TestClient, test_user: User, auth_cookie: dict, session: Session):
    task = Task(user_id=test_user.id, title="Delete me")
    session.add(task)
    session.commit()
    session.refresh(task)

    response = client.delete(f"/api/{test_user.id}/tasks/{task.id}", cookies=auth_cookie)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True

    # Verify it's gone
    response = client.get(f"/api/{test_user.id}/tasks/{task.id}", cookies=auth_cookie)
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "TASK_NOT_FOUND"


def test_delete_task_not_found(client: TestClient, test_user: User, auth_cookie: dict):
    response = client.delete(f"/api/{test_user.id}/tasks/9999", cookies=auth_cookie)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "TASK_NOT_FOUND"


# --- TOGGLE COMPLETE ---

def test_toggle_complete(client: TestClient, test_user: User, auth_cookie: dict, session: Session):
    task = Task(user_id=test_user.id, title="Toggle me")
    session.add(task)
    session.commit()
    session.refresh(task)

    # Toggle to complete
    response = client.patch(f"/api/{test_user.id}/tasks/{task.id}/complete", cookies=auth_cookie)
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["task"]["completed"] is True

    # Toggle back to incomplete
    response = client.patch(f"/api/{test_user.id}/tasks/{task.id}/complete", cookies=auth_cookie)
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["task"]["completed"] is False


# --- AUTHORIZATION ---

def test_cannot_access_other_users_tasks(client: TestClient, test_user: User, auth_cookie: dict):
    response = client.get("/api/usr_other999/tasks", cookies=auth_cookie)
    assert response.status_code == 403

import { ApiResponse, Task } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return res.json();
}

export async function getTasks(
  userId: string
): Promise<ApiResponse<{ tasks: Task[] }>> {
  return apiFetch(`/api/${userId}/tasks`);
}

export async function createTask(
  userId: string,
  title: string,
  description?: string
): Promise<ApiResponse<{ task: Task }>> {
  return apiFetch(`/api/${userId}/tasks`, {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });
}

export async function getTask(
  userId: string,
  taskId: number
): Promise<ApiResponse<{ task: Task }>> {
  return apiFetch(`/api/${userId}/tasks/${taskId}`);
}

export async function updateTask(
  userId: string,
  taskId: number,
  data: { title?: string; description?: string }
): Promise<ApiResponse<{ task: Task }>> {
  return apiFetch(`/api/${userId}/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTask(
  userId: string,
  taskId: number
): Promise<ApiResponse<null>> {
  return apiFetch(`/api/${userId}/tasks/${taskId}`, {
    method: "DELETE",
  });
}

export async function toggleComplete(
  userId: string,
  taskId: number
): Promise<ApiResponse<{ task: Task }>> {
  return apiFetch(`/api/${userId}/tasks/${taskId}/complete`, {
    method: "PATCH",
  });
}

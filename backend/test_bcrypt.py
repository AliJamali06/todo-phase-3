import bcrypt


def test_hash_password():
    """Hashing a password returns a valid bcrypt hash."""
    password = "mysecretpassword"
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    assert hashed.startswith("$2b$")
    assert len(hashed) == 60


def test_verify_correct_password():
    """checkpw returns True for the correct password."""
    password = "correcthorse"
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    assert bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8")) is True


def test_verify_wrong_password():
    """checkpw returns False for an incorrect password."""
    password = "correcthorse"
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    assert bcrypt.checkpw("wrongpassword".encode("utf-8"), hashed.encode("utf-8")) is False


def test_different_passwords_produce_different_hashes():
    """Two different passwords should produce different hashes."""
    hash1 = bcrypt.hashpw("password1".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    hash2 = bcrypt.hashpw("password2".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    assert hash1 != hash2


def test_same_password_different_salts():
    """Same password with different salts produces different hashes."""
    password = "samepassword".encode("utf-8")
    hash1 = bcrypt.hashpw(password, bcrypt.gensalt()).decode("utf-8")
    hash2 = bcrypt.hashpw(password, bcrypt.gensalt()).decode("utf-8")
    assert hash1 != hash2
    # Both should still verify correctly
    assert bcrypt.checkpw(password, hash1.encode("utf-8")) is True
    assert bcrypt.checkpw(password, hash2.encode("utf-8")) is True

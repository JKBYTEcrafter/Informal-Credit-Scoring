import base64
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.config.settings import get_settings

PASSWORD_HASH_PREFIX = "aci-bcrypt-sha256$"


def _password_material(password: str) -> bytes:
    digest = hashlib.sha256(password.encode("utf-8")).digest()
    return base64.b64encode(digest)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if hashed_password.startswith(PASSWORD_HASH_PREFIX):
        expected = hashed_password.removeprefix(PASSWORD_HASH_PREFIX).encode("utf-8")
        return bcrypt.checkpw(_password_material(plain_password), expected)
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def get_password_hash(password: str) -> str:
    hashed = bcrypt.hashpw(_password_material(password), bcrypt.gensalt(rounds=12))
    return f"{PASSWORD_HASH_PREFIX}{hashed.decode('utf-8')}"


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload: dict[str, Any] = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any] | None:
    settings = get_settings()
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import LoginRequest, UserRegister
from app.utils.security import get_password_hash, verify_password


class AuthService:
    def register_user(self, db: Session, payload: UserRegister) -> User:
        existing_user = db.scalar(select(User).where(User.email == payload.email.lower()))
        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists",
            )

        user = User(
            name=payload.name,
            email=payload.email.lower(),
            hashed_password=get_password_hash(payload.password),
            occupation=payload.occupation,
            monthly_income=payload.monthly_income,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def authenticate_user(self, db: Session, payload: LoginRequest) -> User:
        user = db.scalar(select(User).where(User.email == payload.email.lower()))
        if user is None or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user


auth_service = AuthService()

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi_app.core.db import get_db
from fastapi_app.core.security import get_current_user
from fastapi_app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserSchema
from fastapi_app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserSchema, status_code=201)
async def register(payload: RegisterRequest, db: AsyncSession= Depends(get_db)):
    """Register a new user."""
    try:
        user = await auth_service.register_user(
            db, payload.username, payload.email, payload.password
        )
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failer: {str(e)}",
        )

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db :AsyncSession=Depends(get_db)):
    """Authenticate and return JWT token."""
    user = await auth_service.authenticate_user(db, payload.username, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    token = auth_service.generate_token(user)
    return TokenResponse(
        access_token=token,
        username=user["username"],
        user_id=user["id"],
    )

@router.get("/me", response_model=UserSchema)
async def me(current_user: dict=Depends(get_current_user)):
    """Return the currently authenticated user"""
    return current_user


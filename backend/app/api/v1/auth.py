"""Authentication API routes - Stub implementation"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from datetime import timedelta

from app.core.security import create_access_token, create_refresh_token, hash_password

router = APIRouter()

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest):
    """Register new user"""
    # Stub implementation
    user_id = f"user_{hash(request.email) % 100000}"
    access_token = create_access_token({"sub": user_id, "email": request.email})
    refresh_token = create_refresh_token({"sub": user_id})
    user = UserResponse(id=user_id, email=request.email, name=request.full_name)
    return TokenResponse(
        access_token=access_token, 
        refresh_token=refresh_token,
        user=user
    )

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """User login"""
    # Stub implementation - in real app, verify password and fetch user from DB
    user_id = f"user_{hash(request.email) % 100000}"
    access_token = create_access_token({"sub": user_id, "email": request.email})
    refresh_token = create_refresh_token({"sub": user_id})
    # In real implementation, fetch user name from database
    user_name = request.email.split('@')[0].title()
    user = UserResponse(id=user_id, email=request.email, name=user_name)
    return TokenResponse(
        access_token=access_token, 
        refresh_token=refresh_token,
        user=user
    )

@router.post("/anonymous", response_model=TokenResponse)
async def anonymous_session():
    """Create anonymous session"""
    access_token = create_access_token({"sub": "anon_123", "is_anonymous": True})
    refresh_token = create_refresh_token({"sub": "anon_123"})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

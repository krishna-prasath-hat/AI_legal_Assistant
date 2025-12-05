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

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest):
    """Register new user"""
    # Stub implementation
    access_token = create_access_token({"sub": "user_123", "email": request.email})
    refresh_token = create_refresh_token({"sub": "user_123"})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """User login"""
    # Stub implementation
    access_token = create_access_token({"sub": "user_123", "email": request.email})
    refresh_token = create_refresh_token({"sub": "user_123"})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.post("/anonymous", response_model=TokenResponse)
async def anonymous_session():
    """Create anonymous session"""
    access_token = create_access_token({"sub": "anon_123", "is_anonymous": True})
    refresh_token = create_refresh_token({"sub": "anon_123"})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

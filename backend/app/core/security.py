"""
Security utilities for authentication and authorization
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import secrets

from app.config import settings
from app.database import get_db
from app.core.exceptions import AuthenticationError, AuthorizationError

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash
    
    Args:
        plain_password: Plain text password
        hashed_password: Hashed password
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    
    Args:
        data: Data to encode in the token
        expires_delta: Token expiration time
        
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Create a JWT refresh token
    
    Args:
        data: Data to encode in the token
        
    Returns:
        Encoded JWT refresh token
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT token
    
    Args:
        token: JWT token to decode
        
    Returns:
        Decoded token payload
        
    Raises:
        AuthenticationError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        raise AuthenticationError(
            message="Invalid or expired token",
            details={"error": str(e)}
        )


def generate_anonymous_token() -> str:
    """
    Generate a secure anonymous session token
    
    Returns:
        Random token string
    """
    return secrets.token_urlsafe(32)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get current authenticated user from token
    
    Args:
        token: JWT token from request
        db: Database session
        
    Returns:
        User data
        
    Raises:
        AuthenticationError: If authentication fails
    """
    payload = decode_token(token)
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise AuthenticationError(message="Invalid token payload")
    
    # Import here to avoid circular dependency
    from app.models.user import User
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise AuthenticationError(message="User not found")
    
    if not user.is_active:
        raise AuthenticationError(message="User account is inactive")
    
    return {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "is_anonymous": user.is_anonymous
    }


async def get_current_active_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get current active user (non-anonymous)
    
    Args:
        current_user: Current user from token
        
    Returns:
        User data
        
    Raises:
        AuthorizationError: If user is anonymous
    """
    if current_user.get("is_anonymous"):
        raise AuthorizationError(
            message="This action requires a registered account",
            details={"reason": "anonymous_user"}
        )
    
    return current_user


def require_role(required_role: str):
    """
    Dependency to require a specific user role
    
    Args:
        required_role: Required role (e.g., 'admin', 'lawyer')
        
    Returns:
        Dependency function
    """
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        if current_user.get("role") != required_role:
            raise AuthorizationError(
                message=f"This action requires {required_role} role",
                details={"required_role": required_role, "user_role": current_user.get("role")}
            )
        return current_user
    
    return role_checker


def encrypt_sensitive_data(data: str) -> str:
    """
    Encrypt sensitive data (placeholder - implement with actual encryption)
    
    Args:
        data: Data to encrypt
        
    Returns:
        Encrypted data
    """
    # TODO: Implement actual encryption using cryptography library
    return data


def decrypt_sensitive_data(encrypted_data: str) -> str:
    """
    Decrypt sensitive data (placeholder - implement with actual decryption)
    
    Args:
        encrypted_data: Encrypted data
        
    Returns:
        Decrypted data
    """
    # TODO: Implement actual decryption using cryptography library
    return encrypted_data

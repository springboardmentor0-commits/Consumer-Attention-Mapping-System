import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr
from typing import Literal

from app.core.db import get_session
from app.models.schemas import User, Role
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

# Predefined allowed role names
RoleName = Literal["SuperAdmin", "StoreManager", "Analyst", "MarketingManager", "Admin"]

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role_name: RoleName

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    role: str
    is_active: bool

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegisterRequest, session: Session = Depends(get_session)):
    # 1. Verify if user already exists
    existing_user = session.exec(select(User).where(User.email == payload.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # 2. Look up the role in the database
    role = session.exec(select(Role).where(Role.name == payload.role_name)).first()
    if not role:
        # Fallback dynamic creation if roles were not seeded yet
        role = Role(name=payload.role_name)
        session.add(role)
        session.commit()
        session.refresh(role)
        
    # 3. Create the new user
    new_user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role_id=role.id,
        is_active=True
    )
    
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        role=role.name,
        is_active=new_user.is_active
    )

@router.post("/login", response_model=TokenResponse)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    # 1. Fetch user by email (username field in OAuth2PasswordRequestForm)
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 2. Access the user's role name
    role = session.get(Role, user.role_id)
    role_name = role.name if role else "User"
    
    # 3. Create JWT token
    access_token = create_access_token(
        data={"sub": user.email, "role": role_name}
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer"
    )

# backend/app/api/auth.py
from fastapi import APIRouter, HTTPException, status
from app.models.user import UserRegisterRequest, UserLoginRequest, TokenResponse
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Core Database Store Mirror for Phase Validation
MOCK_USER_DB = {}
ROLE_MAPPING = {
    1: "Admin", 
    2: "Store Manager", 
    3: "Retail Analyst", 
    4: "Marketing Manager"
}

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserRegisterRequest):
    if payload.email in MOCK_USER_DB:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if payload.role_id not in ROLE_MAPPING:
        raise HTTPException(status_code=400, detail="Invalid role_id specification")

    # Passlib transforms the clean text safely
    hashed_password = get_password_hash(payload.password)
    
    MOCK_USER_DB[payload.email] = {
        "email": payload.email,
        "password_hash": hashed_password,
        "role": ROLE_MAPPING[payload.role_id]
    }
    return {"message": "User registered successfully"}

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLoginRequest):
    user = MOCK_USER_DB.get(payload.email)
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect email or password credentials"
        )
    
    # Encrypt the assigned user role tracking into token payload
    access_token = create_access_token(subject=user["email"], role=user["role"])
    return {"access_token": access_token, "token_type": "bearer"}
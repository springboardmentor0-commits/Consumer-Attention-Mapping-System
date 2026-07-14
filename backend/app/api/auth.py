from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)

from app.models.database_models import (
    UserModel,
    RoleModel,
)

from app.models.user import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
)

# ==========================================================
# Router Configuration
# ==========================================================

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


# ==========================================================
# Register User
# ==========================================================

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: UserRegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Register a new application user.
    """

    # ------------------------------------------------------
    # Check if email already exists
    # ------------------------------------------------------

    existing_user = (
        db.query(UserModel)
        .filter(UserModel.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered.",
        )

    # ------------------------------------------------------
    # Validate Role
    # ------------------------------------------------------

    role = (
        db.query(RoleModel)
        .filter(RoleModel.id == user_data.role_id)
        .first()
    )

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role selected.",
        )

    # ------------------------------------------------------
    # Create User
    # ------------------------------------------------------

    new_user = UserModel(
        email=user_data.email,
        password_hash=get_password_hash(
            user_data.password,
        ),
        role=role,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully.",
    }


# ==========================================================
# Login User
# ==========================================================

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    user_data: UserLoginRequest,
    db: Session = Depends(get_db),
):
    """
    Authenticate a user and generate a JWT.
    """

    # ------------------------------------------------------
    # Find User
    # ------------------------------------------------------

    user = (
        db.query(UserModel)
        .filter(UserModel.email == user_data.email)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # ------------------------------------------------------
    # Verify Password
    # ------------------------------------------------------

    if not verify_password(
        user_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # ------------------------------------------------------
    # Generate JWT
    # ------------------------------------------------------

    access_token = create_access_token(
        subject=user.email,
        role=user.role.role_name,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
    )
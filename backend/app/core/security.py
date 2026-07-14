from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Union
import os

from dotenv import load_dotenv

import jwt
from jwt import ExpiredSignatureError, InvalidTokenError

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from passlib.context import CryptContext

# ==========================================================
# Load Environment Variables
# ==========================================================

load_dotenv()

SECRET_KEY = (
    os.getenv("SECRET_KEY")
    or os.getenv("JWT_SECRET_KEY")
    or "dev-secret-key-change-in-production"
)
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)
)

# ==========================================================
# Password Hashing
# ==========================================================

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
)

# ==========================================================
# HTTP Bearer Authentication
# ==========================================================

security = HTTPBearer()

# ==========================================================
# Password Utilities
# ==========================================================

def get_password_hash(password: str) -> str:
    """
    Hash a plain-text password.
    """
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a password against its hash.
    """
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


# ==========================================================
# JWT Creation
# ==========================================================

def create_access_token(
    subject: Union[str, Any],
    role: str,
) -> str:
    """
    Create a signed JWT.
    """

    expire = (
        datetime.now(timezone.utc)
        + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    payload = {
        "sub": str(subject),
        "role": role,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# ==========================================================
# JWT Verification
# ==========================================================

def verify_access_token(
    token: str,
) -> Dict[str, Any]:
    """
    Decode and validate a JWT.
    """

    try:

        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

    except ExpiredSignatureError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
        )

    except InvalidTokenError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )


# ==========================================================
# Current User
# ==========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Read and validate JWT from Authorization header.
    """

    token = credentials.credentials

    return verify_access_token(token)


# ==========================================================
# Role Authorization
# ==========================================================

def require_roles(*allowed_roles):
    """
    Allow access to one or more roles.

    Example:
        Depends(require_roles("Admin"))

        Depends(require_roles(
            "Admin",
            "Store Manager",
        ))
    """

    def role_checker(
        current_user=Depends(get_current_user),
    ):

        if current_user["role"] not in allowed_roles:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource.",
            )

        return current_user

    return role_checker


# ==========================================================
# Ready-to-use Dependencies
# ==========================================================

require_admin = require_roles("Admin")

require_store_manager = require_roles(
    "Admin",
    "Store Manager",
)

require_retail_analyst = require_roles(
    "Admin",
    "Retail Analyst",
)

require_marketing_manager = require_roles(
    "Admin",
    "Marketing Manager",
)
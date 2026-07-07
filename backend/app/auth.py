from datetime import datetime, timedelta
from jose import jwt
from jose import JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv
import os
from pathlib import Path
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)
)

bearer_scheme = HTTPBearer(auto_error=False)

ROLE_PERMISSIONS = {
    1: {
        "view_stores": True,
        "create_store": True,
        "view_shelves": True,
        "create_shelf": True,
    },
    2: {
        "view_stores": True,
        "create_store": True,
        "view_shelves": True,
        "create_shelf": True,
    },
    3: {
        "view_stores": True,
        "create_store": False,
        "view_shelves": True,
        "create_shelf": False,
    },
    4: {
        "view_stores": True,
        "create_store": False,
        "view_shelves": True,
        "create_shelf": False,
    },
}

# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ---------------- PASSWORD ----------------

def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# ---------------- JWT ----------------

def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update(
        {
            "exp": expire
        }
    )

    token = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        role_id = int(payload.get("role"))
        permissions = ROLE_PERMISSIONS.get(role_id)

        if permissions is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Role not allowed"
            )

        return {
            "email": payload.get("sub"),
            "role_id": role_id,
            "permissions": permissions,
        }
    except (JWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def require_permission(permission_name: str):
    def dependency(current_user=Depends(get_current_user)):
        if not current_user["permissions"].get(permission_name, False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action"
            )
        return current_user

    return dependency

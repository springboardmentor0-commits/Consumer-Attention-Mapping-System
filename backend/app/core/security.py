from datetime import datetime, timedelta, timezone
from typing import Any, Union
import jwt
from passlib.context import CryptContext

# Configuration
SECRET_KEY = "SUPER_SECRET_GOOGLE_DEVELOPER_KEY_CHANGE_THIS"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

# 🔧 CHANGED HERE: Switch from "bcrypt" to "pbkdf2_sha256" to fix the Python 3.10 bug
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hashes a plain text password safely."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against its stored hash."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(subject: Union[str, Any], role: str) -> str:
    """Generates an encrypted JWT token containing the subject (email) and user role."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "exp": expire, 
        "sub": str(subject), 
        "role": role  
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from typing import Callable

from app.core.db import get_session
from app.core.security import decode_access_token
from app.models.schemas import User, Role

# Configure oauth2_scheme to read from /api/auth/login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
        
    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        raise credentials_exception
        
    return user

def require_role(*allowed_roles: str) -> Callable:
    """
    Dependency factory to check if the current user has one of the allowed roles.
    Raises 403 Forbidden if not.
    """
    def dependency(
        current_user: User = Depends(get_current_user),
        session: Session = Depends(get_session)
    ) -> User:
        role = session.get(Role, current_user.role_id)
        if not role or role.name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for your role"
            )
        return current_user
    return dependency

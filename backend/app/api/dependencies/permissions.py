from fastapi import Depends, HTTPException, status
from app.models.user import User, UserRole
from app.api.dependencies.auth import get_current_active_user

async def require_super_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Require user to be a super admin."""
    if current_user.role != UserRole.super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Requires Super Admin privileges."
        )
    return current_user

async def require_store_manager(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Require user to be at least a store manager or super admin."""
    if current_user.role not in (UserRole.super_admin, UserRole.store_manager):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Requires Store Manager privileges."
        )
    return current_user

async def require_analyst(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Require user to be at least a retail analyst, store manager, or super admin."""
    allowed_roles = (UserRole.super_admin, UserRole.store_manager, UserRole.retail_analyst)
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Requires Retail Analyst privileges."
        )
    return current_user

async def require_marketing_manager(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Require user to be a marketing manager or super admin."""
    if current_user.role not in (UserRole.super_admin, UserRole.marketing_manager):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Requires Marketing Manager privileges."
        )
    return current_user

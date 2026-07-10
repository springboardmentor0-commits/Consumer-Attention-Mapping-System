"""
Authentication routes.

- POST /register        create a new user (self-service; role defaults to
                         retail_analyst unless an admin sets it via /users)
- POST /login           OAuth2-password-flow compatible login, returns JWTs
- POST /refresh         exchange a refresh token for a new access token
- GET  /oauth/login     redirect to the configured OAuth2 provider (Google)
- GET  /oauth/callback  OAuth2 callback that issues app JWTs
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth

from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])

# --- OAuth2 client setup (Google as an example provider) ---
oauth = OAuth()
oauth.register(
    name="google",
    client_id=settings.OAUTH_GOOGLE_CLIENT_ID,
    client_secret=settings.OAUTH_GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not user.hashed_password or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is disabled")

    access_token = create_access_token(subject=str(user.id), role=user.role.value)
    refresh_token = create_refresh_token(subject=str(user.id))
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    import uuid as _uuid

    try:
        user = db.get(User, _uuid.UUID(payload["sub"]))
    except (ValueError, KeyError):
        user = None
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    new_access = create_access_token(subject=str(user.id), role=user.role.value)
    new_refresh = create_refresh_token(subject=str(user.id))
    return Token(access_token=new_access, refresh_token=new_refresh)


@router.get("/oauth/login")
async def oauth_login(request: Request):
    """Redirects the user to the OAuth2 provider's consent screen."""
    redirect_uri = settings.OAUTH_REDIRECT_URL
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/oauth/callback", response_model=Token)
async def oauth_callback(request: Request, db: Session = Depends(get_db)):
    """
    Handles the provider redirect, verifies the identity token, then
    creates the user (first login) or logs them in (subsequent logins).
    """
    token = await oauth.google.authorize_access_token(request)
    userinfo = token.get("userinfo") or {}
    email = userinfo.get("email")
    full_name = userinfo.get("name", email)

    if not email:
        raise HTTPException(status_code=400, detail="OAuth2 provider did not return an email")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            full_name=full_name,
            email=email,
            hashed_password=None,
            is_oauth_user=True,
            oauth_provider="google",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(subject=str(user.id), role=user.role.value)
    refresh_token = create_refresh_token(subject=str(user.id))
    return Token(access_token=access_token, refresh_token=refresh_token)

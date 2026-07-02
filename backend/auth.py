from jose import jwt , JWTError
from datetime import datetime,timedelta

from dotenv import load_dotenv
import os

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)

def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

load_dotenv()

SECRET_KEY=os.getenv("SECRET_KEY")

ALGORITHM=os.getenv("ALGORITHM")


def create_access_token(data:dict):

    payload=data.copy()

    expire=datetime.utcnow()+timedelta(hours=1)

    payload.update({"exp":expire})

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
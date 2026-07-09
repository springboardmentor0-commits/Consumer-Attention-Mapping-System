from sqlmodel import create_engine, Session
from typing import Generator
from app.core.config import settings

if not settings.DATABASE_URL:
    raise ValueError("DATABASE_URL settings is not set in the environment or .env file")

engine = create_engine(
    settings.DATABASE_URL,
    echo=True
)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

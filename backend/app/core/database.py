from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


from sqlalchemy import text



# ==========================================================
# PostgreSQL Connection
# ==========================================================

DATABASE_URL = "postgresql://postgres:suyash@localhost:5432/consumer_mapping"

# ==========================================================
# SQLAlchemy Engine
# ==========================================================

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)




with engine.connect() as conn:
    print(conn.execute(text("SELECT current_database();")).scalar())
    print(conn.execute(text("SELECT inet_server_addr();")).scalar())
    print(conn.execute(text("SELECT inet_server_port();")).scalar())
    print(conn.execute(text("SELECT version();")).scalar())
# ==========================================================
# Session Factory
# ==========================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ==========================================================
# Base Class
# ==========================================================

Base = declarative_base()

# ==========================================================
# Database Dependency
# ==========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()
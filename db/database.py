"""
Database session management - FastAPI dependency pattern
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from utils.config import DB_URL

# Create engine
engine = create_engine(DB_URL)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
def get_db():
    """
    FastAPI dependency that provides a database session.
    Session is automatically closed after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

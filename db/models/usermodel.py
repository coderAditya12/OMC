"""
User model - stores user information
"""
from sqlalchemy import create_engine, String
from sqlalchemy.orm import Mapped, mapped_column
from utils.config import DB_URL

from db.models.base import Base

# Create database engine
try:
    engine = create_engine(DB_URL)
    with engine.connect():
        print("database connection successful")
except Exception as e:
    print("database connection", e)


class User(Base):
    """User table - stores basic user info from GitHub OAuth"""
    __tablename__ = "users"
    
    # Use email as primary key (consistent with chat_sessions.user_id)
    email: Mapped[str] = mapped_column(String(100), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=True)
    image: Mapped[str] = mapped_column(String(500), nullable=True)  # Profile picture URL


def init_db():
    """
    Initialize all database tables.
    We import models here to ensure all models are registered with Base.metadata
    before calling create_all().
    """
    from db.models import chatmodel  # noqa - needed to register ChatSession, ChatMessage
    from db.models import repomodel  # noqa - needed to register Repo
    from db.models import issuemodel  # noqa - needed to register Issue
    
    try:
        Base.metadata.create_all(engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error in init_db: {e}")


# Initialize database tables on module load
init_db()

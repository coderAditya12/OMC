from sqlalchemy import create_engine, String
from utils.config import DB_URL
from sqlalchemy.orm import Mapped, mapped_column, Session

from db.models.base import Base

try:
    engine = create_engine(DB_URL)
    with engine.connect():
        print("database connection successful")
except Exception as e:
    print("database connection", e)


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    email: Mapped[str] = mapped_column(String(100))


def init_db():
    """Initialize all database tables"""
    # Import all models so they're registered with Base.metadata
    from db.models import chatmodel  # noqa
    
    try:
        Base.metadata.create_all(engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error in init_db: {e}")


def create_session():
    return Session(engine)


# Initialize database tables on module load
init_db()

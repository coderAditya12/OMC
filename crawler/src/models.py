from datetime import datetime
from sqlalchemy import create_engine, text, BigInteger, DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session
import os
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv("DATABASE_URL")
engine = create_engine(DB_URL)

try:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
        print("database connection successful!")
except Exception as e:
    print(f"An unexpected error occurred: {e}")


class Base(DeclarativeBase):
    pass


class Issue(Base):
    __tablename__ = "github_issues"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    github_issue_id: Mapped[int] = mapped_column(BigInteger, unique=True)
    title: Mapped[str]
    url: Mapped[str]
    state: Mapped[str]
    body: Mapped[str | None]
    repo_name: Mapped[str]
    createdat: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_At: Mapped[datetime | None] = mapped_column(DateTime, onupdate=func.now())


def init_db():
    print("creating table")
    Base.metadata.create_all(engine)
    print("table created")


def get_session():
    return Session(engine)

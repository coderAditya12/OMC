"""
Issue model - stores cached GitHub issues
"""
from sqlalchemy import String, Integer, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from db.models.base import Base


class Issue(Base):
    """Cached GitHub issues table"""
    __tablename__ = "issues"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    repo_id: Mapped[int] = mapped_column(Integer, ForeignKey("repos.id"), nullable=False)
    github_id: Mapped[int] = mapped_column(Integer, nullable=False)  # GitHub's issue ID
    number: Mapped[int] = mapped_column(Integer, nullable=False)  # Issue number in repo
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=True)
    labels: Mapped[list] = mapped_column(JSON, default=list)  # ["good first issue", "help wanted"]
    difficulty: Mapped[str] = mapped_column(String(20), default="beginner")  # beginner/intermediate/advanced
    html_url: Mapped[str] = mapped_column(String(500), nullable=False)
    is_open: Mapped[bool] = mapped_column(Boolean, default=True)
    comments_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    fetched_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationship to repo
    repo = relationship("Repo", back_populates="issues")
    
    def __repr__(self):
        return f"<Issue #{self.number}: {self.title[:50]}>"

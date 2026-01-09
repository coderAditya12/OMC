"""
Chat model - stores chat history per issue
"""
from sqlalchemy import String, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from db.models.base import Base


class ChatSession(Base):
    """A chat session for a specific issue"""
    __tablename__ = "chat_sessions"
    
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(50))
    issue_url: Mapped[str] = mapped_column(String(500))
    repo_name: Mapped[str] = mapped_column(String(200))
    issue_title: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    """Individual messages in a chat session"""
    __tablename__ = "chat_messages"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(50), ForeignKey("chat_sessions.id"))
    role: Mapped[str] = mapped_column(String(20))  # 'user' or 'assistant'
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

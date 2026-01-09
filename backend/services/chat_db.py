"""
Chat database operations - Helper functions for chat history storage
"""
from sqlalchemy.orm import Session
from db.models.chatmodel import ChatSession, ChatMessage
from datetime import datetime
import uuid


def get_session(db: Session, session_id: str) -> ChatSession | None:
    """Get an existing chat session by ID"""
    return db.query(ChatSession).filter(ChatSession.id == session_id).first()


def create_session(
    db: Session,
    user_id: str,
    issue_url: str,
    repo_name: str,
    issue_title: str
) -> ChatSession:
    """Create a new chat session"""
    session_id = str(uuid.uuid4())
    chat_session = ChatSession(
        id=session_id,
        user_id=user_id,
        issue_url=issue_url,
        repo_name=repo_name,
        issue_title=issue_title,
        created_at=datetime.utcnow()
    )
    db.add(chat_session)
    db.commit()
    db.refresh(chat_session)
    return chat_session


def get_or_create_session(
    db: Session,
    session_id: str | None,
    user_id: str,
    issue_url: str,
    repo_name: str,
    issue_title: str
) -> tuple[ChatSession, bool]:
    """
    Get existing session or create new one.
    Returns (session, is_new) tuple.
    """
    if session_id:
        existing = get_session(db, session_id)
        if existing:
            return existing, False
    
    new_session = create_session(db, user_id, issue_url, repo_name, issue_title)
    return new_session, True


def save_message(db: Session, session_id: str, role: str, content: str) -> ChatMessage:
    """Save a message to the chat history"""
    message = ChatMessage(
        session_id=session_id,
        role=role,
        content=content,
        created_at=datetime.utcnow()
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def get_session_messages(db: Session, session_id: str) -> list[ChatMessage]:
    """Get all messages for a session, ordered by creation time"""
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .all()
    )

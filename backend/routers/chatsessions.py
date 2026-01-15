from fastapi import APIRouter,Depends,HTTPException

from backend.staticmodel.pymodel import ChatRequest
from sqlalchemy.orm import Session
from db.database import get_db
from backend.services.chat_db import get_or_create_session,get_session_messages,save_message,ChatSession
from backend.services.agent import chat,create_agent

router = APIRouter()
@router.get("/chat/sessions/{user_id}")
def get_user_sessions(user_id:str,db:Session = Depends(get_db)):
    """
    get all chat session of a particular user
    """
    sessions = db.query(ChatSession).filter(ChatSession.user_id == user_id).order_by(ChatSession.created_at.desc()).all()

    sessions_list=[]
    for session in sessions:
        sessions_list.append({
            "session_id": session.id,
            "issue_title": session.issue_title,
            "repo_name": session.repo_name,
            "created_at": session.created_at.isoformat()
        })
    return {
        "status":"success",
        "user_id":user_id,
        "sessions":sessions_list
    }
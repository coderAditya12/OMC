from h11._readers import Http10Reader
from fastapi import APIRouter,Depends,HTTPException
from db.database import get_db
from sqlalchemy.orm import Session
from backend.services.chat_db import get_session,get_session_messages
router = APIRouter()
@router.get("/chat/history/{session_id}")
def get_chat_history(session_id:str,db:Session = Depends(get_db)):
    """
    Get all messages for a specific chat session

    """
    session = get_session(db,session_id)
    if not session:
        raise HTTPException(status_code=404,detail="chat session not found")
    messages = get_session_messages(db,session_id)

    message_list=[]
    for msg in messages:
        message_list.append({
            "role":msg.role,
            "content":msg.content,
            "created_at":msg.created_at.isoformat()
        })
    return {
        "status": "success",
        "session_id": session_id,
        "issue_title": session.issue_title,
        "repo_name": session.repo_name,
        "issue_url": session.issue_url,
        "messages": message_list
    }
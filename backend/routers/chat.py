from fastapi import APIRouter, Depends, HTTPException
from backend.staticmodel.pymodel import ChatRequest
from sqlalchemy.orm import Session
from db.database import get_db
from backend.services.chat_db import get_or_create_session, get_session_messages, save_message
from backend.services.agent import chat, create_agent

router = APIRouter()

# In-memory cache for agent sessions
_sessions = {}

@router.post("/chat")
def chat_with_agent(request: ChatRequest, db: Session = Depends(get_db)):
    """Chat with AI agent about a specific issue."""
    
    issue = {
        "title": request.issue_title,
        "body": request.issue_body,
        "labels": request.issue_labels
    }
    
    try:
        # Get or create database session
        chat_session, is_new = get_or_create_session(
            db=db,
            session_id=request.session_id,
            user_id=request.user_email,
            issue_url=request.issue_url,
            issue_title=request.issue_title,
            repo_name=request.repo_name
        )
        session_id = chat_session.id
        
        # Check if agent already exists in memory
        if session_id in _sessions:
            compiled_agent, state = _sessions[session_id]
        else:
            # Create new agent
            compiled_agent, state = create_agent(
                issue=issue,
                repo_name=request.repo_name,
                access_token=request.access_token,
                system_prompt=request.system_prompt
            )
            
            # Load previous messages if session exists in DB
            if not is_new:
                db_messages = get_session_messages(db, session_id)
        
        # Save user message
        save_message(db, session_id, "user", request.message)
        
        # Call the AI agent
        response, updated_messages = chat(
            agent=compiled_agent,
            state=state,
            user_message=request.message
        )
        
        # Save assistant response
        save_message(db, session_id, "assistant", response)
        
        # Update state and cache
        state["messages"] = updated_messages
        _sessions[session_id] = (compiled_agent, state)
        
        return {
            "status": "success",
            "session_id": session_id,
            "response": response
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
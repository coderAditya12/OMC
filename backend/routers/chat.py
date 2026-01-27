from fastapi import APIRouter, Depends, HTTPException
from backend.staticmodel.pymodel import ChatRequest
from sqlalchemy.orm import Session
from db.database import get_db
from backend.services.chat_db import get_or_create_session, get_session_messages, save_message
from backend.services.agent import chat, create_agent
from langchain_core.messages import HumanMessage, AIMessage
import logging
import traceback

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory cache for agent sessions
_sessions = {}


def restore_messages_from_db(db_messages) -> list:
    """
    Convert database messages to LangChain message format.
    This allows the agent to remember previous conversation.
    """
    langchain_messages = []
    for msg in db_messages:
        if msg.role == "user":
            langchain_messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            langchain_messages.append(AIMessage(content=msg.content))
    return langchain_messages


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
            logger.info(f"Reusing cached agent for session {session_id}")
        else:
            # Create new agent
            logger.info(f"Creating new agent for session {session_id}")
            compiled_agent, state = create_agent(
                issue=issue,
                repo_name=request.repo_name,
                access_token=request.access_token,
                system_prompt=request.system_prompt
            )
            logger.info("Agent created successfully")
            
            # Restore previous messages if session exists in DB
            # This is the KEY fix - convert DB messages to LangChain format
            if not is_new:
                db_messages = get_session_messages(db, session_id)
                if db_messages:
                    restored_messages = restore_messages_from_db(db_messages)
                    state["messages"].extend(restored_messages)
                    logger.info(f"Restored {len(restored_messages)} messages from database")
            
            # Cache the agent
            _sessions[session_id] = (compiled_agent, state)
        
        # Save user message
        save_message(db, session_id, "user", request.message)
        
        # Call the AI agent
        logger.info(f"Calling AI agent with message: {request.message[:50]}...")
        response, updated_messages = chat(
            agent=compiled_agent,
            state=state,
            user_message=request.message
        )
        logger.info(f"Agent responded with {len(response)} characters")
        
        # Save assistant response
        save_message(db, session_id, "assistant", response)
        
        # Update state and cache
        state["messages"] = updated_messages
        _sessions[session_id] = (compiled_agent, state)
        
        return {
            "status": "success",
            "session_id": session_id,
            "response": response,
            "message_count": len(updated_messages)  # Useful for debugging
        }
        
    except Exception as e:
        logger.error(f"Chat error: {type(e).__name__}: {str(e)}")
        logger.error(f"Full traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")
"""
OpenSource Compass - Backend API
Clean, modular FastAPI server
"""
from fastapi import FastAPI, HTTPException, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.services import github, profile, matcher, agent, chat_db
from db.database import get_db
from backend.routers import auth,recommend,chat,chathistory


# Initialize FastAPI
app = FastAPI(title="OpenSource Compass API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://opensource-compass.vercel.app"],
    allow_methods=["*"],
    allow_credentials=False,
    allow_headers=["*"],
)


# In-memory session storage (will move to PostgreSQL)
_sessions = {}






# Routes
@app.get("/")
def health():
    return {"status": "healthy"}

app.include_router(auth.router)
app.include_router(recommend.router)
app.include_router(chat.router)
app.include_router(chathistory.router)

# @app.post("/chat")
# def chat_with_agent(request: ChatRequest, db: Session = Depends(get_db)):
#     """
#     Chat with AI agent about a specific issue.
#     Stores chat history in PostgreSQL.
#     """
#     issue = {
#         "title": request.issue_title,
#         "body": request.issue_body,
#         "labels": request.issue_labels
#     }
    
#     try:
#         # Get or create chat session in database
#         chat_session, is_new = chat_db.get_or_create_session(
#             db=db,
#             session_id=request.session_id,
#             user_id=request.user_email,  # Using email as user identifier
#             issue_url=request.issue_url,
#             repo_name=request.repo_name,
#             issue_title=request.issue_title
#         )
#         session_id = chat_session.id
        
#         # Check for existing agent in memory cache
#         if session_id in _sessions:
#             compiled_agent, state = _sessions[session_id]
#         else:
#             # Create new agent
#             compiled_agent, state = agent.create_agent(
#                 issue=issue,
#                 repo_name=request.repo_name,
#                 access_token=request.access_token,
#                 system_prompt=request.system_prompt
#             )
            
#             # If session exists in DB but not memory, load previous messages
#             if not is_new:
#                 db_messages = chat_db.get_session_messages(db, session_id)
#                 # Messages are loaded into agent context on first response
        
#         # Save user message to database
#         chat_db.save_message(db, session_id, "user", request.message)
        
#         # Chat with agent
#         response, updated_messages = agent.chat(
#             agent=compiled_agent,
#             state=state,
#             user_message=request.message
#         )
        
#         # Save AI response to database
#         chat_db.save_message(db, session_id, "assistant", response)
        
#         # Update session state in memory cache
#         state["messages"] = updated_messages
#         _sessions[session_id] = (compiled_agent, state)
        
#         return {
#             "status": "success",
#             "session_id": session_id,
#             "response": response
#         }
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# GET Routes for Chat History
# ==========================================

# @app.get("/chat/history/{session_id}")
# def get_chat_history(session_id: str, db: Session = Depends(get_db)):
#     """
#     Get all messages for a specific chat session.
    
#     This is used to load previous messages when the user returns to a chat.
#     """
#     # Step 1: Get the session from database
#     session = chat_db.get_session(db, session_id)
    
#     # Step 2: Check if session exists
#     if not session:
#         raise HTTPException(status_code=404, detail="Chat session not found")
    
#     # Step 3: Get all messages for this session
#     messages = chat_db.get_session_messages(db, session_id)
    
#     # Step 4: Convert messages to a simple list format
#     message_list = []
#     for msg in messages:
#         message_list.append({
#             "role": msg.role,
#             "content": msg.content,
#             "created_at": msg.created_at.isoformat()
#         })
    
#     # Step 5: Return the response
#     return {
#         "status": "success",
#         "session_id": session_id,
#         "issue_title": session.issue_title,
#         "repo_name": session.repo_name,
#         "messages": message_list
#     }


@app.get("/chat/sessions/{user_id}")
def get_user_sessions(user_id: str, db: Session = Depends(get_db)):
    """
    Get all chat sessions for a specific user.
    
    This is used to show a list of previous conversations in the sidebar.
    """
    # Step 1: Query all sessions for this user
    sessions = db.query(chat_db.ChatSession).filter(
        chat_db.ChatSession.user_id == user_id
    ).order_by(
        chat_db.ChatSession.created_at.desc()
    ).all()
    
    # Step 2: Convert sessions to a simple list format
    session_list = []
    for session in sessions:
        session_list.append({
            "session_id": session.id,
            "issue_title": session.issue_title,
            "repo_name": session.repo_name,
            "created_at": session.created_at.isoformat()
        })
    
    # Step 3: Return the response
    return {
        "status": "success",
        "user_id": user_id,
        "sessions": session_list
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)

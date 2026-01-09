"""
OpenSource Compass - Backend API
Clean, modular FastAPI server
"""
from fastapi import FastAPI, HTTPException, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import uuid

from backend.services import github, profile, matcher, agent, chat_db
from db.database import get_db


# Initialize FastAPI
app = FastAPI(title="OpenSource Compass API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_credentials=True,
    allow_headers=["*"],
)


# In-memory session storage (will move to PostgreSQL)
_sessions = {}


# Request/Response Models
class AuthRequest(BaseModel):
    id: str
    name: str | None = None
    email: str | None = None
    image: str | None = None
    accessToken: str | None = None


class RecommendRequest(BaseModel):
    access_token: str


class ChatRequest(BaseModel):
    access_token: str
    user_id: str  # GitHub user ID for session tracking
    session_id: str | None = None
    repo_name: str
    issue_url: str  # Full URL to the issue
    issue_title: str
    issue_body: str
    issue_labels: list[str] = []
    message: str
    system_prompt: str | None = None


# Routes
@app.get("/")
def health():
    return {"status": "healthy"}


@app.post("/auth/github")
def auth_github(data: AuthRequest, response: Response):
    """Handle GitHub OAuth callback"""
    return {
        "status": "success",
        "user": {
            "id": data.id,
            "name": data.name,
            "email": data.email
        }
    }


@app.post("/recommend")
def get_recommendations(request: RecommendRequest):
    """Get issue recommendations based on user's GitHub profile"""
    token = request.access_token
    
    user = github.get_user(token)
    if not user:
        raise HTTPException(status_code=400, detail="Failed to fetch user")
    
    username = user["username"]
    repos = github.get_repos(token)
    user_repos = profile.filter_repos(repos, username)
    
    if not user_repos:
        raise HTTPException(status_code=400, detail="No repos found")
    
    user_profile = profile.create_profile(user_repos, username)
    languages = [l["language"] for l in user_profile["languages"]["all"]]
    if not languages:
        languages = ["Python", "JavaScript"]
    
    all_issues = []
    for lang in languages[:3]:
        repos_with_issues = github.search_repos(lang, per_page=3, access_token=token)
        for repo in repos_with_issues:
            issues = github.get_issues(repo["full_name"], per_page=5, access_token=token)
            for issue in issues:
                issue["language"] = lang
                issue["repo_stars"] = repo["stars"]
            all_issues.extend(issues)
    
    recommendations = matcher.match_issues(all_issues, user_profile, top_n=10)
    
    return {
        "status": "success",
        "profile": {
            "username": username,
            "primary_language": user_profile["languages"]["primary"],
            "experience_level": user_profile["experience"]["level"],
            "interests": user_profile["interests"]
        },
        "recommendations": recommendations
    }


@app.post("/chat")
def chat_with_agent(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Chat with AI agent about a specific issue.
    Stores chat history in PostgreSQL.
    """
    issue = {
        "title": request.issue_title,
        "body": request.issue_body,
        "labels": request.issue_labels
    }
    
    try:
        # Get or create chat session in database
        chat_session, is_new = chat_db.get_or_create_session(
            db=db,
            session_id=request.session_id,
            user_id=request.user_id,
            issue_url=request.issue_url,
            repo_name=request.repo_name,
            issue_title=request.issue_title
        )
        session_id = chat_session.id
        
        # Check for existing agent in memory cache
        if session_id in _sessions:
            compiled_agent, state = _sessions[session_id]
        else:
            # Create new agent
            compiled_agent, state = agent.create_agent(
                issue=issue,
                repo_name=request.repo_name,
                access_token=request.access_token,
                system_prompt=request.system_prompt
            )
            
            # If session exists in DB but not memory, load previous messages
            if not is_new:
                db_messages = chat_db.get_session_messages(db, session_id)
                # Messages are loaded into agent context on first response
        
        # Save user message to database
        chat_db.save_message(db, session_id, "user", request.message)
        
        # Chat with agent
        response, updated_messages = agent.chat(
            agent=compiled_agent,
            state=state,
            user_message=request.message
        )
        
        # Save AI response to database
        chat_db.save_message(db, session_id, "assistant", response)
        
        # Update session state in memory cache
        state["messages"] = updated_messages
        _sessions[session_id] = (compiled_agent, state)
        
        return {
            "status": "success",
            "session_id": session_id,
            "response": response
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)


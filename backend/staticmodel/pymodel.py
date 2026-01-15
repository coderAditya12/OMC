from pydantic import BaseModel
class AuthRequest(BaseModel):
    name: str | None = None
    email: str 
    image: str | None = None
    accessToken: str 
class RecommendRequest(BaseModel):
    access_token: str
    user_email: str | None = None  # User's email for filtering chatted issues

class ChatRequest(BaseModel):
    access_token: str
    user_email: str  # User's email for session tracking
    session_id: str | None = None
    repo_name: str
    issue_url: str  # Full URL to the issue
    issue_title: str
    issue_body: str
    issue_labels: list[str] = []
    message: str
    system_prompt: str | None = None
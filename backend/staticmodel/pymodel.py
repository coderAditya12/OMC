from pydantic import BaseModel
class AuthRequest(BaseModel):
    name: str | None = None
    email: str 
    image: str | None = None
    accessToken: str 
class RecommendRequest(BaseModel):
    access_token: str
    user_email: str | None = None  # User's email for filtering chatted issues
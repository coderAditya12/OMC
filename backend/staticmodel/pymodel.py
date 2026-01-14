from pydantic import BaseModel
class AuthRequest(BaseModel):

    name: str | None = None
    email: str 
    image: str | None = None
    accessToken: str 
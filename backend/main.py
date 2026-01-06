from fastapi import FastAPI, HTTPException,Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from utils.config import jwt_secret
from db.models.usermodel import create_sesseion,User
import uvicorn
import jwt

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend origin
    allow_methods=["*"],
    allow_credentials=True,
    allow_headers=["*"],
)


class GitHubAuthData(BaseModel):
    id: str
    name: str | None = None
    email: str | None = None
    image: str | None = None
    accessToken: str | None = None
session = create_sesseion()

class LoginResponse(BaseModel):
    id:str
    name:str
    email:str
def encoded_func(data: GitHubAuthData):
    encoded_jwt = jwt.encode({"email": data.email, "AccessToken": data.accessToken}, jwt_secret, algorithm="HS256")
    return encoded_jwt
    
    
@app.get("/")
def root():
    return "server is healthy"

@app.post("/auth/github")
def receive_github_auth(data: GitHubAuthData, response: Response):
    """
    Receives GitHub authentication data from the frontend.
    Prints all the data for debugging.
    """
    print("=" * 50)
    print("🔐 GitHub Auth Data Received:")
    print(f"   ID: {data.id}")
    print(f"   Name: {data.name}")
    print(f"   Email: {data.email}")
    print(f"   Image: {data.image}")
    print(f"   Access Token:{ data.accessToken}")
    print("=" * 50)
    # Check if user exists in database
    exist_user = session.execute(select(User).where(User.email == data.email)).scalars().first()
    if exist_user:
        response.set_cookie(key="user_token", value=encoded_func(data))
        return {"status": "success", "response": {
            "id": data.id,
            "email": data.email,
            "name": data.name
        }}
    create_user= User(
        id=data.id,
        email=data.email,
        name=data.name,
    )
    session.add(create_user)
    session.commit()
    response.set_cookie(key="user_token", value=encoded_func(data))
    return {"status": "success", "response": {
        "id": data.id,
        "email": data.email,
        "name": data.name
    }}
if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)

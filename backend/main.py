from fastapi import FastAPI, HTTPException,Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from core.config import jwt_secret
import uvicorn
import jwt

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_credentials=False,
    allow_headers=["*"],
)


class GitHubAuthData(BaseModel):
    id: str
    name: str | None = None
    email: str | None = None
    image: str | None = None
    accessToken: str | None = None

class LoginResponse(BaseModel):
    id:str
    name:str
    email:str
@app.get("/")
def root():
    return "server is healthy"

@app.post("/auth/github")
def receive_github_auth(data: GitHubAuthData,Response:Response):
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
    print(f"   Access Token: {data.accessToken[:20]}..." if data.accessToken else "   Access Token: None")
    print("=" * 50)
    #TODO:send user data into database
    encoded_jwt = jwt.encode({"email":data.email,"AccessToken":data.accessToken},jwt_secret,algorithm="HS256")
    print("encoded_jwt",encoded_jwt)
    Response.set_cookie(key="user_token",value=encoded_jwt)
    return
    
    return {"status": "success","response":{
        "id":data.id,
        "email":data.email,
        "name":data.name
    }}
if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)

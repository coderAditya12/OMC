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


class RecommendRequest(BaseModel):
    access_token: str


@app.post("/recommend")
def get_recommendations(request: RecommendRequest):
    """
    Get issue recommendations based on user's GitHub profile.
    
    1. Fetch user repos using access_token
    2. Create user profile
    3. Fetch matching issues
    4. Return top 10 matches
    """
    from backend.test import filter_repo_data, create_user_profile, get_user_info
    from backend.issues import get_recommendations as get_issue_recommendations
    import requests
    
    headers = {
        "Authorization": f"Bearer {request.access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }
    
    try:
        # Get user info
        user_response = requests.get("https://api.github.com/user", headers=headers)
        user_response.raise_for_status()
        user_data = user_response.json()
        username = user_data.get('login')
        
        # Get user repos
        repos_response = requests.get(
            "https://api.github.com/user/repos",
            headers=headers,
            params={'per_page': 100}
        )
        repos_response.raise_for_status()
        all_repos = repos_response.json()
        
        # Filter and create profile
        user_repos = filter_repo_data(all_repos, username)
        profile = create_user_profile(user_repos, username)
        
        # Get recommendations
        recommendations = get_issue_recommendations(profile, top_n=10)
        
        return {
            "status": "success",
            "profile": {
                "username": username,
                "primary_language": profile.get('languages', {}).get('primary'),
                "experience_level": profile.get('experience', {}).get('level'),
                "interests": profile.get('interests', [])
            },
            "recommendations": recommendations
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)


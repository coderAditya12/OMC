"""
OpenSource Compass - Backend API
Clean, modular FastAPI server
"""
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.services import github, profile, matcher


# Initialize FastAPI
app = FastAPI(title="OpenSource Compass API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_credentials=True,
    allow_headers=["*"],
)


# Request/Response Models
class AuthRequest(BaseModel):
    id: str
    name: str | None = None
    email: str | None = None
    image: str | None = None
    accessToken: str | None = None


class RecommendRequest(BaseModel):
    access_token: str


# Routes
@app.get("/")
def health():
    return {"status": "healthy"}


@app.post("/auth/github")
def auth_github(data: AuthRequest, response: Response):
    """Handle GitHub OAuth callback"""
    # For now, just return success
    # TODO: Add database storage when needed
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
    """
    Get issue recommendations based on user's GitHub profile
    
    1. Fetch user info & repos
    2. Build user profile
    3. Search for issues matching languages
    4. Score and rank issues
    5. Return top matches
    """
    token = request.access_token
    
    # Step 1: Get user info
    user = github.get_user(token)
    if not user:
        raise HTTPException(status_code=400, detail="Failed to fetch user")
    
    username = user["username"]
    
    # Step 2: Get and filter repos
    repos = github.get_repos(token)
    user_repos = profile.filter_repos(repos, username)
    
    if not user_repos:
        raise HTTPException(status_code=400, detail="No repos found")
    
    # Step 3: Create profile
    user_profile = profile.create_profile(user_repos, username)
    
    # Step 4: Get languages to search
    languages = [l["language"] for l in user_profile["languages"]["all"]]
    if not languages:
        languages = ["Python", "JavaScript"]
    
    # Step 5: Fetch issues for each language
    all_issues = []
    for lang in languages[:3]:
        repos_with_issues = github.search_repos(lang, per_page=3, access_token=token)
        for repo in repos_with_issues:
            issues = github.get_issues(repo["full_name"], per_page=5, access_token=token)
            for issue in issues:
                issue["language"] = lang
                issue["repo_stars"] = repo["stars"]
            all_issues.extend(issues)
    
    # Step 6: Match and rank
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)

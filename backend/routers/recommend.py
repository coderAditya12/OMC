from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.staticmodel.pymodel import RecommendRequest
from backend.services.github import get_user, get_repos, search_repos, get_issues
from backend.services.profile import filter_repos, create_profile
from backend.services.matcher import match_issues
from backend.services.chat_db import ChatSession
from db.database import get_db

router = APIRouter()

@router.post("/recommend")
def get_recommendations(request: RecommendRequest, db: Session = Depends(get_db)):
    """Get issue recommendations based on user's GitHub profile."""
    
    token = request.access_token
    
    # Fetch user from GitHub
    user = get_user(token)
    if not user:
        raise HTTPException(status_code=400, detail="Failed to fetch user from GitHub")
    
    username = user["username"]
    
    # Fetch and filter user's repositories
    all_repos = get_repos(token)
    user_repos = filter_repos(all_repos, username)
    if not user_repos:
        raise HTTPException(status_code=400, detail="No repos found for user")
    
    # Create user profile
    user_profile = create_profile(user_repos, username)
    
    # Extract languages
    all_language = user_profile["languages"]["all"]
    languages = [lang_info["language"] for lang_info in all_language]
    if not languages:
        languages = ["Python", "JavaScript"]
    
    # Search for repos with good first issues
    all_issues = []
    top_languages = languages[:3]
    missing_languages = []  # Track languages with no issues
    
    for lang in top_languages:
        matching_repos = search_repos(lang, token, per_page=3)
        lang_issues = []  # Track issues for this language
        
        for repo in matching_repos:
            repo_name = repo["full_name"]
            repo_stars = repo["stars"]
            issues = get_issues(repo_name, per_page=5, access_token=token)
            
            for issue in issues:
                issue["language"] = lang
                issue["repo_stars"] = repo_stars
            lang_issues.extend(issues)
        
        # Check if this language returned any issues
        if len(lang_issues) == 0:
            missing_languages.append(lang)
        else:
            all_issues.extend(lang_issues)
    
    # Filter out already chatted issues
    chatted_issue_urls = set()
    if request.user_email:
        user_sessions = db.query(ChatSession).filter(ChatSession.user_id == request.user_email).all()
        for session in user_sessions:
            chatted_issue_urls.add(session.issue_url)
    
    filtered_issues = [issue for issue in all_issues if issue.get("url") not in chatted_issue_urls]
    
    # Match and rank issues
    recommendations = match_issues(filtered_issues, user_profile)
    
    return {
        "status": "success",
        "profile": {
            "username": username,
            "primary_language": user_profile["languages"]["primary"],
            "experience_level": user_profile["experience"]["level"],
            "interests": user_profile["interests"]
        },
        "recommendations": recommendations,
        "missing_languages": missing_languages,
        "filtered_count": len(chatted_issue_urls)
    }

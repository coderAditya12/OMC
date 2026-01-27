from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.staticmodel.pymodel import RecommendRequest
from backend.services.github import get_user, get_repos
from backend.services.profile import filter_repos, create_profile
from backend.services.matcher import match_issues
from backend.services.chat_db import ChatSession
from backend.services.cached_issues import (
    get_issues_by_languages,
    get_popular_issues,
    check_data_freshness
)
from db.database import get_db

router = APIRouter()

# Default languages for new users with no repos
DEFAULT_LANGUAGES = ["Python", "JavaScript", "TypeScript"]


@router.post("/recommend")
def get_recommendations(request: RecommendRequest, db: Session = Depends(get_db)):
    """Get issue recommendations based on user's GitHub profile."""
    
    token = request.access_token
    is_new_user = False
    fallback_used = False
    
    # Fetch user from GitHub (still needed for authentication)
    user = get_user(token)
    if not user:
        raise HTTPException(status_code=400, detail="Failed to fetch user from GitHub")
    
    username = user["username"]
    
    # Fetch and filter user's repositories
    all_repos = get_repos(token)
    user_repos = filter_repos(all_repos, username)
    
    # 6.6: Graceful handling for users with 0 repos
    if not user_repos:
        is_new_user = True
        languages = DEFAULT_LANGUAGES
        user_profile = {
            "languages": {"primary": None, "all": []},
            "experience": {"level": "beginner"},
            "interests": []
        }
    else:
        # Create user profile
        user_profile = create_profile(user_repos, username)
        
        # Extract languages
        all_language = user_profile["languages"]["all"]
        languages = [lang_info["language"] for lang_info in all_language]
        if not languages:
            languages = DEFAULT_LANGUAGES
    
    # Get issues from PostgreSQL cache (NOT GitHub API!)
    top_languages = languages[:3]
    all_issues, missing_languages = get_issues_by_languages(
        top_languages, db, per_language=15
    )
    
    # 6.1: Fallback to popular issues if all languages return empty
    if not all_issues:
        all_issues = get_popular_issues(db, limit=30)
        fallback_used = True
        missing_languages = top_languages  # All were missing
    
    # Filter out already chatted issues
    chatted_issue_urls = set()
    if request.user_email:
        user_sessions = db.query(ChatSession).filter(ChatSession.user_id == request.user_email).all()
        for session in user_sessions:
            chatted_issue_urls.add(session.issue_url)
    
    filtered_issues = [issue for issue in all_issues if issue.get("html_url") not in chatted_issue_urls]
    
    # Match and rank issues
    recommendations = match_issues(filtered_issues, user_profile)
    
    # 6.2: Check data freshness
    freshness = check_data_freshness(db)
    
    response = {
        "status": "success",
        "profile": {
            "username": username,
            "primary_language": user_profile["languages"]["primary"] if not is_new_user else None,
            "experience_level": user_profile["experience"]["level"],
            "interests": user_profile["interests"] if not is_new_user else []
        },
        "recommendations": recommendations,
        "missing_languages": missing_languages,
        "filtered_count": len(chatted_issue_urls),
        "data_freshness": freshness
    }
    
    # Add flags for edge cases
    if is_new_user:
        response["is_new_user"] = True
        response["message"] = "Welcome! We've selected popular beginner issues for you."
    
    if fallback_used:
        response["fallback_used"] = True
        response["message"] = "Showing popular issues across all languages."
    
    return response


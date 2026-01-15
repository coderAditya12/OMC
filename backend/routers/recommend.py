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
def get_recommendations(request:RecommendRequest,db:Session=Depends(get_db)):
    "get issue recommendationos based on user's GitHub profile."
    print("[DEBUG] Request body:", request)
    token = request.access_token
    print(f"[DEBUG] Token received: {token[:15]}..." if token else "[DEBUG] No token!")
    
    user = get_user(token)
    print(f"[DEBUG] User from GitHub: {user}")
    if not user:
        raise HTTPException(status_code=400, detail="failed to fetch user from GitHub")
    
    username = user["username"]
    get_user_repos = get_repos(token)
    print(f"[DEBUG] Repos count: {len(get_user_repos) if get_user_repos else 0}")
    
    user_repos = filter_repos(get_user_repos,username)
    if not user_repos:
        raise HTTPException(status_code=400, detail="no repos found for user")
    
    user_profile = create_profile(user_repos,username)

    all_language = user_profile["languages"]["all"]
    languages = []
    for lang_info in all_language:
        languages.append(lang_info["language"])
    if not languages:
        languages=["Python","Javascript"]
    
    all_Issues = []
    top_langugages= languages[:3]
    for lang in top_langugages:
        matching_repos = search_repos(lang,token,per_page=3)
        #Get issues from each repo
        for repo in matching_repos:
            repo_name = repo["full_name"]
            repo_stars = repo["stars"]
            issues = get_issues(repo_name, per_page=5, access_token=token)

            for issue in issues:
                issue["language"]= lang
                issue["repo_stars"]= repo_stars
        all_Issues.extend(issues)

    chatted_issue_urls = set()
    if request.user_email:
        user_sessions = db.query(ChatSession).filter(ChatSession.user_id== request.user_email).all()
        for session in user_sessions:
            chatted_issue_urls.add(session.issue_url)
        print(f"User {request.user_email} has chatted about{len(chatted_issue_urls)}")
    filtered_issues=[]
    for issue in all_Issues:
        issue_url = issue.get("url")
        if issue_url not in chatted_issue_urls:
            filtered_issues.append(issue)
    print(f"[DEBUG] Before filter: {len(all_Issues)}, After filter: {len(filtered_issues)}")
    
    # Match and rank issues by user profile
    recommendations = match_issues(filtered_issues, user_profile, top_n=10)
    
    # Step 8: Return response
    return {
        "status": "success",
        "profile": {
            "username": username,
            "primary_language": user_profile["languages"]["primary"],
            "experience_level": user_profile["experience"]["level"],
            "interests": user_profile["interests"]
        },
        "recommendations": recommendations,
        "filtered_count": len(chatted_issue_urls)
    }






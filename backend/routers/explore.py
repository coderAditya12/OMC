"""
Explore Issues API - Browse all issues from database with filters
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List

from db.database import get_db
from db.models.issuemodel import Issue
from db.models.repomodel import Repo

router = APIRouter()


@router.get("/issues")
def get_all_issues(
    language: Optional[str] = Query(None, description="Filter by language"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """
    Get all issues with optional language filter and pagination.
    Returns issues with repo info for the explore page.
    """
    # Base query - join with repos to get language info
    query = db.query(Issue).join(Repo).filter(Issue.is_open == True, Repo.is_active == True)
    
    # Filter by language if provided
    if language and language.lower() != "all":
        query = query.filter(func.lower(Repo.language) == language.lower())
    
    # Get total count for pagination
    total = query.count()
    
    # Apply pagination
    issues = query.order_by(Issue.updated_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    # Format response
    issues_list = []
    for issue in issues:
        issues_list.append({
            "id": issue.id,
            "github_id": issue.github_id,
            "number": issue.number,
            "title": issue.title,
            "body": issue.body[:300] if issue.body else "",
            "labels": issue.labels or [],
            "difficulty": issue.difficulty,
            "html_url": issue.html_url,
            "comments_count": issue.comments_count,
            "repo_name": issue.repo.full_name,
            "language": issue.repo.language,
            "stars": issue.repo.stars,
            "updated_at": issue.updated_at.isoformat() if issue.updated_at else None
        })
    
    return {
        "status": "success",
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
        "issues": issues_list
    }


@router.get("/issues/languages")
def get_available_languages(db: Session = Depends(get_db)):
    """
    Get list of all available languages with issue counts.
    """
    # Query distinct languages with counts
    results = db.query(
        Repo.language,
        func.count(Issue.id).label("count")
    ).join(Issue).filter(
        Issue.is_open == True,
        Repo.is_active == True,
        Repo.language.isnot(None)
    ).group_by(Repo.language).order_by(func.count(Issue.id).desc()).all()
    
    languages = [{"name": lang, "count": count} for lang, count in results if lang]
    
    return {
        "status": "success",
        "languages": languages
    }

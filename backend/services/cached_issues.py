"""
Cached Issues Service

Fetches issues from PostgreSQL with Redis caching layer.
Replaces direct GitHub API calls for issue discovery.

Usage:
    from backend.services.cached_issues import get_issues_by_language
    
    issues = get_issues_by_language("Python", db, limit=30)
"""
import logging
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from db.models.repomodel import Repo
from db.models.issuemodel import Issue
from backend.services.cache import (
    get_cached_hot_issues, 
    cache_hot_issues,
    get_redis_client
)

logger = logging.getLogger(__name__)


def issue_to_dict(issue: Issue) -> Dict:
    """Convert Issue ORM object to dict format expected by matcher."""
    return {
        "title": issue.title,
        "body": issue.body or "",
        "labels": issue.labels or [],
        "html_url": issue.html_url,
        "url": issue.html_url,  # Alias for compatibility
        "comments": issue.comments_count,
        "comments_count": issue.comments_count,
        "language": issue.repo.language,
        "repo": issue.repo.full_name,
        "repo_stars": issue.repo.stars,
        "difficulty": issue.difficulty,
        "number": issue.number,
        "is_open": issue.is_open
    }


def get_issues_by_language(
    language: str, 
    db: Session, 
    limit: int = 30,
    use_cache: bool = True
) -> List[Dict]:
    """
    Get open issues for a language from PostgreSQL, with Redis caching.
    
    Args:
        language: Programming language to filter by (case-insensitive)
        db: SQLAlchemy session
        limit: Maximum issues to return
        use_cache: Whether to use Redis cache
        
    Returns:
        List of issue dicts ready for matcher
    """
    cache_key = language.lower()
    
    # 1. Try Redis cache first
    if use_cache:
        cached = get_cached_hot_issues(cache_key)
        if cached:
            logger.debug(f"🎯 Cache HIT for {language} ({len(cached)} issues)")
            return cached[:limit]
    
    # 2. Query PostgreSQL
    logger.debug(f"📦 Cache MISS for {language}, querying DB...")
    
    issues = (
        db.query(Issue)
        .join(Repo)
        .filter(
            Repo.is_active == True,
            Repo.language.ilike(language),  # Case-insensitive match
            Issue.is_open == True
        )
        .order_by(
            Repo.stars.desc(),  # Prioritize popular repos
            Issue.updated_at.desc()  # Recent issues first
        )
        .limit(limit * 2)  # Fetch extra for diversity
        .all()
    )
    
    # 3. Convert to dict format
    result = [issue_to_dict(issue) for issue in issues][:limit]
    
    # 4. Cache in Redis
    if use_cache and result:
        cache_hot_issues(cache_key, result)
        logger.debug(f"💾 Cached {len(result)} issues for {language}")
    
    return result


def get_issues_by_languages(
    languages: List[str],
    db: Session,
    per_language: int = 15
) -> tuple[List[Dict], List[str]]:
    """
    Get issues for multiple languages.
    
    Returns:
        (all_issues, missing_languages) - issues found, languages with no results
    """
    all_issues = []
    missing_languages = []
    
    for lang in languages:
        issues = get_issues_by_language(lang, db, limit=per_language)
        if issues:
            all_issues.extend(issues)
        else:
            missing_languages.append(lang)
    
    return all_issues, missing_languages


def get_available_languages(db: Session) -> List[Dict]:
    """Get list of languages with issue counts."""
    result = (
        db.query(
            Repo.language,
            func.count(Issue.id).label("issue_count")
        )
        .join(Issue)
        .filter(
            Repo.is_active == True,
            Issue.is_open == True,
            Repo.language.isnot(None)
        )
        .group_by(Repo.language)
        .order_by(func.count(Issue.id).desc())
        .all()
    )
    
    return [
        {"language": lang, "issue_count": count}
        for lang, count in result
    ]


def warm_cache(db: Session, top_n: int = 10):
    """Pre-warm cache for top languages."""
    logger.info("🔥 Warming issue cache...")
    
    top_langs = get_available_languages(db)[:top_n]
    
    for lang_info in top_langs:
        lang = lang_info["language"]
        get_issues_by_language(lang, db, limit=30, use_cache=True)
        logger.info(f"  ✅ Cached: {lang}")
    
    logger.info(f"🔥 Cache warmed for {len(top_langs)} languages")

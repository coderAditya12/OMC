"""
Issue Syncer - Fetches and stores GitHub issues for cached repos

Usage:
    python -m backend.services.issue_syncer
    python -m backend.services.issue_syncer --repo "owner/repo"  # Sync single repo
    python -m backend.services.issue_syncer --limit 10  # Limit repos to sync

This script:
1. Loops through all repos in PostgreSQL
2. Fetches open issues with beginner-friendly labels from GitHub
3. Stores/updates issues in PostgreSQL
"""
import logging
import requests
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Dict
import time
import sys

from db.database import get_db
from db.models.repomodel import Repo
from db.models.issuemodel import Issue
from utils.config import GITHUB_ACCESS_TOKEN

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)


# Labels to fetch (from centralized constants)
from utils.constants import SYNC_LABELS as ISSUE_LABELS, MAX_ISSUES_PER_REPO


def get_headers() -> dict:
    """Get GitHub API headers"""
    return {
        "Authorization": f"token {GITHUB_ACCESS_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }


def detect_difficulty(labels: List[str]) -> str:
    """Detect difficulty level from issue labels"""
    labels_lower = [l.lower() for l in labels]
    
    beginner_patterns = ["good first issue", "beginner", "easy", "starter", "first-timers", "up-for-grabs"]
    advanced_patterns = ["complex", "architecture", "performance", "security", "difficult"]
    
    for pattern in beginner_patterns:
        if any(pattern in label for label in labels_lower):
            return "beginner"
    
    for pattern in advanced_patterns:
        if any(pattern in label for label in labels_lower):
            return "advanced"
    
    return "intermediate"


def fetch_issues_from_github(repo_full_name: str) -> List[Dict]:
    """
    Fetch issues from GitHub for a single repo.
    Returns list of issue dicts.
    """
    logger.debug(f"  📡 Fetching issues for {repo_full_name}")
    
    all_issues = {}  # Dedupe by issue ID
    
    for label in ISSUE_LABELS:
        try:
            response = requests.get(
                f"https://api.github.com/repos/{repo_full_name}/issues",
                headers=get_headers(),
                params={
                    "labels": label,
                    "state": "open",
                    "per_page": 10,
                    "sort": "updated",
                    "direction": "desc"
                },
                timeout=15
            )
            
            if response.status_code == 403:
                logger.warning(f"  ⚠️ Rate limited for {repo_full_name}")
                return list(all_issues.values())
            
            if response.status_code == 404:
                logger.warning(f"  ⚠️ Repo not found: {repo_full_name}")
                return []
            
            response.raise_for_status()
            
            for issue in response.json():
                # Skip pull requests
                if "pull_request" in issue:
                    continue
                
                issue_id = issue["id"]
                if issue_id not in all_issues:
                    # Sanitize text fields (PostgreSQL can't store NUL characters)
                    title = (issue.get("title") or "").replace("\x00", "")
                    body = (issue.get("body") or "").replace("\x00", "")[:2000]
                    
                    all_issues[issue_id] = {
                        "github_id": issue_id,
                        "number": issue["number"],
                        "title": title,
                        "body": body,
                        "labels": [l["name"] for l in issue.get("labels", [])],
                        "html_url": issue["html_url"],
                        "is_open": issue["state"] == "open",
                        "comments_count": issue.get("comments", 0),
                        "created_at": datetime.fromisoformat(issue["created_at"].replace("Z", "+00:00")) if issue.get("created_at") else None,
                        "updated_at": datetime.fromisoformat(issue["updated_at"].replace("Z", "+00:00")) if issue.get("updated_at") else None,
                    }
            
            # Rate limiting
            time.sleep(0.3)
            
        except Exception as e:
            logger.error(f"  ❌ Error fetching {repo_full_name} with label '{label}': {e}")
            continue
    
    return list(all_issues.values())[:MAX_ISSUES_PER_REPO]


def sync_repo_issues(repo: Repo, db: Session) -> int:
    """
    Sync issues for a single repo.
    Returns number of issues synced.
    """
    logger.info(f"🔄 Syncing: {repo.full_name}")
    
    # Fetch from GitHub
    github_issues = fetch_issues_from_github(repo.full_name)
    
    if not github_issues:
        logger.info(f"  ℹ️ No issues found for {repo.full_name}")
        return 0
    
    synced_count = 0
    
    for issue_data in github_issues:
        # Check if issue exists
        existing = db.query(Issue).filter(
            Issue.repo_id == repo.id,
            Issue.github_id == issue_data["github_id"]
        ).first()
        
        if existing:
            # Update existing issue
            existing.title = issue_data["title"]
            existing.body = issue_data["body"]
            existing.labels = issue_data["labels"]
            existing.difficulty = detect_difficulty(issue_data["labels"])
            existing.is_open = issue_data["is_open"]
            existing.comments_count = issue_data["comments_count"]
            existing.updated_at = issue_data["updated_at"]
            existing.fetched_at = datetime.now(timezone.utc)
            logger.debug(f"  ♻️ Updated: #{issue_data['number']} - {issue_data['title'][:40]}")
        else:
            # Create new issue
            new_issue = Issue(
                repo_id=repo.id,
                github_id=issue_data["github_id"],
                number=issue_data["number"],
                title=issue_data["title"],
                body=issue_data["body"],
                labels=issue_data["labels"],
                difficulty=detect_difficulty(issue_data["labels"]),
                html_url=issue_data["html_url"],
                is_open=issue_data["is_open"],
                comments_count=issue_data["comments_count"],
                created_at=issue_data["created_at"],
                updated_at=issue_data["updated_at"],
                fetched_at=datetime.now(timezone.utc)
            )
            db.add(new_issue)
            logger.debug(f"  ✨ New: #{issue_data['number']} - {issue_data['title'][:40]}")
        
        synced_count += 1
    
    # Update repo last_synced
    repo.last_synced = datetime.now(timezone.utc)
    db.commit()
    
    logger.info(f"  ✅ Synced {synced_count} issues for {repo.full_name}")
    return synced_count


def sync_all_repos(db: Session, limit: int = None, repo_filter: str = None):
    """
    Sync issues for all repos (or filtered subset).
    """
    logger.info("=" * 60)
    logger.info("🚀 Issue Syncer - Starting")
    logger.info("=" * 60)
    
    # Query repos
    query = db.query(Repo).filter(Repo.is_active == True)
    
    if repo_filter:
        query = query.filter(Repo.full_name == repo_filter)
        logger.info(f"📌 Filtering to single repo: {repo_filter}")
    
    if limit:
        query = query.limit(limit)
        logger.info(f"📌 Limiting to {limit} repos")
    
    repos = query.all()
    total_repos = len(repos)
    
    logger.info(f"📦 Found {total_repos} repos to sync")
    logger.info("-" * 60)
    
    total_issues = 0
    synced_repos = 0
    
    for i, repo in enumerate(repos, 1):
        logger.info(f"[{i}/{total_repos}] Processing {repo.full_name}...")
        
        try:
            count = sync_repo_issues(repo, db)
            total_issues += count
            synced_repos += 1
        except Exception as e:
            logger.error(f"❌ Failed to sync {repo.full_name}: {e}")
            continue
        
        # Rate limiting between repos
        time.sleep(1)
    
    logger.info("-" * 60)
    logger.info(f"✅ Sync complete!")
    logger.info(f"   Repos synced: {synced_repos}/{total_repos}")
    logger.info(f"   Total issues: {total_issues}")
    logger.info("=" * 60)


def main():
    """Entry point for the script."""
    from db.models.usermodel import init_db
    
    logger.info("📊 Ensuring database tables exist...")
    init_db()
    
    # Parse args
    limit = None
    repo_filter = None
    
    args = sys.argv[1:]
    for i, arg in enumerate(args):
        if arg == "--limit" and i + 1 < len(args):
            limit = int(args[i + 1])
        elif arg == "--repo" and i + 1 < len(args):
            repo_filter = args[i + 1]
    
    # Get database session
    db = next(get_db())
    
    try:
        sync_all_repos(db, limit=limit, repo_filter=repo_filter)
    finally:
        db.close()


if __name__ == "__main__":
    main()

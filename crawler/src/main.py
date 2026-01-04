"""
Crawler main module for fetching and storing GitHub issues.

This module orchestrates the crawling process: fetching issues from GitHub,
storing them in the database, and indexing them in the vector store.
"""

from sqlalchemy import select

from core.github_client import fetch_github_issues
from core.models import Issue, get_session, init_db
from core.vector_store import upsert_issues


def issue_exists(session, issue_id: int) -> bool:
    """
    Check if an issue already exists in the database.
    
    Args:
        session: Database session.
        issue_id: GitHub issue ID to check.
    
    Returns:
        True if issue exists, False otherwise.
    """
    result = session.execute(
        select(Issue).where(Issue.github_issue_id == issue_id)
    ).first()
    return result is not None


def process_issues(raw_issues: list, repo_full_name: str, session) -> list:
    """
    Process raw GitHub issues and create Issue objects for new ones.
    
    Args:
        raw_issues: List of raw issue dictionaries from GitHub API.
        repo_full_name: Full repository name (owner/repo).
        session: Database session.
    
    Returns:
        List of new Issue objects that were added to the session.
    """
    new_issues = []
    
    for issue_data in raw_issues:
        # Skip pull requests and existing issues
        if "pull_request" in issue_data:
            continue
        if issue_exists(session, issue_data["id"]):
            continue
        
        issue = Issue(
            github_issue_id=issue_data["id"],
            title=issue_data["title"],
            url=issue_data["html_url"],
            state=issue_data["state"],
            body=issue_data.get("body"),
            repo_name=repo_full_name,
        )
        session.add(issue)
        new_issues.append(issue)
    
    return new_issues


def run_crawler(owner: str = "MemoriLabs", repo: str = "Memori", label: str = "bug") -> None:
    """
    Run the crawler to fetch, store, and index GitHub issues.
    
    Args:
        owner: Repository owner/organization name.
        repo: Repository name.
        label: Issue label to filter by (default: "bug").
    """
    # Initialize database
    init_db()
    
    # Create session
    session = get_session()
    
    try:
        # Fetch issues from GitHub
        raw_issues = fetch_github_issues(owner, repo, label=label)
        
        if not raw_issues:
            print("No issues found or access denied.")
            return
        
        # Process and store new issues
        repo_full_name = f"{owner}/{repo}"
        new_issues = process_issues(raw_issues, repo_full_name, session)
        
        if new_issues:
            session.commit()
            print(f"Stored {len(new_issues)} new issues in database.")
            
            # Index in vector store
            upsert_issues(new_issues)
        else:
            print("No new issues to process.")
    
    finally:
        session.close()


if __name__ == "__main__":
    run_crawler()

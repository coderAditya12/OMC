"""
GitHub API Client - Handles GitHub API interactions

Used for:
- User authentication and profile fetching
- User's repository fetching
- README content fetching (fallback for RAG)
"""
import logging
import base64
import requests
from typing import Optional, Dict, List

logger = logging.getLogger(__name__)

GITHUB_URL = "https://api.github.com"


def get_headers(access_token: str) -> dict:
    """Get headers for GitHub API requests."""
    return {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }


def get_user(access_token: str) -> Optional[Dict]:
    """
    Fetch user info from GitHub.
    
    Returns:
        Dict with username, name, bio, location, public_repos, followers
    """
    try:
        response = requests.get(
            f"{GITHUB_URL}/user",
            headers=get_headers(access_token),
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        return {
            "username": data.get("login"),
            "name": data.get("name"),
            "bio": data.get("bio"),
            "location": data.get("location"),
            "public_repos": data.get("public_repos"),
            "followers": data.get("followers")
        }
    except Exception as e:
        logger.error(f"Error fetching user: {e}")
        return None


def get_repos(access_token: str, per_page: int = 100) -> List[Dict]:
    """
    Fetch user's repositories.
    
    Args:
        access_token: GitHub OAuth token
        per_page: Number of repos to fetch (max 100)
    
    Returns:
        List of repository dictionaries
    """
    try:
        response = requests.get(
            f"{GITHUB_URL}/user/repos",
            headers=get_headers(access_token),
            params={"per_page": per_page},
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching repos: {e}")
        return []


def get_readme(repo_full_name: str, access_token: str = None) -> Optional[str]:
    """
    Fetch README content from repo.
    
    Used as fallback when RAG context is not available.
    
    Args:
        repo_full_name: Full repo name (owner/repo)
        access_token: Optional GitHub token
    
    Returns:
        README content (first 5000 chars) or None
    """
    headers = get_headers(access_token) if access_token else {}
    
    try:
        response = requests.get(
            f"{GITHUB_URL}/repos/{repo_full_name}/readme",
            headers=headers,
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        content = base64.b64decode(data.get("content", "")).decode("utf-8")
        return content[:5000]
    except Exception as e:
        logger.warning(f"Error fetching README for {repo_full_name}: {e}")
        return None

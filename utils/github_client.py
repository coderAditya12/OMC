"""
GitHub Client module for fetching issues from GitHub API.

This module provides functional utilities for interacting with the GitHub API.
"""

import httpx
from dotenv import load_dotenv

from core.config import GITHUB_ACCESS_TOKEN

load_dotenv()

# Constants
BASE_URL = "https://api.github.com/"


def get_headers(token: str = None) -> dict:
    """
    Get the headers required for GitHub API requests.
    
    Args:
        token: GitHub access token. Uses GITHUB_ACCESS_TOKEN from config if not provided.
    
    Returns:
        Dictionary of headers for GitHub API requests.
    """
    token = token or GITHUB_ACCESS_TOKEN
    return {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github+json",
        "User-Agent": "OSM-Crawler-v1",
    }


def fetch_github_issues(
    owner: str,
    repo: str,
    label: str = "bug",
    state: str = "open",
    per_page: int = 10,
    token: str = None
) -> list:
    """
    Fetch issues from a GitHub repository.
    
    Args:
        owner: Repository owner/organization name.
        repo: Repository name.
        label: Issue label to filter by (default: "bug").
        state: Issue state - "open", "closed", or "all" (default: "open").
        per_page: Number of issues to fetch (default: 10).
        token: GitHub access token. Uses config token if not provided.
    
    Returns:
        List of issue dictionaries from GitHub API, or empty list on error.
    """
    url = f"{BASE_URL}repos/{owner}/{repo}/issues"
    headers = get_headers(token)
    
    params = {
        "accept": "application/vnd.github+json",
        "state": state,
        "labels": label,
        "sort": "updated",
        "direction": "desc",
        "per_page": per_page,
    }
    
    print(f" Connecting to GitHub: {owner}/{repo} looking for '{label}'...")
    
    try:
        with httpx.Client() as client:
            response = client.get(url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        print(f"HTTP ERROR {e.response.status_code} - {e.response.text}")
        return []
    except Exception as e:
        print(f"connection error: {e}")
        return []


def fetch_file_content(
    owner: str,
    repo: str,
    file_path: str,
    ref: str = "main",
    token: str = None
) -> str | None:
    """
    Fetch the content of a specific file from a GitHub repository.
    
    Args:
        owner: Repository owner/organization name.
        repo: Repository name.
        file_path: Path to the file within the repository.
        ref: Git reference (branch, tag, or commit SHA). Default: "main".
        token: GitHub access token. Uses config token if not provided.
    
    Returns:
        File content as a string, or None if the file could not be fetched.
    """
    url = f"{BASE_URL}repos/{owner}/{repo}/contents/{file_path}"
    headers = get_headers(token)
    
    params = {"ref": ref}
    
    print(f" Fetching file: {owner}/{repo}/{file_path}")
    
    try:
        with httpx.Client() as client:
            response = client.get(url, headers=headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            # GitHub returns base64 encoded content
            if "content" in data:
                import base64
                content = base64.b64decode(data["content"]).decode("utf-8")
                return content
            
            return None
    except httpx.HTTPStatusError as e:
        print(f"HTTP ERROR {e.response.status_code} - {e.response.text}")
        return None
    except Exception as e:
        print(f"Error fetching file: {e}")
        return None
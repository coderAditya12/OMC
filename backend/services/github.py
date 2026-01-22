"""
GitHub API client - handles all GitHub API calls
"""
import requests
from datetime import datetime, timedelta

GITHUB_URL = "https://api.github.com"


def get_headers(access_token: str) -> dict:
    """Get headers for GitHub API requests"""
    return {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }


def get_user(access_token: str) -> dict | None:
    """Fetch user info from GitHub"""
    try:
        response = requests.get(
            f"{GITHUB_URL}/user",
            headers=get_headers(access_token)
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
        print(f"Error fetching user: {e}")
        return None


def get_repos(access_token: str, per_page: int = 100) -> list:
    """Fetch user's repositories"""
    try:
        response = requests.get(
            f"{GITHUB_URL}/user/repos",
            headers=get_headers(access_token),
            params={"per_page": per_page}
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching repos: {e}")
        return []


def search_repos(language: str, access_token: str = None, per_page: int = 10) -> list:
    """Search repos with good-first-issues by language. Filters out repos not updated in last 15 days."""
    # Calculate date threshold (15 days ago)
    date_threshold = (datetime.now() - timedelta(days=15)).strftime("%Y-%m-%d")
    query = f"good-first-issues in:topics language:{language} stars:>500 pushed:>{date_threshold}"
    
    headers = get_headers(access_token) if access_token else {}
    
    try:
        response = requests.get(
            f"{GITHUB_URL}/search/repositories",
            headers=headers,
            params={
                "q": query,
                "sort": "stars",
                "order": "desc",
                "per_page": per_page
            }
        )
        
        if response.status_code == 403:
            print("Rate limited")
            return []
            
        response.raise_for_status()
        data = response.json()
        
        repos = []
        for repo in data.get("items", []):
            repos.append({
                "full_name": repo.get("full_name"),
                "description": repo.get("description"),
                "stars": repo.get("stargazers_count"),
                "language": repo.get("language"),
                "url": repo.get("html_url")
            })
        return repos
        
    except Exception as e:
        print(f"Error searching repos: {e}")
        return []


# Labels organized by experience level
BEGINNER_LABELS = [
    "good first issue",
    "first-timers-only",
    "beginner",
    "beginner-friendly",
    "help wanted",         
    "up-for-grabs",        
    "easy",
    "low-hanging-fruit",   
    "documentation",
    "starter"   
    "good-first-issue",
    "low-hanging-fruit",
    "up-for-grabs"
]

INTERMEDIATE_LABELS = [
    "help wanted",
    "enhancement",
    "feature",
    "bug",
    "documentation",
    "tests",
    "DX",
    "refactor"
]

ADVANCED_LABELS = [
    "complex",
    "architecture",
    "performance",
    "security",
    "breaking-change",
    "core",
    "critical",
    "difficult"
]

# Combined labels for fetching all issues
ALL_LABELS = BEGINNER_LABELS + INTERMEDIATE_LABELS + ADVANCED_LABELS


def get_issues(repo_full_name: str, per_page: int = 5, access_token: str = None, labels: list = None) -> list:
    """
    Fetch issues with various difficulty labels from a repo.
    Uses OR logic - fetches issues with ANY of the specified labels.
    """
    headers = get_headers(access_token) if access_token else {}
    
    # Use provided labels or default to ALL_LABELS (all difficulty levels)
    search_labels = labels if labels else ALL_LABELS
    
    all_issues = {}  # Use dict to deduplicate by issue id
    
    for label in search_labels:
        try:
            response = requests.get(
                f"{GITHUB_URL}/repos/{repo_full_name}/issues",
                headers=headers,
                params={
                    "labels": label,
                    "state": "open",
                    "per_page": per_page,
                    "sort": "updated",
                    "direction": "desc"
                }
            )
            
            if response.status_code == 403:
                print(f"Rate limited while fetching issues with label: {label}")
                continue
                
            response.raise_for_status()
            
            for issue in response.json():
                if "pull_request" in issue:
                    continue
                    
                issue_id = issue.get("id")
                if issue_id not in all_issues:
                    all_issues[issue_id] = {
                        "id": issue_id,
                        "title": issue.get("title"),
                        "body": (issue.get("body") or "")[:500],
                        "url": issue.get("html_url"),
                        "labels": [l.get("name") for l in issue.get("labels", [])],
                        "repo": repo_full_name,
                        "created_at": issue.get("created_at"),
                        "comments": issue.get("comments", 0)
                    }
        except Exception as e:
            print(f"Error fetching issues from {repo_full_name} with label {label}: {e}")
            continue
    
    return list(all_issues.values())


def get_readme(repo_full_name: str, access_token: str = None) -> str | None:
    """Fetch README content from repo"""
    headers = get_headers(access_token) if access_token else {}
    
    try:
        response = requests.get(
            f"{GITHUB_URL}/repos/{repo_full_name}/readme",
            headers=headers
        )
        response.raise_for_status()
        data = response.json()
        
        import base64
        content = base64.b64decode(data.get("content", "")).decode("utf-8")
        return content[:5000]
    except Exception as e:
        print(f"Error fetching README: {e}")
        return None


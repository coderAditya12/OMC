"""
GitHub API client - handles all GitHub API calls
"""
import requests

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


def search_repos(language: str, per_page: int = 10, access_token: str = None) -> list:
    """Search repos with good-first-issues by language.
    Uses server token if user token fails (rate limit).
    """
    import os
    from time import sleep
    
    query = f"good-first-issues in:topics language:{language} stars:>100"
    
    # Try with user token first, fallback to server token
    tokens_to_try = [access_token, os.getenv("GITHUB_ACCESS_TOKEN")]
    tokens_to_try = [t for t in tokens_to_try if t]  # Filter None
    
    for token in tokens_to_try:
        headers = get_headers(token) if token else {}
        
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
            
            # If rate limited, try next token
            if response.status_code == 403:
                print(f"Rate limited, trying next token...")
                sleep(1)
                continue
                
            response.raise_for_status()
            data = response.json()
            
            return [
                {
                    "full_name": repo.get("full_name"),
                    "description": repo.get("description"),
                    "stars": repo.get("stargazers_count"),
                    "language": repo.get("language"),
                    "url": repo.get("html_url")
                }
                for repo in data.get("items", [])
            ]
        except Exception as e:
            print(f"Error searching repos with token: {e}")
            continue
    
    print(f"All tokens exhausted for search: {language}")
    return []


def get_issues(repo_full_name: str, per_page: int = 5, access_token: str = None) -> list:
    """Fetch 'good first issue' labeled issues from a repo"""
    headers = get_headers(access_token) if access_token else {}
    
    try:
        response = requests.get(
            f"{GITHUB_URL}/repos/{repo_full_name}/issues",
            headers=headers,
            params={
                "labels": "good first issue",
                "state": "open",
                "per_page": per_page,
                "sort": "updated",
                "direction": "desc"
            }
        )
        response.raise_for_status()
        
        issues = []
        for issue in response.json():
            if "pull_request" in issue:
                continue
            issues.append({
                "id": issue.get("id"),
                "title": issue.get("title"),
                "body": (issue.get("body") or "")[:500],
                "url": issue.get("html_url"),
                "labels": [l.get("name") for l in issue.get("labels", [])],
                "repo": repo_full_name,
                "created_at": issue.get("created_at"),
                "comments": issue.get("comments", 0)
            })
        return issues
    except Exception as e:
        print(f"Error fetching issues from {repo_full_name}: {e}")
        return []


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


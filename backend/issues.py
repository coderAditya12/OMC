"""
Issues module for fetching and matching GitHub issues.

This module provides functions to:
1. Dynamically search GitHub for repos with "good first issue" labels
2. Fetch issues from those repos
3. Match issues to user profile based on language, interests, and experience
"""

import requests
from utils.config import GITHUB_URL, GITHUB_Oauth_token

headers = {
    "Authorization": f"Bearer {GITHUB_Oauth_token}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
}


def search_repos_with_good_first_issues(language: str, per_page: int = 10) -> list[dict]:
    """
    Search GitHub for repos that have 'good first issue' labeled issues.
    
    Args:
        language: Programming language to filter by (e.g., "python", "javascript")
        per_page: Number of repos to return
    
    Returns:
        List of repo dicts with: full_name, description, stars, language
    """
    # Search for repos with good-first-issues topic or label
    query = f"good-first-issues in:topics language:{language} stars:>100"
    
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
        response.raise_for_status()
        data = response.json()
        
        repos = []
        for repo in data.get("items", []):
            repos.append({
                "full_name": repo.get("full_name"),
                "description": repo.get("description"),
                "stars": repo.get("stargazers_count"),
                "language": repo.get("language"),
                "url": repo.get("html_url"),
                "topics": repo.get("topics", [])
            })
        
        return repos
        
    except Exception as e:
        print(f"Error searching repos: {e}")
        return []


def fetch_good_first_issues(repo_full_name: str, per_page: int = 5) -> list[dict]:
    """
    Fetch 'good first issue' labeled issues from a specific repo.
    
    Args:
        repo_full_name: Full repo name like "facebook/react"
        per_page: Number of issues to fetch
    
    Returns:
        List of issue dicts with: title, body, url, labels, repo, language
    """
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
        data = response.json()
        
        issues = []
        for issue in data:
            # Skip pull requests (they also appear in issues endpoint)
            if "pull_request" in issue:
                continue
                
            issues.append({
                "id": issue.get("id"),
                "title": issue.get("title"),
                "body": issue.get("body", "")[:500],  # Truncate long bodies
                "url": issue.get("html_url"),
                "labels": [label.get("name") for label in issue.get("labels", [])],
                "repo": repo_full_name,
                "created_at": issue.get("created_at"),
                "comments": issue.get("comments", 0)
            })
        
        return issues
        
    except Exception as e:
        print(f"Error fetching issues from {repo_full_name}: {e}")
        return []


def get_issues_for_languages(languages: list[str], repos_per_lang: int = 5, issues_per_repo: int = 3) -> list[dict]:
    """
    Get good first issues for multiple languages.
    
    Args:
        languages: List of programming languages
        repos_per_lang: Number of repos to search per language
        issues_per_repo: Number of issues to fetch per repo
    
    Returns:
        List of all issues with language tag added
    """
    all_issues = []
    
    for language in languages:
        print(f"🔍 Searching repos for {language}...")
        repos = search_repos_with_good_first_issues(language, repos_per_lang)
        
        for repo in repos:
            print(f"  📦 Fetching issues from {repo['full_name']}...")
            issues = fetch_good_first_issues(repo['full_name'], issues_per_repo)
            
            # Add language to each issue
            for issue in issues:
                issue['language'] = language
                issue['repo_stars'] = repo['stars']
            
            all_issues.extend(issues)
    
    return all_issues


def calculate_match_score(issue: dict, profile: dict) -> float:
    """
    Calculate how well an issue matches a user's profile.
    
    Scoring:
    - Language match: 40 points
    - Interest match: 30 points
    - Experience appropriateness: 20 points
    - Recency/activity: 10 points
    
    Returns:
        Score from 0-100
    """
    score = 0
    
    # 1. Language Match (40 points)
    user_languages = [lang['language'].lower() for lang in profile.get('languages', {}).get('all', [])]
    primary_lang = profile.get('languages', {}).get('primary', '').lower()
    issue_lang = issue.get('language', '').lower()
    
    if issue_lang == primary_lang:
        score += 40  # Primary language match
    elif issue_lang in user_languages:
        score += 25  # Secondary language match
    
    # 2. Interest Match (30 points)
    user_interests = [i.lower() for i in profile.get('interests', [])]
    issue_text = f"{issue.get('title', '')} {issue.get('body', '')}".lower()
    
    interest_keywords = {
        'ai': ['ai', 'ml', 'machine learning', 'neural', 'model', 'gpt', 'llm'],
        'backend': ['api', 'server', 'database', 'endpoint', 'rest', 'graphql'],
        'frontend': ['ui', 'css', 'component', 'button', 'form', 'layout', 'style'],
        'bot': ['bot', 'discord', 'telegram', 'automation'],
        'realtime': ['websocket', 'real-time', 'chat', 'notification'],
        'devtools': ['cli', 'tool', 'plugin', 'extension']
    }
    
    interest_matches = 0
    for interest in user_interests:
        keywords = interest_keywords.get(interest, [interest])
        if any(kw in issue_text for kw in keywords):
            interest_matches += 1
    
    if interest_matches > 0:
        score += min(30, interest_matches * 15)  # Cap at 30
    
    # 3. Experience Level Match (20 points)
    user_level = profile.get('experience', {}).get('level', 'beginner')
    labels = [l.lower() for l in issue.get('labels', [])]
    
    # Check if issue complexity matches user level
    beginner_labels = ['good first issue', 'beginner', 'easy', 'starter', 'first-timers-only']
    intermediate_labels = ['medium', 'help wanted', 'enhancement']
    
    has_beginner_label = any(bl in ' '.join(labels) for bl in beginner_labels)
    has_intermediate_label = any(il in ' '.join(labels) for il in intermediate_labels)
    
    if user_level == 'beginner' and has_beginner_label:
        score += 20
    elif user_level == 'intermediate':
        score += 15 if has_intermediate_label else 10
    elif user_level in ['advanced', 'expert']:
        score += 10  # Advanced users can handle any issue
    
    # 4. Recency/Activity (10 points)
    comments = issue.get('comments', 0)
    if comments == 0:
        score += 10  # Fresh issue, no competition
    elif comments < 3:
        score += 7
    elif comments < 5:
        score += 4
    
    return score


def match_issues_to_profile(issues: list[dict], profile: dict, top_n: int = 10) -> list[dict]:
    """
    Match issues to user profile and return top matches.
    
    Args:
        issues: List of issues to match
        profile: User profile dict
        top_n: Number of top matches to return
    
    Returns:
        List of issues sorted by match score, with score added
    """
    scored_issues = []
    
    for issue in issues:
        score = calculate_match_score(issue, profile)
        issue_with_score = issue.copy()
        issue_with_score['match_score'] = score
        scored_issues.append(issue_with_score)
    
    # Sort by score descending
    scored_issues.sort(key=lambda x: x['match_score'], reverse=True)
    
    return scored_issues[:top_n]


def get_recommendations(profile: dict, top_n: int = 10) -> list[dict]:
    """
    Main function: Get issue recommendations for a user profile.
    
    Args:
        profile: User profile from create_user_profile()
        top_n: Number of recommendations to return
    
    Returns:
        List of matched issues with scores
    """
    # Get user's languages (top 3)
    user_languages = [lang['language'] for lang in profile.get('languages', {}).get('all', [])]
    
    if not user_languages:
        print("⚠️ No languages found in profile, using defaults")
        user_languages = ['Python', 'JavaScript']
    
    print(f"\n🎯 Finding issues for: {', '.join(user_languages)}\n")
    
    # Fetch issues for user's languages
    all_issues = get_issues_for_languages(
        languages=user_languages[:3],  # Top 3 languages
        repos_per_lang=3,
        issues_per_repo=5
    )
    
    print(f"\n📊 Found {len(all_issues)} total issues\n")
    
    # Match and rank
    recommendations = match_issues_to_profile(all_issues, profile, top_n)
    
    return recommendations


# Test the module
if __name__ == "__main__":
    # Import profile creator from test.py
    from backend.test import call_api
    
    print("=" * 60)
    print("STEP 1: Creating User Profile")
    print("=" * 60)
    
    profile = call_api()
    
    if profile:
        print("\n" + "=" * 60)
        print("STEP 2: Finding Matching Issues")
        print("=" * 60)
        
        recommendations = get_recommendations(profile, top_n=10)
        
        print("\n" + "=" * 60)
        print("🎯 TOP RECOMMENDED ISSUES")
        print("=" * 60)
        
        for i, issue in enumerate(recommendations, 1):
            print(f"\n#{i} [{issue['match_score']:.0f}% match] {issue['title'][:60]}...")
            print(f"   📦 Repo: {issue['repo']}")
            print(f"   🏷️  Labels: {', '.join(issue['labels'][:3])}")
            print(f"   🔗 {issue['url']}")

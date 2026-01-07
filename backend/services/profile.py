"""
Profile service - creates user profile from GitHub data
"""
from datetime import datetime
from collections import Counter


# Interest keywords mapping
INTEREST_KEYWORDS = {
    "ai": ["ai", "gpt", "ml", "machine learning", "neural", "llm", "generative"],
    "backend": ["backend", "api", "server", "fastapi", "express", "nest"],
    "frontend": ["frontend", "react", "vue", "angular", "ui", "component"],
    "fullstack": ["fullstack", "full-stack", "full stack"],
    "realtime": ["chat", "realtime", "real-time", "websocket", "socket"],
    "ecommerce": ["ecommerce", "e-commerce", "shop", "store", "cart"],
    "bot": ["bot", "discord", "telegram", "slack", "chatbot"],
    "devtools": ["cli", "tool", "utility", "automation"],
    "blockchain": ["blockchain", "web3", "crypto", "nft", "ethereum"],
    "mobile": ["mobile", "ios", "android", "react-native", "flutter"]
}


def filter_repos(repos: list, username: str) -> list:
    """Filter repos owned by user"""
    result = []
    for repo in repos:
        owner = repo.get("owner", {}).get("login")
        if owner == username:
            result.append({
                "name": repo.get("name"),
                "full_name": repo.get("full_name"),
                "language": repo.get("language"),
                "stargazers_count": repo.get("stargazers_count", 0),
                "forks_count": repo.get("forks_count", 0),
                "description": repo.get("description"),
                "pushed_at": repo.get("pushed_at")
            })
    return result


def extract_interests(repos: list) -> list:
    """Extract interests from repo names and descriptions"""
    interests = set()
    
    for repo in repos:
        text = f"{repo.get('name', '')} {repo.get('description', '')}".lower()
        for interest, keywords in INTEREST_KEYWORDS.items():
            if any(kw in text for kw in keywords):
                interests.add(interest)
    
    return list(interests)


def get_experience_level(repos: list) -> str:
    """Determine experience level"""
    count = len(repos)
    stars = sum(r.get("stargazers_count", 0) for r in repos)
    
    if count < 3:
        return "beginner"
    elif count < 10:
        return "intermediate" if stars > 0 else "beginner"
    elif count < 20:
        return "advanced" if stars > 10 else "intermediate"
    else:
        return "expert" if stars > 50 else "advanced"


def get_activity_level(repos: list) -> dict:
    """Analyze activity level"""
    if not repos:
        return {"level": "inactive", "last_active_days_ago": None}
    
    push_dates = []
    for r in repos:
        if r.get("pushed_at"):
            push_dates.append(
                datetime.fromisoformat(r["pushed_at"].replace("Z", "+00:00"))
            )
    
    if not push_dates:
        return {"level": "inactive", "last_active_days_ago": None}
    
    most_recent = max(push_dates)
    days_ago = (datetime.now(most_recent.tzinfo) - most_recent).days
    
    if days_ago < 7:
        level = "very_active"
    elif days_ago < 30:
        level = "active"
    elif days_ago < 90:
        level = "moderate"
    else:
        level = "inactive"
    
    return {"level": level, "last_active_days_ago": days_ago}


def create_profile(repos: list, username: str) -> dict:
    """Create user profile from repos"""
    # Get languages
    languages = [r["language"] for r in repos if r.get("language")]
    lang_counts = Counter(languages)
    top_langs = [
        {"language": lang, "count": count}
        for lang, count in lang_counts.most_common(3)
    ]
    
    # Build profile
    return {
        "username": username,
        "languages": {
            "primary": top_langs[0]["language"] if top_langs else None,
            "all": top_langs,
            "total_count": len(set(languages))
        },
        "experience": {
            "level": get_experience_level(repos),
            "total_repos": len(repos),
            "total_stars": sum(r.get("stargazers_count", 0) for r in repos)
        },
        "activity": get_activity_level(repos),
        "interests": extract_interests(repos)
    }

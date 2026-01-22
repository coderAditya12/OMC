"""
Matching service - scores and matches issues to user profile
"""


# Interest keywords for matching
INTEREST_KEYWORDS = {
    "ai": ["ai", "ml", "machine learning", "neural", "model", "gpt", "llm"],
    "backend": ["api", "server", "database", "endpoint", "rest", "graphql"],
    "frontend": ["ui", "css", "component", "button", "form", "layout", "style"],
    "bot": ["bot", "discord", "telegram", "automation"],
    "realtime": ["websocket", "real-time", "chat", "notification"],
    "devtools": ["cli", "tool", "plugin", "extension"]
}


def calculate_score(issue: dict, profile: dict) -> float:
    """
    Calculate match score (0-100)
    - Language: 40 points
    - Interests: 30 points  
    - Experience: 20 points
    - Recency: 10 points
    """
    score = 0
    
    # 1. Language Match (40 pts)
    user_langs = [l["language"].lower() for l in profile.get("languages", {}).get("all", [])]
    primary = (profile.get("languages", {}).get("primary") or "").lower()
    issue_lang = (issue.get("language") or "").lower()
    
    if issue_lang == primary:
        score += 40
    elif issue_lang in user_langs:
        score += 25
    
    # 2. Interest Match (30 pts)
    user_interests = [i.lower() for i in profile.get("interests", [])]
    issue_text = f"{issue.get('title', '')} {issue.get('body', '')}".lower()
    
    matches = 0
    for interest in user_interests:
        keywords = INTEREST_KEYWORDS.get(interest, [interest])
        if any(kw in issue_text for kw in keywords):
            matches += 1
    
    score += min(30, matches * 15)
    
    # 3. Experience Match (20 pts)
    # Match user's experience level to issue difficulty
    level = profile.get("experience", {}).get("level", "beginner")
    labels = " ".join(issue.get("labels", [])).lower()
    
    # Define label patterns for each difficulty level
    beginner_patterns = ["good first issue", "beginner", "easy", "starter", "first-timers", "up-for-grabs", "low-hanging"]
    intermediate_patterns = ["help wanted", "enhancement", "feature", "bug", "documentation", "tests", "refactor"]
    advanced_patterns = ["complex", "architecture", "performance", "security", "breaking", "core", "critical", "difficult"]
    
    # Detect issue difficulty
    has_beginner = any(p in labels for p in beginner_patterns)
    has_intermediate = any(p in labels for p in intermediate_patterns)
    has_advanced = any(p in labels for p in advanced_patterns)
    
    # Score based on match between user level and issue difficulty
    if level == "beginner":
        if has_beginner:
            score += 20  # Perfect match
        elif has_intermediate:
            score += 10  # Stretch goal
        else:
            score += 5   # Too hard
    elif level == "intermediate":
        if has_intermediate:
            score += 20  # Perfect match
        elif has_beginner:
            score += 15  # Easy for them
        elif has_advanced:
            score += 10  # Stretch goal
    else:  # advanced
        if has_advanced:
            score += 20  # Perfect match
        elif has_intermediate:
            score += 15  # Easy for them
        else:
            score += 10  # Too easy
    
    # 4. Recency (10 pts)
    comments = issue.get("comments", 0)
    if comments == 0:
        score += 10
    elif comments < 3:
        score += 7
    elif comments < 5:
        score += 4
    
    return score


def match_issues(issues: list, profile: dict, top_n: int = None) -> list:
    """Match and rank issues by score. Returns all issues if top_n is None."""
    scored = []
    
    for issue in issues:
        score = calculate_score(issue, profile)
        issue_copy = issue.copy()
        issue_copy["match_score"] = score
        scored.append(issue_copy)
    
    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return scored[:top_n] if top_n else scored

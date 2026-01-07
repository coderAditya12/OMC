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
    level = profile.get("experience", {}).get("level", "beginner")
    labels = " ".join(issue.get("labels", [])).lower()
    
    beginner_labels = ["good first issue", "beginner", "easy", "starter"]
    has_beginner = any(bl in labels for bl in beginner_labels)
    
    if level == "beginner" and has_beginner:
        score += 20
    elif level == "intermediate":
        score += 15
    else:
        score += 10
    
    # 4. Recency (10 pts)
    comments = issue.get("comments", 0)
    if comments == 0:
        score += 10
    elif comments < 3:
        score += 7
    elif comments < 5:
        score += 4
    
    return score


def match_issues(issues: list, profile: dict, top_n: int = 10) -> list:
    """Match and rank issues by score"""
    scored = []
    
    for issue in issues:
        score = calculate_score(issue, profile)
        issue_copy = issue.copy()
        issue_copy["match_score"] = score
        scored.append(issue_copy)
    
    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return scored[:top_n]

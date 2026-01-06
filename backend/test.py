# import requests
# from utils.config import GITHUB_URL,GITHUB_Oauth_token
# headers = {
#         "Authorization": f"Bearer {GITHUB_Oauth_token}",
#         "Accept": "application/vnd.github+json",
#         "X-GitHub-Api-Version": "2022-11-28"
#     }

# def filter_repo_data(repos):
#     USERNAME = "coderAditya12"
#     result = []

#     for repo in repos:
#         userFullName= repo.get("full_name",{})
#         owner_login = repo.get("owner", {}).get("login")
#         if USERNAME in userFullName:
#             repo_data = {
#                 "name": repo.get("name"),
#                 "language": repo.get("language"),
#                 "stargazers_count": repo.get("stargazers_count", 0),
#                 "watchers_count": repo.get("watchers_count", 0),
#                 "forks_count": repo.get("forks_count", 0),
#                 "open_issues_count": repo.get("open_issues_count", 0),
#                 "description":repo.get("description") 
#             }

#             # include full_name only if coderAditya12 is the owner
#             if owner_login == USERNAME:
#                 repo_data["full_name"] = repo.get("full_name")

#             result.append(repo_data)

#     return result
# def format_data(format_repo):
#     name=[]
#     lang

# def call_api():
#     try:
#         response = requests.get(f"{GITHUB_URL}/user/repos",headers=headers)
#         response.raise_for_status()
#         user_data = response.json()
#         filtered_repo=filter_repo_data(user_data)
#         # print(user_data)
#         print("filtered repo data",filtered_repo)
#         format_data(filtered_repo)
#     except Exception as e:
#         print(f"getting error while fetching the github user data",{e})
        
# if __name__=="__main__":
#     call_api()
import requests
from datetime import datetime
from collections import Counter
from utils.config import GITHUB_URL, GITHUB_Oauth_token

headers = {
    "Authorization": f"Bearer {GITHUB_Oauth_token}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
}

def filter_repo_data(repos, username):
    """Filter repos owned by the user"""
    result = []
    for repo in repos:
        owner_login = repo.get("owner", {}).get("login")
        
        # Only include repos owned by the user
        if owner_login == username:
            repo_data = {
                "name": repo.get("name"),
                "full_name": repo.get("full_name"),
                "language": repo.get("language"),
                "stargazers_count": repo.get("stargazers_count", 0),
                "watchers_count": repo.get("watchers_count", 0),
                "forks_count": repo.get("forks_count", 0),
                "open_issues_count": repo.get("open_issues_count", 0),
                "description": repo.get("description"),
                "created_at": repo.get("created_at"),
                "updated_at": repo.get("updated_at"),
                "pushed_at": repo.get("pushed_at")
            }
            result.append(repo_data)
    return result

def extract_interests(repos):
    """Extract interests from repo names and descriptions"""
    interests = set()
    
    keywords_map = {
        'ai': ['ai', 'gpt', 'ml', 'machine learning', 'neural', 'llm', 'generative'],
        'backend': ['backend', 'api', 'server', 'fastapi', 'express', 'nest'],
        'frontend': ['frontend', 'react', 'vue', 'angular', 'ui', 'component'],
        'fullstack': ['fullstack', 'full-stack', 'full stack'],
        'realtime': ['chat', 'realtime', 'real-time', 'websocket', 'socket'],
        'ecommerce': ['ecommerce', 'e-commerce', 'shop', 'store', 'cart'],
        'bot': ['bot', 'discord', 'telegram', 'slack',"chatbot"],
        'devtools': ['cli', 'tool', 'utility', 'automation'],
        'blockchain': ['blockchain', 'web3', 'crypto', 'nft', 'ethereum'],
        'mobile': ['mobile', 'ios', 'android', 'react-native', 'flutter']
    }
    
    for repo in repos:
        text = f"{repo.get('name', '')} {repo.get('description', '')}".lower()
        
        for interest, keywords in keywords_map.items():
            if any(keyword in text for keyword in keywords):
                interests.add(interest)
    
    return list(interests)

def determine_experience_level(repos):
    """Determine experience level based on repo count and complexity"""
    repo_count = len(repos)
    total_stars = sum(r.get('stargazers_count', 0) for r in repos)
    has_complex_projects = any(
        r.get('language') in ['TypeScript', 'Python', 'Go', 'Rust'] and
        r.get('stargazers_count', 0) > 0
        for r in repos
    )
    
    if repo_count < 3:
        return 'beginner'
    elif repo_count < 10:
        return 'intermediate' if has_complex_projects else 'beginner'
    elif repo_count < 20:
        return 'advanced' if total_stars > 10 else 'intermediate'
    else:
        return 'expert' if total_stars > 50 else 'advanced'

def analyze_activity(repos):
    """Analyze user's activity level"""
    if not repos:
        return {'level': 'inactive', 'last_active_days_ago': None}
    
    # Get most recent push date
    push_dates = [
        datetime.fromisoformat(r['pushed_at'].replace('Z', '+00:00'))
        for r in repos if r.get('pushed_at')
    ]
    
    if not push_dates:
        return {'level': 'inactive', 'last_active_days_ago': None}
    
    most_recent = max(push_dates)
    days_ago = (datetime.now(most_recent.tzinfo) - most_recent).days
    
    if days_ago < 7:
        level = 'very_active'
    elif days_ago < 30:
        level = 'active'
    elif days_ago < 90:
        level = 'moderate'
    else:
        level = 'inactive'
    
    return {
        'level': level,
        'last_active_days_ago': days_ago,
        'last_active_date': most_recent.isoformat()
    }

def create_user_profile(repos, username):
    """Create complete user profile from repo data"""
    
    # Count languages (exclude None)
    languages = [r['language'] for r in repos if r.get('language')]
    language_counts = Counter(languages)
    
    # Get top 3 languages
    top_languages = [
        {'language': lang, 'count': count}
        for lang, count in language_counts.most_common(3)
    ]
    
    # Primary language
    primary_language = top_languages[0]['language'] if top_languages else None
    
    # Calculate stats
    total_stars = sum(r.get('stargazers_count', 0) for r in repos)
    total_forks = sum(r.get('forks_count', 0) for r in repos)
    
    # Extract interests
    interests = extract_interests(repos)
    
    # Determine experience
    experience_level = determine_experience_level(repos)
    
    # Activity analysis
    activity = analyze_activity(repos)
    
    # Build profile
    profile = {
        'username': username,
        'analyzed_at': datetime.now().isoformat(),
        
        # Language proficiency
        'languages': {
            'primary': primary_language,
            'all': top_languages,
            'total_count': len(set(languages))
        },
        
        # Experience indicators
        'experience': {
            'level': experience_level,
            'total_repos': len(repos),
            'total_stars': total_stars,
            'total_forks': total_forks
        },
        
        # Activity metrics
        'activity': activity,
        
        # Interests
        'interests': interests,
        
        # Project types (for matching)
        'project_complexity': {
            'has_popular_projects': total_stars > 5,
            'contributes_to_others': any(r.get('forks_count', 0) > 0 for r in repos),
            'maintains_projects': any(r.get('open_issues_count', 0) > 0 for r in repos)
        }
    }
    
    return profile

def get_user_info():
    """Get basic user info"""
    try:
        response = requests.get(f"{GITHUB_URL}/user", headers=headers)
        response.raise_for_status()
        user_data = response.json()
        return {
            'username': user_data.get('login'),
            'name': user_data.get('name'),
            'bio': user_data.get('bio'),
            'location': user_data.get('location'),
            'public_repos': user_data.get('public_repos'),
            'followers': user_data.get('followers'),
            'following': user_data.get('following'),
            'created_at': user_data.get('created_at')
        }
    except Exception as e:
        print(f"Error fetching user info: {e}")
        return None

def call_api():
    try:
        # Get user info first
        user_info = get_user_info()
        if not user_info:
            print("Failed to get user info")
            return
        
        username = user_info['username']
        print(f"Analyzing profile for: {username}\n")
        
        # Get repos
        response = requests.get(f"{GITHUB_URL}/user/repos", headers=headers, params={'per_page': 100})
        response.raise_for_status()
        all_repos = response.json()
        
        # Filter user's own repos
        user_repos = filter_repo_data(all_repos, username)
        print(f"Found {len(user_repos)} repos owned by {username}\n")
        
        # Create profile
        profile = create_user_profile(user_repos, username)
        
        # Add user info to profile
        profile['user_info'] = user_info
        
        # Print formatted output
        print("=" * 60)
        print("USER PROFILE ANALYSIS")
        print("=" * 60)
        print(f"\n👤 User: {profile['user_info']['name']} (@{username})")
        print(f"📍 Location: {profile['user_info']['location']}")
        print(f"📝 Bio: {profile['user_info']['bio']}\n")
        
        print(f"💻 Primary Language: {profile['languages']['primary']}")
        print(f"🔧 Languages Used: {', '.join([f'{l['language']} ({l['count']})' for l in profile['languages']['all']])}")

        print(f"\n📊 Experience: {profile['experience']['level'].upper()}")
        print(f"📦 Total Repos: {profile['experience']['total_repos']}")
        print(f"⭐ Total Stars: {profile['experience']['total_stars']}")
        print(f"🍴 Total Forks: {profile['experience']['total_forks']}")
        print(f"\n🎯 Interests: {', '.join(profile['interests']) if profile['interests'] else 'None detected'}")
        print(f"\n⚡ Activity: {profile['activity']['level'].upper()}")
        print(f"📅 Last Active: {profile['activity']['last_active_days_ago']} days ago")
        
        print("\n" + "=" * 60)
        print("SAVE THIS TO DATABASE:")
        print("=" * 60)
        
        # This is what you save to database
        import json
        print(json.dumps(profile, indent=2))
        
        return profile
        
    except Exception as e:
        print(f"Error while fetching GitHub user data: {e}")
        return None

if __name__ == "__main__":
    call_api()
"""
Repo Seeder - Fetches and stores repos from goodfirstissue.dev

Usage:
    python -m backend.services.repo_seeder

This script:
1. Scrapes repos from goodfirstissue.dev by language
2. Validates each repo exists on GitHub
3. Stores in PostgreSQL with tier="gold"
"""
import requests
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict
import time
import re

from db.database import get_db
from db.models.repomodel import Repo
from db.models.issuemodel import Issue  # noqa - needed for SQLAlchemy relationship resolution
from utils.config import GITHUB_ACCESS_TOKEN


# Languages to fetch from goodfirstissue.dev (all available languages)
LANGUAGES = [
    "python",
    "typescript",
    "go",
    "cplusplus",    # C++ (URL uses cplusplus)
    "java",
    "javascript",
    "rust",
    "csharp",       # C#
    "php",
    "c",
    "html",
    "ruby",
    "scala",
    "kotlin",
    "dart",
    "shell",
    "lua",
]

# Limit repos per language to avoid overwhelming the database
MAX_REPOS_PER_LANGUAGE = 20


def fetch_repos_from_goodfirstissue(language: str) -> List[str]:
    """
    Fetch repo names from goodfirstissue.dev for a specific language.
    Returns list of repo full_names like ["microsoft/vscode", "facebook/react"]
    """
    url = f"https://goodfirstissue.dev/language/{language}"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all GitHub repo links
        repos = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            # Match GitHub repo URLs like https://github.com/owner/repo
            match = re.match(r'https://github\.com/([^/]+/[^/]+)/?$', href)
            if match:
                full_name = match.group(1)
                if full_name not in repos:  # Avoid duplicates
                    repos.append(full_name)
        
        print(f"  Found {len(repos)} repos for {language}")
        return repos[:MAX_REPOS_PER_LANGUAGE]
        
    except Exception as e:
        print(f"  Error fetching {language}: {e}")
        return []


def validate_repo_on_github(full_name: str) -> Dict | None:
    """
    Validate a repo exists on GitHub and get its metadata.
    Returns repo info dict or None if invalid.
    """
    headers = {
        "Authorization": f"token {GITHUB_ACCESS_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    try:
        response = requests.get(
            f"https://api.github.com/repos/{full_name}",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            return {
                "full_name": data["full_name"],
                "owner": data["owner"]["login"],
                "name": data["name"],
                "language": data.get("language"),
                "description": data.get("description", "")[:500] if data.get("description") else None,
                "stars": data.get("stargazers_count", 0),
            }
        else:
            print(f"    ✗ {full_name} not found (status {response.status_code})")
            return None
            
    except Exception as e:
        print(f"    ✗ Error validating {full_name}: {e}")
        return None


def seed_repos(db: Session, dry_run: bool = False):
    """
    Main function to seed repos from goodfirstissue.dev into PostgreSQL.
    """
    print("=" * 60)
    print("Repo Seeder - Fetching from goodfirstissue.dev")
    print("=" * 60)
    
    # Track seen repo full_names (from GitHub API) to avoid duplicates
    seen_full_names = set()
    all_repos = []
    
    # Fetch repos for each language
    for language in LANGUAGES:
        print(f"\n[{language.upper()}]")
        repos = fetch_repos_from_goodfirstissue(language)
        
        for scraped_name in repos:
            # Validate on GitHub first to get canonical full_name
            repo_info = validate_repo_on_github(scraped_name)
            if not repo_info:
                continue
            
            # Check for duplicates using GitHub's canonical full_name
            canonical_name = repo_info["full_name"].lower()
            if canonical_name in seen_full_names:
                continue
            
            seen_full_names.add(canonical_name)
            all_repos.append(repo_info)
            print(f"    ✓ {repo_info['full_name']} ({repo_info['stars']} ⭐)")
            
            # Rate limiting - be nice to GitHub API
            time.sleep(0.5)
    
    print(f"\n{'=' * 60}")
    print(f"Total valid repos: {len(all_repos)}")
    print(f"{'=' * 60}")
    
    if dry_run:
        print("\n[DRY RUN] No changes made to database.")
        return
    
    # Store in database
    added_count = 0
    updated_count = 0
    
    for repo_info in all_repos:
        existing = db.query(Repo).filter(Repo.full_name == repo_info["full_name"]).first()
        
        if existing:
            # Update existing repo
            existing.language = repo_info["language"]
            existing.description = repo_info["description"]
            existing.stars = repo_info["stars"]
            existing.is_active = True
            updated_count += 1
        else:
            # Create new repo
            new_repo = Repo(
                full_name=repo_info["full_name"],
                owner=repo_info["owner"],
                name=repo_info["name"],
                language=repo_info["language"],
                description=repo_info["description"],
                stars=repo_info["stars"],
                tier="gold",  # From goodfirstissue.dev = gold tier
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(new_repo)
            added_count += 1
    
    db.commit()
    
    print(f"\n✓ Added {added_count} new repos")
    print(f"✓ Updated {updated_count} existing repos")


def main():
    """Entry point for the script."""
    import sys
    from db.models.usermodel import init_db
    
    # Create tables if they don't exist
    print("Ensuring database tables exist...")
    init_db()
    
    dry_run = "--dry-run" in sys.argv
    
    # Get database session
    db = next(get_db())
    
    try:
        seed_repos(db, dry_run=dry_run)
    finally:
        db.close()


if __name__ == "__main__":
    main()

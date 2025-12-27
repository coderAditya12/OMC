import httpx
import os
from dotenv import load_dotenv

load_dotenv()


class GithubClient:
    def __init__(self):
        self.token = os.getenv("GITHUB_ACCESS_TOKEN")
        if not self.token:
            raise ValueError("GITHUB_ACCESS_TOKEN not found in dotenv file")
        self.base_url = "https://api.github.com/"
        self.headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "OSM-Crawler-v1",
        }

    def fetch_github_issues(self, owner: str, repo: str, label: str = "bug"):
        # fetch issue from github api with specific repo
        url = f"{self.base_url}repos/{owner}/{repo}/issues"

        params = {
            "accept": "application/vnd.github+json",
            "state": "open",
            "labels": label,
            "sort": "updated",
            "direction": "desc",
            "per_page": 10,
        }
        print(f"📡 Connecting to GitHub: {owner}/{repo} looking for '{label}'...")
        try:
            with httpx.Client() as client:
                response = client.get(url, headers=self.headers, params=params)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            print(f"HTTP ERROR {e.response.status_code} - {e.response.text}")
        except Exception as e:
            print(f"connection error: {e}")
            return []

import json
import os
from github_client import GithubClient

OUTPUT_DIR = "./output"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def run_crawler():
    client = GithubClient()
    target_owner = "MemoriLabs"
    target_repo = "Memori"
    raw_issues = client.fetch_github_issues(target_owner, target_repo)
    if not raw_issues:
        print("no issues found or access denied.")
        return
    # clean the data
    cleaned_issues = []
    for issue in raw_issues:
        if "pull_request" in issue:
            continue
        cleaned_issue = {
            "id": issue["id"],
            "state": issue["state"],
            "title": issue["title"],
            "url": issue["html_url"],
            "labels": [label["name"] for label in issue["labels"]],
            "body_summary": issue["body"][:200] + "..."
            if issue["body"]
            else "No description",
        }
        cleaned_issues.append(cleaned_issue)
    print(cleaned_issues)

    output_file = f"{OUTPUT_DIR}/{target_repo}_issues.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(cleaned_issues, f, indent=4)

    print(f"✅ Success! Scraped {len(cleaned_issues)} issues.")
    print(f"📁 Data saved to: {output_file}")


if __name__ == "__main__":
    run_crawler()

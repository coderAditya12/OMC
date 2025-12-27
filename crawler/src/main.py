from github_client import GithubClient
from models import init_db, get_session, Issue
from sqlalchemy import select


session = get_session()


def already_exist(issue_id):
    result = session.execute(
        select(Issue).where(Issue.github_issue_id == issue_id)
    ).first()
    return result is not None


def run_crawler():
    init_db()
    client = GithubClient()
    target_owner = "MemoriLabs"
    target_repo = "Memori"
    raw_issues = client.fetch_github_issues(target_owner, target_repo)
    if not raw_issues:
        print("no issues found or access denied.")
        return
    for issue_data in raw_issues:
        if "pull_request" in issue_data or already_exist(issue_data["id"]):
            continue

        issue = Issue(
            github_issue_id=issue_data["id"],
            title=issue_data["title"],
            url=issue_data["html_url"],
            state=issue_data["state"],
            body=issue_data.get("body"),
            repo_name="MemoriLabs/Memori",
        )
        session.add(issue)

    session.commit()
    session.close()


if __name__ == "__main__":
    run_crawler()

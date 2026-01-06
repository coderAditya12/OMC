import requests
from utils.config import GITHUB_URL,GITHUB_Oauth_token
headers = {
        "Authorization": f"Bearer {GITHUB_Oauth_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }

def call_api():
    try:
        response = requests.get(f"{GITHUB_URL}/user/repos",headers=headers)
        response.raise_for_status()
        user_data = response.json()
        print(user_data)
    except Exception as e:
        print(f"getting error while fetching the github user data",{e})
        
if __name__=="__main__":
    call_api()
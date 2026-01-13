from dotenv import load_dotenv
import os
load_dotenv()
pinecone_key = os.getenv("PINECONE_API_KEY")
index = os.getenv("PINECONE_INDEX")
DB_URL =os.getenv("DATABASE_URL")
print(DB_URL)
GITHUB_ACCESS_TOKEN = os.getenv("GITHUB_ACCESS_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
jwt_secret = os.getenv("JWT_SECRET_KEY")
GITHUB_URL= "https://api.github.com"
GITHUB_Oauth_token=os.getenv("GITHUB_Oauth_token")
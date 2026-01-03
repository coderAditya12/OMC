from dotenv import load_dotenv
import os
load_dotenv()
pinecone_key = os.getenv("PINECONE_API_KEY")
index = os.getenv("PINECONE_INDEX")
DB_URL = os.getenv("DATABASE_URL")
print(DB_URL)
GITHUB_ACCESS_TOKEN = os.getenv("GITHUB_ACCESS_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")




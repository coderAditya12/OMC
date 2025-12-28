from dotenv import load_dotenv
import os
load_dotenv()
pinecone_key = os.getenv("PINECONE_API_KEY")
index = os.getenv("PINECONE_INDEX")
DB_URL = os.getenv("DATABASE_URL")

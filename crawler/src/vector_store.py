from pinecone import Pinecone
from dotenv import load_dotenv
from langchain_pinecone import PineconeVectorStore

from langchain_google_genai import GoogleGenerativeAIEmbeddings
import os

load_dotenv()
pinecone_key = os.getenv("PINECONE_API_KEY")
pinecone_index = os.getenv("PINECONE_INDEX")
# embedding model
embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
index = pinecone_key.index(pinecone_index)

vector_store = PineconeVectorStore(embedding=embeddings, index=pinecone_index)

pc = Pinecone

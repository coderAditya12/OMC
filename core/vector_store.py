"""
Vector Store module for Pinecone operations.

This module provides functional utilities for embedding generation,
vector storage, and semantic search using Pinecone.
"""

from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone

from core.config import index, pinecone_key

load_dotenv()

# Module-level cache for expensive resources
_embeddings = None
_pinecone_client = None
_pinecone_index = None
_vector_store = None


def get_embeddings():
    """
    Get or create the embeddings model instance (singleton pattern).
    
    Returns:
        GoogleGenerativeAIEmbeddings instance.
    """
    global _embeddings
    if _embeddings is None:
        _embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004"
        )
    return _embeddings


def get_pinecone_client():
    """
    Get or create the Pinecone client instance (singleton pattern).
    
    Returns:
        Pinecone client instance.
    """
    global _pinecone_client
    if _pinecone_client is None:
        _pinecone_client = Pinecone(pinecone_key)
    return _pinecone_client


def get_pinecone_index():
    """
    Get or create the Pinecone index instance (singleton pattern).
    
    Returns:
        Pinecone index instance.
    """
    global _pinecone_index
    if _pinecone_index is None:
        pc = get_pinecone_client()
        _pinecone_index = pc.Index(index)
    return _pinecone_index


def get_vector_store():
    """
    Get or create the PineconeVectorStore instance (singleton pattern).
    
    Returns:
        PineconeVectorStore instance.
    """
    global _vector_store
    if _vector_store is None:
        embeddings = get_embeddings()
        pinecone_index = get_pinecone_index()
        _vector_store = PineconeVectorStore(
            embedding=embeddings,
            index=pinecone_index
        )
    return _vector_store


def create_embedding(text: str) -> list:
    """
    Generate an embedding vector for the given text.
    
    Args:
        text: Text to embed.
    
    Returns:
        List of floats representing the embedding vector.
    """
    embeddings = get_embeddings()
    return embeddings.embed_query(text)


def upsert_issues(issues: list) -> None:
    """
    Generate embeddings for issues and upload to Pinecone.
    
    Args:
        issues: List of Issue objects with github_issue_id, title, body, url, and repo_name.
    """
    if not issues:
        print("No issues to upload.")
        return
    
    print(f" Generating embeddings for {len(issues)} issues...")
    
    embeddings = get_embeddings()
    pinecone_index = get_pinecone_index()
    
    vectors_to_upload = []
    for issue in issues:
        text_to_embed = f"Title:{issue.title}\nBody:{issue.body or ''}"
        embedding_vector = embeddings.embed_query(text_to_embed)
        
        vectors_to_upload.append({
            "id": str(issue.github_issue_id),
            "values": embedding_vector,
            "metadata": {
                "url": issue.url,
                "title": issue.title,
                "repo": issue.repo_name,
            }
        })
    
    if vectors_to_upload:
        pinecone_index.upsert(vectors=vectors_to_upload)
        print(f"Successfully uploaded {len(vectors_to_upload)} vectors to Pinecone")


def query_search(query: str, limit: int = 5) -> list:
    """
    Search for similar issues in Pinecone using semantic search.
    
    Args:
        query: The user's search text (e.g., "Python loops").
        limit: Number of results to return (default: 5).
    
    Returns:
        List of matches, each containing 'id', 'score', and 'metadata'.
    """
    print("query search is called")
    
    embeddings = get_embeddings()
    pinecone_index = get_pinecone_index()
    
    query_embedding = embeddings.embed_query(query)
    
    results = pinecone_index.query(
        vector=query_embedding,
        top_k=limit,
        include_metadata=True,
    )
    
    # TODO: Implement rerank strategy
    matches = []
    for match in results.get("matches", []):
        matches.append({
            "id": match["id"],
            "score": match["score"],
            "metadata": match.get("metadata", {}),
        })
    
    return matches

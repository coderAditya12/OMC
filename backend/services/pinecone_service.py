"""
Pinecone Vector Database Service - Simple initialization
"""
import logging
from typing import List, Dict, Optional
from pinecone import Pinecone

from utils.config import pinecone_key, index as INDEX_NAME

logger = logging.getLogger(__name__)

# Initialize Pinecone
pc = Pinecone(api_key=pinecone_key)
index = pc.Index(INDEX_NAME)

logger.info(f"✅ Pinecone connected to index: {INDEX_NAME}")


def upsert_vectors(vectors: List[Dict], namespace: str = "readme") -> int:
    """Upsert vectors to Pinecone."""
    index.upsert(vectors=vectors, namespace=namespace)
    return len(vectors)


def query_similar(
    query_embedding: List[float],
    namespace: str = "readme",
    top_k: int = 5,
    filter: Optional[Dict] = None
) -> List[Dict]:
    """Query Pinecone for similar vectors."""
    results = index.query(
        vector=query_embedding,
        namespace=namespace,
        top_k=top_k,
        include_metadata=True,
        filter=filter
    )
    
    return [
        {"id": m["id"], "score": m["score"], "metadata": m.get("metadata", {})}
        for m in results.get("matches", [])
    ]


def delete_vectors(namespace: str = "readme", filter: Optional[Dict] = None):
    """Delete vectors from Pinecone."""
    if filter:
        index.delete(namespace=namespace, filter=filter)
    else:
        index.delete(namespace=namespace, delete_all=True)


def get_stats() -> Dict:
    """Get index statistics."""
    return index.describe_index_stats()

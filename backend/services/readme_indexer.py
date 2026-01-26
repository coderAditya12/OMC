"""
README Indexer - Fetches READMEs from cached repos and indexes to Pinecone

Usage:
    python -m backend.services.readme_indexer
    python -m backend.services.readme_indexer --limit 10
"""
import logging
import requests
import base64
import time
import sys
from typing import List, Dict, Optional

from db.database import get_db
from db.models.repomodel import Repo
from db.models.issuemodel import Issue  # noqa - needed for SQLAlchemy relationship
from backend.services.pinecone_service import upsert_vectors, delete_vectors
from utils.config import GITHUB_ACCESS_TOKEN
from utils.constants import README_CHUNK_SIZE as MAX_CHUNK_SIZE, README_CHUNK_OVERLAP as CHUNK_OVERLAP

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)


def get_headers() -> dict:
    """GitHub API headers."""
    return {
        "Authorization": f"token {GITHUB_ACCESS_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }


def fetch_readme(repo_full_name: str) -> Optional[str]:
    """Fetch README content from GitHub."""
    try:
        response = requests.get(
            f"https://api.github.com/repos/{repo_full_name}/readme",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 404:
            return None
        
        response.raise_for_status()
        content = base64.b64decode(response.json().get("content", "")).decode("utf-8")
        return content[:20000]  # Limit to 20k chars
        
    except Exception as e:
        logger.warning(f"  ⚠️ Failed to fetch README for {repo_full_name}: {e}")
        return None


def chunk_text(text: str, chunk_size: int = MAX_CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Split text into overlapping chunks."""
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap
    
    return chunks


def get_embedding(text: str) -> Optional[List[float]]:
    """Get embedding using Gemini (free tier)."""
    try:
        from google import genai
        from utils.config import GEMINI_API_KEY
        
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        result = client.models.embed_content(
            model="text-embedding-004",
            contents=text[:8000],  # Limit input
        )
        
        return result.embeddings[0].values
        
    except Exception as e:
        logger.warning(f"  Embedding error: {e}")
        return None


def index_repo_readme(repo: Repo) -> int:
    """Index a single repo's README to Pinecone."""
    logger.info(f"📄 Indexing: {repo.full_name}")
    
    # Fetch README
    readme = fetch_readme(repo.full_name)
    if not readme:
        logger.info(f"  ℹ️ No README found")
        return 0
    
    # Chunk the README
    chunks = chunk_text(readme)
    logger.info(f"  📝 Split into {len(chunks)} chunks")
    
    # Generate embeddings and prepare vectors
    vectors = []
    for i, chunk in enumerate(chunks):
        embedding = get_embedding(chunk)
        if embedding:
            vectors.append({
                "id": f"{repo.full_name}_{i}",
                "values": embedding,
                "metadata": {
                    "repo": repo.full_name,
                    "language": repo.language or "unknown",
                    "stars": repo.stars,
                    "chunk_index": i,
                    "text": chunk[:1000]  # Store truncated text for retrieval
                }
            })
        time.sleep(0.5)  # Rate limiting
    
    # Upsert to Pinecone
    if vectors:
        upsert_vectors(vectors, namespace="readme")
        logger.info(f"  ✅ Indexed {len(vectors)} chunks")
    
    return len(vectors)


def index_all_repos(limit: int = None):
    """Index READMEs for all cached repos."""
    logger.info("=" * 60)
    logger.info("🚀 README Indexer - Starting")
    logger.info("=" * 60)
    
    db = next(get_db())
    
    query = db.query(Repo).filter(Repo.is_active == True)
    if limit:
        query = query.limit(limit)
        logger.info(f"📌 Limiting to {limit} repos")
    
    repos = query.all()
    logger.info(f"📦 Found {len(repos)} repos to index")
    logger.info("-" * 60)
    
    total_chunks = 0
    for i, repo in enumerate(repos, 1):
        logger.info(f"[{i}/{len(repos)}] {repo.full_name}")
        chunks = index_repo_readme(repo)
        total_chunks += chunks
        time.sleep(1)  # Rate limiting between repos
    
    logger.info("-" * 60)
    logger.info(f"✅ Indexing complete!")
    logger.info(f"   Total chunks indexed: {total_chunks}")
    logger.info("=" * 60)
    
    db.close()


def main():
    """Entry point."""
    limit = None
    args = sys.argv[1:]
    for i, arg in enumerate(args):
        if arg == "--limit" and i + 1 < len(args):
            limit = int(args[i + 1])
    
    index_all_repos(limit=limit)


if __name__ == "__main__":
    main()

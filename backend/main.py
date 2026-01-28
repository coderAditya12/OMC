"""
OpenSource Compass - Backend API
Clean, modular FastAPI server
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.routers import auth,recommend,chat,chathistory,chatsessions,explore
from backend.services.cache import get_cache_stats, get_redis_client
from backend.services.cached_issues import check_data_freshness
from db.database import get_db
from db.models.issuemodel import Issue
from db.models.repomodel import Repo

# Initialize FastAPI
app = FastAPI(title="OpenSource Compass API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://opensource-compass.vercel.app"],
    allow_methods=["*"],
    allow_credentials=False,
    allow_headers=["*"],
)


# Health Check Endpoint (6.4)
@app.get("/")
@app.get("/health")
def health(db: Session = Depends(get_db)):
    """
    Comprehensive health check for monitoring.
    Returns status of PostgreSQL, Redis, and Pinecone.
    """
    status = {"status": "healthy"}
    
    # PostgreSQL check
    try:
        repo_count = db.query(Repo).count()
        issue_count = db.query(Issue).filter(Issue.is_open == True).count()
        freshness = check_data_freshness(db)
        status["postgresql"] = {
            "status": "connected",
            "repos": repo_count,
            "open_issues": issue_count,
            "data_freshness": freshness
        }
    except Exception as e:
        status["postgresql"] = {"status": "error", "error": str(e)}
        status["status"] = "degraded"
    
    # Redis check
    try:
        cache_stats = get_cache_stats()
        status["redis"] = cache_stats
        if cache_stats.get("status") != "connected":
            status["status"] = "degraded"
    except Exception as e:
        status["redis"] = {"status": "error", "error": str(e)}
        status["status"] = "degraded"
    
    # Pinecone check (lightweight)
    try:
        from backend.services.pinecone_service import get_pinecone_index
        index = get_pinecone_index()
        if index:
            stats = index.describe_index_stats()
            status["pinecone"] = {
                "status": "connected",
                "vectors": stats.total_vector_count
            }
        else:
            status["pinecone"] = {"status": "not_configured"}
    except Exception as e:
        status["pinecone"] = {"status": "error", "error": str(e)}
    
    return status
# Routes
app.include_router(auth.router)
app.include_router(recommend.router)
app.include_router(chat.router)
app.include_router(chathistory.router)
app.include_router(chatsessions.router)
app.include_router(explore.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)


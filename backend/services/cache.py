"""
Redis Caching Service

Provides caching utilities for user profiles and hot issues to reduce
database load and improve response times.

Usage:
    from backend.services.cache import (
        get_cached_user_profile, cache_user_profile,
        get_cached_hot_issues, cache_hot_issues
    )
"""
import json
import logging
from typing import Optional, List, Dict, Any
import redis

from utils.config import REDIS_URL

logger = logging.getLogger(__name__)

# Cache TTL settings (in seconds)
USER_PROFILE_TTL = 15 * 60  # 15 minutes
HOT_ISSUES_TTL = 30 * 60    # 30 minutes

# Redis connection pool (singleton)
_redis_client: Optional[redis.Redis] = None


def get_redis_client() -> redis.Redis:
    """Get or create Redis client connection."""
    global _redis_client
    
    if _redis_client is None:
        try:
            _redis_client = redis.Redis.from_url(
                REDIS_URL,
                decode_responses=True,
                socket_timeout=5,
                socket_connect_timeout=5
            )
            # Test connection
            _redis_client.ping()
            logger.info("✅ Redis connected successfully")
        except redis.ConnectionError as e:
            logger.warning(f"⚠️ Redis connection failed: {e}. Caching disabled.")
            return None
    
    return _redis_client


def cache_get(key: str) -> Optional[Dict]:
    """Get value from cache, returns None if not found or error."""
    client = get_redis_client()
    if not client:
        return None
    
    try:
        data = client.get(key)
        if data:
            return json.loads(data)
        return None
    except Exception as e:
        logger.warning(f"Cache get error for key {key}: {e}")
        return None


def cache_set(key: str, data: Dict, ttl_seconds: int = 900) -> bool:
    """Set value in cache with TTL. Returns True on success."""
    client = get_redis_client()
    if not client:
        return False
    
    try:
        client.setex(key, ttl_seconds, json.dumps(data))
        return True
    except Exception as e:
        logger.warning(f"Cache set error for key {key}: {e}")
        return False


def cache_delete(pattern: str) -> int:
    """Delete keys matching pattern. Returns count of deleted keys."""
    client = get_redis_client()
    if not client:
        return 0
    
    try:
        keys = client.keys(pattern)
        if keys:
            return client.delete(*keys)
        return 0
    except Exception as e:
        logger.warning(f"Cache delete error for pattern {pattern}: {e}")
        return 0


# ============================================
# User Profile Caching
# ============================================

def _user_profile_key(user_id: str) -> str:
    """Generate cache key for user profile."""
    return f"user:profile:{user_id}"


def get_cached_user_profile(user_id: str) -> Optional[Dict]:
    """Get cached user profile."""
    return cache_get(_user_profile_key(user_id))


def cache_user_profile(user_id: str, profile: Dict) -> bool:
    """Cache user profile with 15-minute TTL."""
    return cache_set(_user_profile_key(user_id), profile, USER_PROFILE_TTL)


def invalidate_user_profile(user_id: str) -> bool:
    """Invalidate cached user profile."""
    return cache_delete(_user_profile_key(user_id)) > 0


# ============================================
# Hot Issues Caching
# ============================================

def _hot_issues_key(language: str) -> str:
    """Generate cache key for hot issues by language."""
    return f"issues:hot:{language.lower()}"


def get_cached_hot_issues(language: str) -> Optional[List[Dict]]:
    """Get cached hot issues for a language."""
    data = cache_get(_hot_issues_key(language))
    if data:
        return data.get("issues", [])
    return None


def cache_hot_issues(language: str, issues: List[Dict]) -> bool:
    """Cache hot issues for a language with 30-minute TTL."""
    return cache_set(_hot_issues_key(language), {"issues": issues}, HOT_ISSUES_TTL)


def get_all_cached_languages() -> List[str]:
    """Get list of languages currently cached."""
    client = get_redis_client()
    if not client:
        return []
    
    try:
        keys = client.keys("issues:hot:*")
        return [k.replace("issues:hot:", "") for k in keys]
    except Exception as e:
        logger.warning(f"Error getting cached languages: {e}")
        return []


# ============================================
# Cache Stats
# ============================================

def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics for monitoring."""
    client = get_redis_client()
    if not client:
        return {"status": "disconnected"}
    
    try:
        info = client.info("stats")
        return {
            "status": "connected",
            "hits": info.get("keyspace_hits", 0),
            "misses": info.get("keyspace_misses", 0),
            "cached_languages": get_all_cached_languages()
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

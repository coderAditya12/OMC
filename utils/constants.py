"""
Constants - Single source of truth for labels and configuration values
"""

# Issue labels organized by difficulty level
BEGINNER_LABELS = [
    "good first issue",
    "good-first-issue",
    "first-timers-only",
    "beginner",
    "beginner-friendly",
    "easy",
    "starter",
    "up-for-grabs",
    "low-hanging-fruit",
]

INTERMEDIATE_LABELS = [
    "help wanted",
    "enhancement",
    "feature",
    "bug",
    "documentation",
    "tests",
    "refactor",
]

ADVANCED_LABELS = [
    "complex",
    "architecture",
    "performance",
    "security",
    "breaking-change",
    "core",
    "critical",
    "difficult",
]

# All labels combined (for fetching issues)
ALL_LABELS = BEGINNER_LABELS + INTERMEDIATE_LABELS + ADVANCED_LABELS

# Labels to fetch during sync (focus on beginner-friendly)
SYNC_LABELS = [
    "good first issue",
    "beginner",
    "help wanted",
    "good-first-issue",
    "first-timers-only",
    "easy",
    "starter",
]

# Cache TTL values (seconds)
USER_PROFILE_TTL = 15 * 60      # 15 minutes
HOT_ISSUES_TTL = 30 * 60        # 30 minutes
CACHED_ISSUES_TTL = 30 * 60     # 30 minutes

# Sync settings
MAX_ISSUES_PER_REPO = 20
README_CHUNK_SIZE = 1500
README_CHUNK_OVERLAP = 200

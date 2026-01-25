#!/bin/bash
# Issue Syncer Cron Script
# Run daily to sync GitHub issues to PostgreSQL
#
# Setup Instructions:
# 1. Make this script executable: chmod +x scripts/sync_issues.sh
# 2. Add to crontab: crontab -e
# 3. Add line: 0 3 * * * /path/to/OMC/scripts/sync_issues.sh >> /path/to/OMC/logs/sync.log 2>&1
#
# This runs daily at 3 AM

set -e

# Navigate to project directory
cd /home/aditya/Projects/OMC

# Activate virtual environment
source venv/bin/activate

# Log start time
echo "=============================="
echo "Issue Sync Started: $(date)"
echo "=============================="

# Run the syncer
python -m backend.services.issue_syncer

# Log end time
echo "=============================="
echo "Issue Sync Completed: $(date)"
echo "=============================="

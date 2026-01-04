"""
Tools module for LangGraph agent.

This module provides tool functions that the agent can use
to interact with external services like GitHub.
"""

from langchain.tools import tool

from core.github_client import fetch_file_content


@tool
def fetch_code(owner: str, repo: str, file_path: str) -> str:
    """
    Fetches the content of a specific file from a GitHub repository.
    Use this when you need to read the actual code to understand a bug/error.
    
    Args:
        owner: The username or organization (e.g., 'facebook')
        repo: The repository name (e.g., 'react')
        file_path: The full path to the file (e.g., 'packages/react/src/React.js')
    
    Returns:
        The file content as a string, or an error message.
    """
    try:
        print(f"🛠️ Agent is reading file: {file_path}")
        content = fetch_file_content(owner, repo, file_path)
        if content:
            return content
        else:
            return f"Error: Could not read file {file_path}. It might not exist."
    except Exception as e:
        return f"Error fetching file: {str(e)}"
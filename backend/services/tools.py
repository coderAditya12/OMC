"""
Agent Tools - Functions the agent can use to explore repos
"""
import base64
import requests
from langchain.tools import tool

GITHUB_URL = "https://api.github.com"

# Will be set by agent before running
_access_token = None
_repo_name = None


def set_context(access_token: str, repo_name: str):
    """Set context for tools to use"""
    global _access_token, _repo_name
    _access_token = access_token
    _repo_name = repo_name


def _get_headers():
    """Get GitHub API headers"""
    return {
        "Authorization": f"Bearer {_access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }


@tool
def get_file_tree(path: str = "", depth: int = 2) -> str:
    """
    Get the complete directory structure of the repository.
    Use this to explore what files and folders exist.
    
    Args:
        path: Directory path to explore (empty for root)
        depth: How deep to explore (default 2 levels)
    
    Returns:
        Complete file tree with subdirectories
    """
    if not _repo_name or not _access_token:
        return "Error: Repository context not set"
    
    def fetch_tree(current_path: str, current_depth: int, prefix: str = "") -> list:
        if current_depth <= 0:
            return []
        
        try:
            response = requests.get(
                f"{GITHUB_URL}/repos/{_repo_name}/contents/{current_path}",
                headers=_get_headers()
            )
            response.raise_for_status()
            
            lines = []
            items = response.json()
            
            for i, item in enumerate(items):
                is_last = i == len(items) - 1
                connector = "└── " if is_last else "├── "
                
                if item.get("type") == "dir":
                    lines.append(f"{prefix}{connector}📁 {item.get('name')}/")
                    # Recursively fetch subdirectory
                    new_prefix = prefix + ("    " if is_last else "│   ")
                    lines.extend(fetch_tree(item.get("path"), current_depth - 1, new_prefix))
                else:
                    lines.append(f"{prefix}{connector}📄 {item.get('name')}")
            
            return lines
        except Exception as e:
            return [f"{prefix}Error: {str(e)}"]
    
    try:
        tree_lines = fetch_tree(path, depth)
        if tree_lines:
            # Wrap in code block for proper formatting
            tree_content = "\n".join(tree_lines)
            return f"```\n📦 {_repo_name}\n{tree_content}\n```"
        return "Empty directory"
    except Exception as e:
        return f"Error: {str(e)}"


@tool
def fetch_file(file_path: str) -> str:
    """
    Fetch the content of a specific file from the repository.
    Use this when you need to see the actual code.
    
    Args:
        file_path: Path to the file (e.g., "src/index.js")
    
    Returns:
        The file content
    """
    if not _repo_name or not _access_token:
        return "Error: Repository context not set"
    
    try:
        response = requests.get(
            f"{GITHUB_URL}/repos/{_repo_name}/contents/{file_path}",
            headers=_get_headers()
        )
        response.raise_for_status()
        data = response.json()
        
        content = base64.b64decode(data.get("content", "")).decode("utf-8")
        
        # Limit size to avoid token limits
        if len(content) > 10000:
            return content[:10000] + "\n\n... (truncated)"
        return content
    except Exception as e:
        return f"Error fetching file: {str(e)}"


# Future tool - placeholder for Pinecone integration
# @tool
# def search_code(query: str) -> str:
#     """
#     Search for relevant code using semantic similarity.
#     Use this when you need to find code related to a concept.
#     """
#     # Will use Pinecone RAG here
#     pass


def get_tools():
    """Get list of available tools"""
    return [get_file_tree, fetch_file]

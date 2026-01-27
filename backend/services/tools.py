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
def get_file_tree(path: str = "", depth: int = 5, branch: str = "main") -> str:
    """
    Get the directory structure of the repository.
    Use this to explore what files and folders exist.
    Uses GitHub's Tree API to fetch entire tree in a single request.
    
    Args:
        path: Directory path to filter (empty for root)
        depth: How deep to explore (default 5 levels, max 10)
        branch: Branch to fetch tree from (default "main")
    
    Returns:
        File tree with subdirectories
    """
    if not _repo_name or not _access_token:
        return "Error: Repository context not set"
    
    depth = min(depth, 10)  # Allow deeper exploration
    MAX_ITEMS = 500  # Increased from 150
    
    try:
        # Use Tree API to get entire tree in one request
        response = requests.get(
            f"{GITHUB_URL}/repos/{_repo_name}/git/trees/{branch}?recursive=1",
            headers=_get_headers()
        )
        response.raise_for_status()
        data = response.json()
        
        # Items are inside the "tree" key
        tree_items = data.get("tree", [])
        
        # Filter by path prefix if specified
        if path:
            path = path.strip("/")
            tree_items = [item for item in tree_items if item.get("path", "").startswith(path)]
        
        lines = []
        item_count = 0
        
        for item in tree_items:
            if item_count >= MAX_ITEMS:
                lines.append(f"\n... (truncated, {len(tree_items) - MAX_ITEMS} more items)")
                break
            
            item_path = item.get("path", "")
            item_type = item.get("type", "")
            
            # Filter by depth
            if path:
                relative_path = item_path[len(path):].strip("/")
            else:
                relative_path = item_path
            
            path_depth = relative_path.count("/") + 1 if relative_path else 0
            if path_depth > depth:
                continue
            
            # Calculate indentation
            indent = "  " * relative_path.count("/")
            name = item_path.split("/")[-1]
            
            # Tree API uses "tree" for directories, "blob" for files
            if item_type == "tree":
                lines.append(f"{indent}📁 {name}/")
                item_count += 1
            elif item_type == "blob":
                lines.append(f"{indent}📄 {name}")
                item_count += 1
        
        if lines:
            tree_content = "\n".join(lines)
            return f"```\n📦 {_repo_name}\n{tree_content}\n```"
        return "Empty directory"
        
    except requests.exceptions.HTTPError as e:
        # If branch not found (404), try "master" as fallback
        if e.response.status_code == 404 and branch == "main":
            return get_file_tree.invoke({"path": path, "depth": depth, "branch": "master"})
        return f"Error: {str(e)}"
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


@tool
def get_github_link(file_path: str, start_line: int = None, end_line: int = None, branch: str = "main") -> str:
    """
    Generate a GitHub link to a specific file and line range.
    Use this to give users a direct clickable link to the code they need to work on.
    
    Args:
        file_path: Path to the file in the repo (e.g., "src/server/router.ts")
        start_line: Starting line number (optional)
        end_line: Ending line number (optional)  
        branch: Branch name (default "main", use "canary" for Next.js)
    
    Returns:
        GitHub URL to the file with line anchors
    """
    if not _repo_name:
        return "Error: Repository context not set"
    
    # Clean up file path
    file_path = file_path.lstrip("/")
    
    url = f"https://github.com/{_repo_name}/blob/{branch}/{file_path}"
    
    if start_line and end_line:
        url += f"#L{start_line}-L{end_line}"
    elif start_line:
        url += f"#L{start_line}"
    
    return url


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
    return [get_file_tree, fetch_file, get_github_link]

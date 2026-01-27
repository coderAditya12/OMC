"""
LangGraph Agent - Agentic AI for helping with open source issues
"""
import logging
from typing import Annotated, TypedDict, List
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from langchain_google_genai import ChatGoogleGenerativeAI
from utils.config import GROQ_API_KEY, GEMINI_API_KEY
from backend.services import tools
from backend.services.github import get_readme
from backend.services.pinecone_service import query_similar
from backend.services.readme_indexer import get_embedding

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Agent State
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    issue: dict
    repo_name: str


def get_rag_context(issue: dict, repo_name: str, top_k: int = 3) -> str:
    """
    Query Pinecone for relevant README context based on issue.
    
    Args:
        issue: Issue dict with title, body
        repo_name: Full repo name (owner/repo)
        top_k: Number of chunks to retrieve
    
    Returns:
        Concatenated relevant README chunks
    """
    try:
        # Create query from issue title + body
        query_text = f"{issue.get('title', '')} {issue.get('body', '')[:500]}"
        
        # Get embedding for query
        query_embedding = get_embedding(query_text)
        if not query_embedding:
            logger.warning("Failed to get query embedding, falling back to no RAG context")
            return ""
        
        # Query Pinecone - filter by repo if possible
        results = query_similar(
            query_embedding=query_embedding,
            namespace="readme",
            top_k=top_k,
            filter={"repo": repo_name}  # Only get chunks from this repo
        )
        
        # If no results for this repo, try without filter
        if not results:
            results = query_similar(
                query_embedding=query_embedding,
                namespace="readme",
                top_k=top_k
            )
        
        if not results:
            return ""
        
        # Combine chunks
        context_parts = []
        for match in results:
            text = match.get("metadata", {}).get("text", "")
            repo = match.get("metadata", {}).get("repo", "")
            if text:
                context_parts.append(f"[From {repo}]:\n{text}")
        
        if context_parts:
            logger.info(f"📚 RAG: Retrieved {len(context_parts)} relevant chunks")
            return "\n\n---\n\n".join(context_parts)
        
        return ""
        
    except Exception as e:
        logger.warning(f"RAG context retrieval failed: {e}")
        return ""


# Default system prompt
DEFAULT_SYSTEM_PROMPT = """
You are a friendly, exceptional senior-level open source contributor who LOVES helping beginners make their first contributions.
Be warm, encouraging, and approachable. Never be condescending or overwhelming.

ANTI-HALLUCINATION RULES (MANDATORY):
- Understand the user query, think twice before moving forward
- Never guess or fabricate file names, paths, or repository details
- If you don't have enough information, say so honestly
- Accuracy is more important than being helpful
-When a tool call fails, retry it once before giving up.
Don't ask permission to use tools - just use them.

KEY GUIDELINES:

1. **NEVER DUMP FULL FILE TREES**
   - Don't overwhelm users with entire directory structures
   - Instead, give SPECIFIC file paths they need to work on
   - Example: "You'll need to modify `src/components/Button.tsx`"
   - If they need to create a file: "Create `tests/Button.test.tsx` in the tests folder"

2. **When explaining the issue:**
   - Brief overview of the repo (2-3 sentences max)
   - Explain the issue clearly, define any jargon
   - Point to the SPECIFIC file(s) involved

3. **When asked about file structure:**
   - DON'T use get_file_tree to dump everything
   - DO tell them exactly which files matter for THIS issue
   - Example: "For this issue, focus on `src/parser.js` (the main logic) and `tests/parser.test.js` (tests)"

4. **When asked about prerequisites:**
   - List ONLY skills needed for THIS specific issue
   - Be specific: "Learn Redis caching" not "Learn Redis"
   - If learnable in 30 minutes, say so!

5. **When explaining files:**
   - Use fetch_file to get the actual code
   - Explain the relevant parts, not everything
   - Point to specific line numbers if possible

6. **When pointing to specific code:**
   - ALWAYS use get_github_link to provide a clickable GitHub URL
   - Include line numbers: get_github_link("path/to/file.ts", start_line=42, end_line=50)
   - Format your response like: "The fix needs to happen at [router-server.ts#L42-L50](url)"
   - For Next.js repos, use branch="canary"

RESPONSE FORMAT:
- Be SPECIFIC: Give exact file paths
- Be FOCUSED: Answer what they asked, nothing more
- Be ACTIONABLE: Steps they can follow right now
- Be ENCOURAGING: Remind them it's learnable

Always end with genuine encouragement - everyone starts somewhere!
"""


def create_agent(
    issue: dict,
    repo_name: str,
    access_token: str,
    system_prompt: str = None
):
    """
    Create a LangGraph agent for a specific issue
    
    Args:
        issue: Issue dict with title, body, labels
        repo_name: Full repo name (owner/repo)
        access_token: GitHub token
        system_prompt: Custom system prompt (optional)
    
    Returns:
        Compiled graph and initial state
    """
    # Set tool context
    tools.set_context(access_token, repo_name)
    
    # Get relevant context using RAG (Pinecone)
    rag_context = get_rag_context(issue, repo_name, top_k=3)
    if rag_context:
        readme_context = f"\n\n## Relevant README Context:\n{rag_context}"
    else:
        # Fallback to fetching full README
        readme = get_readme(repo_name, access_token)
        readme_context = f"\n\n## README:\n{readme[:3000]}" if readme else ""
    
    # Build issue context
    issue_context = f"""
## Current Issue: {issue.get('title', 'Unknown')}
Repository: {repo_name}
Labels: {', '.join(issue.get('labels', []))}

### Description:
{issue.get('body', 'No description provided')}
{readme_context}
"""
    
    # Create LLM with Groq Cloud (fast inference)
    # Valid Groq models: llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash",api_key=GEMINI_API_KEY,temperature=0)
    # llm = ChatGroq(
    #     model="llama-3.3-70b-versatile",
    #     api_key=GROQ_API_KEY,
    #     temperature=0
    # )
    
    # Bind tools to LLM
    tool_list = tools.get_tools()
    llm_with_tools = llm.bind_tools(tool_list)
    
    # Define agent node
    def agent_node(state: AgentState):
        messages = state["messages"]
        response = llm_with_tools.invoke(messages)
        print(response.content)
        return {"messages": [response]}
    
    # Define routing
    def should_continue(state: AgentState):
        last_message = state["messages"][-1]
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        return END
    
    # Build graph with recursion limit to prevent infinite loops
    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", ToolNode(tool_list))
    
    graph.add_edge(START, "agent")
    graph.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
    graph.add_edge("tools", "agent")
    
    # Add recursion limit to prevent infinite tool calling loops
    compiled = graph.compile()
    compiled = compiled.with_config({"recursion_limit": 10})
    
    # Create initial state with system message
    prompt = system_prompt or DEFAULT_SYSTEM_PROMPT
    initial_state = {
        "messages": [
            SystemMessage(content=f"{prompt}\n\n---\n{issue_context}")
        ],
        "issue": issue,
        "repo_name": repo_name
    }
    
    return compiled, initial_state


def chat(
    agent,
    state: dict,
    user_message: str,
    chat_history: list = None
) -> tuple[str, list]:
    """
    Send a message to the agent
    
    Args:
        agent: Compiled LangGraph agent
        state: Current agent state
        user_message: User's message
        chat_history: Previous messages (optional)
    
    Returns:
        Tuple of (AI response string, updated messages list)
    """
    # Add chat history if provided
    if chat_history:
        state["messages"].extend(chat_history)
    
    # Add user message
    state["messages"].append(HumanMessage(content=user_message))
    
    # Run agent
    try:
        logger.debug(f"Invoking agent with {len(state['messages'])} messages")
        result = agent.invoke(state)
        logger.debug("Agent invocation successful")
    except Exception as e:
        logger.error(f"Agent invocation failed: {type(e).__name__}: {str(e)}")
        raise
    
    # Get last AI message
    last_message = result["messages"][-1]
    content = last_message.content if hasattr(last_message, "content") else str(last_message)
    
    # Handle response format
    if isinstance(content, list):
        # Extract text from each part - preserve newlines between parts
        parts = []
        for part in content:
            if isinstance(part, dict):
                parts.append(part.get("text", ""))
            elif isinstance(part, str):
                parts.append(part)
            else:
                parts.append(str(part))
        response = "\n".join(parts)
    elif isinstance(content, dict):
        response = content.get("text", str(content))
    else:
        response = str(content)
    
    return response, result["messages"]


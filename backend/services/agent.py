"""
LangGraph Agent - Agentic AI for helping with open source issues
"""
from pydantic import SecretStr
import logging
from typing import Annotated, TypedDict, List
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from langchain_google_genai import ChatGoogleGenerativeAI
from utils.config import DEEPSEEK_API_KEY
from backend.services import tools
from backend.services.github import get_readme
from backend.services.pinecone_service import query_similar
from backend.services.readme_indexer import get_embedding
from langchain_openai import ChatOpenAI

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

if not DEEPSEEK_API_KEY:
    raise ValueError("DEEPSEEK_API_KEY is not set in environment variables. Please set it to use the agent.")
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

Your PRIMARY goal is to help users contribute effectively to open source projects
WITHOUT overwhelming them or assuming intent.

You MUST first classify the user's message into EXACTLY ONE category:

1. greeting / small talk  
   Examples: "hi", "hello", "thanks", "how are you"

2. general programming question (NOT tied to this repo or issue)  
   Examples: "what is redis?", "how does caching work?"

3. repository-level question  
   Examples: "what does this repo do?", "how is this project structured?"

4. issue-specific question  
   Examples: "explain this issue", "how do I solve issue #123?"

5. file or code explanation request  
   Examples: "explain auth.service.ts", "how does this function work?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTENT HANDLING RULES (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- If category = greeting / small talk:
  → Respond briefly and friendly
  → DO NOT use tools
  → DO NOT explain repo or issue
  → DO NOT fetch files

- If category = general programming question:
  → Answer generally
  → DO NOT use repository context
  → DO NOT fetch files

- ONLY if category ∈ {repository-level, issue-specific, file/code explanation}:
  → You MAY use repository context and tools

If the user did NOT explicitly ask about the repository, issue, or code:
DO NOT introduce them yourself.

It is correct and expected to respond WITHOUT using tools when they are unnecessary.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICT TOOL USAGE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- DO NOT ask permission to use tools
- DO NOT ask the user which file to read
- If the user explicitly asks to read or explain code:
  → Use fetch_file directly

- Investigate multiple files ONLY IF:
  - the user explicitly asks for a cross-file explanation
  - OR the logic cannot be understood from a single file

- If a tool call fails:
  → Retry again

NEVER retry tools or re-explain unless the USER asks again.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANTI-HALLUCINATION RULES (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Never guess or fabricate:
  - file names
  - paths
  - repository structure
  - issue details

- If you lack information:
  - you can make tool calls all the available tool calls then you can answer the user questions.

Accuracy is more important than verbosity.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CODE & FILE EXPLANATION MODE
(APPLIES ONLY WHEN USER ASKS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ONLY enter this mode if the user explicitly asks to:
- explain a file
- explain code
- understand how something works in the repo

When in this mode, follow these steps EXACTLY:

1. Use fetch_file to retrieve the actual source code
2. SHOW THE CODE FIRST (exact, unchanged)
   - Include line numbers or line ranges
3. AFTER showing the code:
   - Explain line-by-line or block-by-block
   - For each part:
     • what it does
     • why it exists
     • what breaks if removed or changed
4. If a line produces output or side effects:
   - Show a simple mock example
5. Skip:
   - boilerplate
   - unrelated imports
6. If another file is required:
   - Fetch the file
   - Repeat the same process

End with:
- A short summary of how this file fits into the system
- One encouraging sentence reminding the user this is learnable

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE EXPLORATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When the user asks about:
- "which files should I look at"
- "where is the code for X"
- "show me the project structure"
- "what files are in [directory]"
- any question about finding or locating files

You MUST:
1. Use get_file_tree IMMEDIATELY (do not ask permission)
2. If looking for specific functionality, start with common directories:
   - For UI: try "src/", "components/", "app/", "pages/"
   - For backend: try "server/", "api/", "services/"
   - For tests: try "test/", "__tests__/", "spec/"
3. Use fetch_file for specific files once you identify them
4. NEVER say "I cannot find files" or "file tree information is not available" 
   without FIRST trying get_file_tree with different paths/branches
5. If get_file_tree fails with "main", retry with branch="master"


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ISSUE EXPLANATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When explaining an issue:
- Give a brief repo overview
- Explain the issue in simple terms
- Define jargon the first time it appears
- Point to SPECIFIC files involved (use get_file_tree if needed)
- DO NOT dump full file trees unless explicitly requested

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PREREQUISITES RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If the user asks for prerequisites:
- List ONLY skills needed for THIS issue
- For each skill, mention WHAT PART to focus on
- If learnable in ~30 minutes, say so

Example:
"Redis (basic caching concepts only)"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINKING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When pointing to code:
- ALWAYS use get_github_link
- Include line numbers
- Format:
  "The fix needs to happen at [file.ts#L42-L50](url)"
- For Next.js repos, use branch="canary"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE STYLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Be SPECIFIC (exact files, exact steps)
- Be FOCUSED (answer what was asked, nothing extra)
- Be ACTIONABLE (what to do next)
- Be ENCOURAGING (everyone starts somewhere)

If the user message does not require technical depth:
KEEP THE RESPONSE SHORT.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT FINAL RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DON NOT give response in tabular form

"""
def create_agent(
    issue: dict,
    repo_name: str,
    access_token: str,
    system_prompt: str | None = None
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
    llm = ChatOpenAI(
        model="deepseek-v4-flash", 
        api_key=SecretStr(DEEPSEEK_API_KEY), 
        base_url="https://api.deepseek.com",
        temperature=0,
        extra_body={"thinking": {"type": "disabled"}}

    )

    
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
    compiled = compiled.with_config({"recursion_limit": 25})
    
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
    chat_history: list | None = None
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
    
    # Find the last AI message with actual content (not tool calls)
    response = ""
    for message in reversed(result["messages"]):
        # Skip tool messages
        if hasattr(message, "type") and message.type == "tool":
            continue
        
        # Check if it's an AI message with content
        if hasattr(message, "content"):
            content = message.content
            
            # Handle response format
            if isinstance(content, list):
                # Extract text from each part
                parts = []
                for part in content:
                    if isinstance(part, dict):
                        text = part.get("text", "")
                        if text:
                            parts.append(text)
                    elif isinstance(part, str) and part.strip():
                        parts.append(part)
                if parts:
                    response = "\n".join(parts)
                    break
            elif isinstance(content, dict):
                text = content.get("text", "")
                if text:
                    response = text
                    break
            elif isinstance(content, str) and content.strip():
                response = content
                break
    
    logger.debug(f"Final response length: {len(response)} chars")
    
    return response, result["messages"]


async def chat_stream(
    agent,
    state: dict,
    user_message: str,
):
    """
    Stream AI response tokens from the LangGraph agent using astream_events.

    Yields string tokens as they are generated.
    After completion, also updates state["messages"] in place.
    """
    from langchain_core.messages import HumanMessage, AIMessage

    # Add user message to state
    state["messages"].append(HumanMessage(content=user_message))

    full_response = ""

    try:
        async for event in agent.astream_events(state, version="v2"):
            kind = event.get("event", "")

            # Only capture tokens from the 'agent' node LLM streaming
            if kind == "on_chat_model_stream":
                # Skip if this event comes from a tool node
                tags = event.get("tags", [])
                if "tool" in " ".join(tags).lower():
                    continue

                chunk = event.get("data", {}).get("chunk")
                if chunk is None:
                    continue

                # Extract text content from the chunk
                content = chunk.content if hasattr(chunk, "content") else ""
                if isinstance(content, list):
                    for part in content:
                        if isinstance(part, dict):
                            text = part.get("text", "")
                            if text:
                                full_response += text
                                yield text
                        elif isinstance(part, str) and part:
                            full_response += part
                            yield part
                elif isinstance(content, str) and content:
                    full_response += content
                    yield content

    except Exception as e:
        logger.error(f"chat_stream error: {type(e).__name__}: {str(e)}")
        raise

    # After streaming is done, append the final AI message to state
    if full_response:
        state["messages"].append(AIMessage(content=full_response))

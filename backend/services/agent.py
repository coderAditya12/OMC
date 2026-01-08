"""
LangGraph Agent - Agentic AI for helping with open source issues
"""
from typing import Annotated, TypedDict
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

from utils.config import GEMINI_API_KEY
from backend.services import tools
from backend.services.github import get_readme


# Agent State
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    issue: dict
    repo_name: str


# Default system prompt - user will provide their own
DEFAULT_SYSTEM_PROMPT = """
You are an exceptional senior-level engineer who helps beginners contribute to open source projects.
When a user comes to you, remain humble. Do not show off your seniority or expertise.

RULES:
1. Do not overwhelm the user with too much information—only share what's necessary for the contribution.
2. Your main goal is to encourage the user to contribute to open source projects.
3. Stay humble and approachable at all times.

TOOLS YOU HAVE:
- get_file_tree: Browse the directory structure (use this to understand project layout)
- fetch_file: Read specific file contents (use this to check package.json, requirements.txt, or relevant code)

Use these tools proactively to gather information before responding.

RESPONSE STRUCTURE (for initial overview):
1. 📦 Repository Overview - Give the user an overview of the repo
   → Use get_file_tree to explore the structure first
2. 🐞 Issue Overview - Explain what the issue is about
3. 📚 Prerequisites - Only list what's necessary for this specific contribution
   → Use fetch_file to check dependencies if needed
4. 🛠️ Steps to Contribute - Clear, actionable steps
5. 🌱 Final Motivation - End with an encouraging quote

FOR FOLLOW-UP QUESTIONS:
- Answer directly and concisely
- Use tools only when needed to get specific information
- Do NOT repeat the full 5-step structure—just answer the question
- Stay friendly and supportive

###############
EXAMPLE RESPONSE (for initial overview):

📦 Repository Overview

This repository is a backend service built with Node.js and Express. It exposes a few REST APIs that fetch data from a database and return it to the client. The project is small and well-structured, which makes it a good place to learn how real-world backend features are added.

🐞 Issue Overview

This issue is about improving performance by adding caching to one of the frequently-used API endpoints.
Right now, every request hits the database directly. The goal is to store the response temporarily so repeated requests can be served faster.

📚 Prerequisites (Only What's Necessary)

To work on this issue, you only need:
- Basic understanding of Node.js and Express
- A beginner-level idea of what caching is
- Very basic knowledge of Redis (what it is and why it's used)

You don't need to be an expert in Redis—just knowing the basics is enough to start.

🛠️ Steps to Contribute

1. Fork and clone the repository to your local machine.
2. Identify the API endpoint mentioned in the issue.
3. Add Redis so the API checks cached data before querying the database.
4. If cached data exists, return it directly. If not, fetch from DB, cache it, then return.
5. Test the endpoint to make sure it works as expected.
6. Open a pull request explaining what you added in simple terms.

🌱 Final Motivation

"You don't need to know everything to contribute—learning while contributing is the open source way."

Trying something like caching is a great step forward. Even if it feels new, this is exactly how developers grow in open source. Keep going 🚀
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
    
    # Get README for context
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
    
    # Create LLM
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        api_key=GEMINI_API_KEY,
        temperature=0
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
    
    # Build graph
    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", ToolNode(tool_list))
    
    graph.add_edge(START, "agent")
    graph.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
    graph.add_edge("tools", "agent")
    
    compiled = graph.compile()
    
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
    result = agent.invoke(state)
    
    # Get last AI message
    last_message = result["messages"][-1]
    content = last_message.content if hasattr(last_message, "content") else str(last_message)
    
    # Handle Gemini 2.5 response format
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


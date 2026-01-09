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


# Default system prompt
DEFAULT_SYSTEM_PROMPT = """
You are a friendly, exceptional senior-level open source contributor who LOVES helping beginners make their first contributions.
Be warm, encouraging, and approachable. Never be condescending or overwhelming.

Beginners have so many question regarding the open source contribution and the repo in which they want to contribute as well. 
there are lot's of questions they can ask. The most common quesiton is:-
 - they can ask for explaining the issue.
 - they can ask for giving the entire file tree or folder structure
 - they can ask for what are the prerequisits for contributing in the issue
 - they can ask which file does what thing.
To solve these common queries and other queries as well. you have to follow these instructions strictly.
Instructions:-
ANTI-HALLUCINATION RULES (MANDATORY):
-understand the user query, think twice before step forward
- Never guess, assume, or fabricate repository details, file names, paths, issues, or behavior.
- If the repository, issue, or files are not provided or cannot be fetched using tools, explicitly say so.
- If a required tool is unavailable, fails, or returns incomplete data, stop and ask the user for the missing information.
- It is ALWAYS acceptable to say: “I don’t have enough information to answer this accurately.”
- Accuracy is more important than being helpful.

1. if user ask for explain the issue.
    - your response should include. 
    1. overview of the repo. the overview should not be too small or large. it should enough for user so he can get the intution about the repo.
    2.explain the issue in detail. so user can understand it very well.if you use any technical jargon they specify the meaning in bracket.

2. if user ask for entire file tree or folder structure.
    - your response should include
    1. first of all use the get_file_tree tool for getting the entire file tree structure. give it to the user alongside which folder contains which thing
    2. then tell the user, which file he needs to focus for contributing into the repo.
3. if user asks for what are the prerequists for contributing in the issue.
    - your response should include
    1. first of all list the prerequists concept and tech stack.
    2. then specify which topic/skill he needs to focus in the tech stack. because if you said user learn redis then he can be confused what in redis he should learn. if the problem related caching then just specify he needs to learn caching not other things like pubsub or message queue etc.
    3. List ONLY the skills needed for THIS specific issue
    4. Be realistic - don't require expertise the issue doesn't actually need
    5. If something can be learned in 30 minutes, say so!
4. if user ask for which file does what thing.
    - your response should include
    1. first of all use the fetch file tool for getting the entire file tree structure.
    2. tell user this file contains specifically what.
    2. then explain the code in detail so user can understand it very well.

🛠️ **Steps to Contribute**
1. Fork and clone the repository
2. [Specific setup steps based on the actual tech stack]
3. [Where to find the relevant code - reference actual file paths]
4. [What changes to make - be specific]
5. [How to test the changes]
6. Open a pull request with a clear description

🌱 **You've Got This!**
- End with genuine encouragement
- Remind them that everyone starts somewhere
- Offer to help with follow-up questions

QUALITY GUIDELINES:
- Be SPECIFIC: Reference actual file names and paths from the repository
- Be DETAILED but FOCUSED: Explain things clearly without unnecessary tangents
- Be PRACTICAL: Give actionable steps they can follow right now
- Be HONEST: If something is complex, say so - but reassure them it's learnable

FOR FOLLOW-UP QUESTIONS:
- Answer directly and specifically
- Use tools to fetch relevant files if needed
- Don't repeat the full structure - just answer what they asked
- Always be supportive
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
        model="gemini-2.5-flash",
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


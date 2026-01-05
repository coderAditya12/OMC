"""
Agent module for Open Source Maintainer workflow.

This module provides a functional approach to creating and running
a LangGraph-based agent for analyzing GitHub issues.
"""

from typing import Annotated, Sequence, TypedDict

from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

from core.config import GEMINI_API_KEY
from core.tools import fetch_code


# Type definitions
class AgentState(TypedDict):
    """State schema for the agent graph."""
    messages: Annotated[Sequence[BaseMessage], add_messages]


def create_llm(api_key: str, model: str = "gemini-2.5-flash", temperature: float = 0):
    """
    Create and configure the LLM instance.
    
    Args:
        api_key: The Gemini API key.
        model: Model name to use.
        temperature: Sampling temperature.
    
    Returns:
        Configured ChatGoogleGenerativeAI instance.
    """
    return ChatGoogleGenerativeAI(
        model=model,
        api_key=api_key,
        temperature=temperature
    )


def get_tools():
    """
    Get the list of available tools for the agent.
    
    Returns:
        List of tool functions.
    """
    return [fetch_code]


def agent_call(state: AgentState, model) -> dict:
    """
    Process the current state and generate a response.
    
    Args:
        state: Current agent state containing messages.
        model: The LLM model with tools bound.
    
    Returns:
        Dictionary with the new message to add to state.
    """
    messages = state["messages"]
    response = model.invoke(messages)
    return {"messages": [response]}


def should_continue(state: AgentState) -> str:
    """
    Determine if the agent should continue to tool execution or end.
    
    Args:
        state: Current agent state containing messages.
    
    Returns:
        "continue" if tool calls are present, "end" otherwise.
    """
    last_message = state["messages"][-1]
    
    if last_message.tool_calls:
        return "continue"
    
    return "end"


def build_graph(model, tools: list) -> StateGraph:
    """
    Construct the agent workflow graph.
    
    Args:
        model: The LLM model with tools bound.
        tools: List of tool functions.
    
    Returns:
        Compiled StateGraph ready for execution.
    """
    graph = StateGraph(AgentState)
    
    # Add nodes
    graph.add_node("agent_call", lambda state: agent_call(state, model))
    graph.add_node("toolNode", ToolNode(tools))
    
    # Add edges
    graph.add_edge(START, "agent_call")
    graph.add_conditional_edges(
        "agent_call",
        should_continue,
        {
            "continue": "toolNode",
            "end": END
        }
    )
    graph.add_edge("toolNode", "agent_call")
    
    return graph.compile()


def create_agent():
    """
    Create and return a fully configured agent graph.
    
    Returns:
        Compiled StateGraph ready for execution.
    """
    llm = create_llm(api_key=GEMINI_API_KEY)
    tools = get_tools()
    model = llm.bind_tools(tools)
    
    return build_graph(model, tools)


def generate_plan(app, issue_title: str, issue_body: str, repo_full_name: str) -> str:
    """
    Generate a plan for addressing a GitHub issue.
    
    Args:
        app: The compiled agent graph.
        issue_title: Title of the GitHub issue.
        issue_body: Body/description of the issue.
        repo_full_name: Full repository name (owner/repo).
    
    Returns:
        Markdown formatted plan as a string.
    """
    system_msg = f"""You are a Senior Open Source Maintainer for the repository {repo_full_name}.
Your task is to analyze GitHub issues and create actionable implementation plans.

Instructions:
1. Analyze the issue carefully
2. IF you need to see code, use 'fetch_code' tool with owner, repo, and file_path
3. Guess file paths if needed (e.g., 'src/index.js')
4. Output a clear Markdown plan with steps to fix the issue
"""

    user_msg = f"""Please analyze this issue and create a plan:

**Issue Title:** {issue_title}

**Issue Description:**
{issue_body or 'No description provided.'}

Provide a detailed implementation plan in Markdown format.
"""

    initial_state = {
        "messages": [
            SystemMessage(content=system_msg),
            HumanMessage(content=user_msg)
        ]
    }

    print(f"🤖 Starting Graph for {repo_full_name}...")
    
    # Run the graph and get the final output
    final_state = app.invoke(initial_state)
    
    # The last message is the AI's final answer
    last_message = final_state["messages"][-1]
    content = last_message.content
    
    # Handle case where content might be a list of content blocks
    if isinstance(content, list):
        # Extract text from content blocks
        text_parts = []
        for block in content:
            if isinstance(block, str):
                text_parts.append(block)
            elif isinstance(block, dict):
                # Handle {type: 'text', text: '...'} format
                if "text" in block:
                    text_parts.append(block["text"])
        return "\n\n".join(text_parts)
    
    # If it's already a string, return as-is
    if isinstance(content, str):
        return content
    
    # Fallback: convert to string
    return str(content) if content else "No plan generated."


# Convenience function for simple usage
def run_agent(issue_title: str, issue_body: str, repo_full_name: str) -> str:
    """
    One-shot function to create an agent and generate a plan.
    
    Args:
        issue_title: Title of the GitHub issue.
        issue_body: Body/description of the issue.
        repo_full_name: Full repository name (owner/repo).
    
    Returns:
        Markdown formatted plan as a string.
    """
    app = create_agent()
    return generate_plan(app, issue_title, issue_body, repo_full_name)
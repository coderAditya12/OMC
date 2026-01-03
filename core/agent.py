from core.config import GEMINI_API_KEY
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
class Agent:
    def __init__(self):
        self.Gemini_key = GEMINI_API_KEY
        #initialize the chat model
        self.llm_agent = ChatGoogleGenerativeAI(model="gemini-2.5-flash",
                                           api_key=GEMINI_API_KEY,temperature=0)
        
        
    def generate_contribution_plan(self,issue_title:str,issue_body:str):
        """
        Generates a step-by-step plan to fix the issue.
        """
        prompt = ChatPromptTemplate.from_messages([
            ("human", """You are a Senior Open Source Maintainer.
A new contributor wants to fix this issue:

ISSUE TITLE: {title}
ISSUE DESCRIPTION:
{body}

Task:
1. Analyze the issue.
2. Create a high-level step-by-step plan to fix it.
3. Suggest which files usually contain this kind of logic (e.g., if it's a frontend bug, suggest checking components/).
4. Keep it encouraging but technical.

Output Markdown.""")
        ])
        chain = prompt | self.llm_agent
        response = chain.invoke({
            "title": issue_title,
            "body": issue_body
        })
        return response.content
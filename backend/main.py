from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.agent import create_agent, generate_plan
from core.vector_store import query_search

# Initialize the agent graph once at startup
agent_app = create_agent()


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_credentials=False,
    allow_headers=["*"],
)
class IssueResponse(BaseModel):
    id: int
    title: str
    url: str
    repo_name: str
    score: float

class PlanRequest(BaseModel):
    title: str
    body: str
    repo_name:str
    



@app.get("/")
def root():
    return "server is healthy"


@app.get("/search", response_model=list[IssueResponse])
def search_issue(q: str, limit: int = 5):
    """
    Semantic Search Endpoint.
    User sends ?q="I want to fix React bugs"
    We return JSON list of matches.
    """
    if not q:
        raise HTTPException(status_code=400, detail="Please pass the Query")
    try:
        result = query_search(q, limit=limit)
        response = []
        for match in result:
            response.append(
                IssueResponse(
                    id=int(match["id"]),
                    title=match["metadata"]["title"],
                    url=match["metadata"]["url"],
                    repo_name=match["metadata"]["repo"],
                    score=match["score"],
                )
            )
        return response

    except Exception as e:
        print("Got error in Search api: ", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/generate-plan")
def generate_plan_endpoint(request: PlanRequest):
    print(f"🤖 Generating plan for: {request.title}")
    try:
        plan = generate_plan(agent_app, request.title, request.body, request.repo_name)
        return {"plan": plan}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="AI generation failed")
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
    

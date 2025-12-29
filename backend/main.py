from fastapi import FastAPI, HTTPException
from core.vector_store import vectorDB
from pydantic import BaseModel


app = FastAPI()
class IssueResponse(BaseModel):
    id:int
    title:str
    url:str
    repo_name:str
    score:float

vector_db = vectorDB()


@app.get("/")
def root():
    return "server is healthy"


@app.get("/search",response_model=list[IssueResponse])
def search_issue(q: str,limit:int=5):
    """
    Semantic Search Endpoint.
    User sends ?q="I want to fix React bugs"
    We return JSON list of matches.
    """
    if not q:
        raise HTTPException(status_code=400, detail="Please pass the Query")
    try:
        result = vector_db.querySearch(q,limit=limit)
        response = []
        for match in result:
            response.append(IssueResponse(
                id=int(match["id"]),
                title=match["metadata"]["title"],
                url=match["metadata"]["url"],
                repo_name=match["metadata"]['repo'],
                score=match['score']

            ))
        return response

    except Exception as e:
        print("Got error in Search api: ", e)
        raise HTTPException(status_code=500,detail="Internal Server Error")

if __name__=="__main__":
    import uvicorn
    uvicorn.run(app,host="localhost",port=8000)

"""
OpenSource Compass - Backend API
Clean, modular FastAPI server
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth,recommend,chat,chathistory,chatsessions

# Initialize FastAPI
app = FastAPI(title="OpenSource Compass API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://opensource-compass.vercel.app"],
    allow_methods=["*"],
    allow_credentials=False,
    allow_headers=["*"],
)

# Routes
@app.get("/")
def health():
    return {"status": "healthy"}
app.include_router(auth.router)
app.include_router(recommend.router)
app.include_router(chat.router)
app.include_router(chathistory.router)
app.include_router(chatsessions.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)

# 🧭 Open Source Compass

**AI-powered platform that helps developers find and contribute to open source projects that match their skills.**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![LangGraph](https://img.shields.io/badge/LangGraph-Agentic_AI-purple)

---

## 🎯 The Problem

Getting started with open source is **overwhelming**:

- 🔍 **Finding the right project** - Millions of repos, which one fits your skills?
- 📚 **Understanding codebases** - Large projects with complex structures are intimidating
- 🏷️ **Matching skill level** - "Good first issue" doesn't mean it's good for YOU
- ❌ **Wasted time** - Hours spent on issues that don't match your experience

---

## 💡 The Solution

**Open Source Compass** uses AI to:

1. **Analyze your GitHub profile** - Languages, experience level, project types
2. **Match you with personalized issues** - Based on YOUR skills, not just labels
3. **Provide an AI assistant** - Explain codebases, show file structures, guide contributions

---

## ✨ Features

### 🎯 Smart Issue Recommendations
- Analyzes your GitHub repos and languages
- Uses vector similarity (Pinecone) to find matching issues
- Considers experience level and interests

### 🤖 AI Chat Assistant
- Powered by LangGraph + Gemini
- Explains issues in simple terms
- Shows repository file structures
- Guides you through the contribution process

### 💬 Chat History
- Persistent conversations stored in PostgreSQL
- Continue where you left off
- Track your explored issues

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, Tailwind CSS, Framer Motion |
| **Backend** | FastAPI, Python 3.12 |
| **AI** | LangGraph, Google Gemini, LangChain |
| **Vector DB** | Pinecone |
| **Database** | PostgreSQL (Neon) |
| **Auth** | NextAuth.js with GitHub OAuth |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- PostgreSQL
- GitHub OAuth App

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/open-source-compass.git
cd open-source-compass
```

### 2. Setup Backend
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirement.txt

# Create .env file with:
# DATABASE_URL=postgresql://...
# GEMINI_API_KEY=...
# PINECONE_API_KEY=...
# PINECONE_INDEX=...

# Run backend
cd backend
fastapi dev main.py
```

### 3. Setup Frontend
```bash
cd frontend
npm install

# Create .env file with:
# GITHUB_ID=...
# GITHUB_SECRET=...
# NEXTAUTH_SECRET=...
# NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

npm run dev
```

### 4. Visit `http://localhost:3000`

---

## 🐳 Docker

```bash
docker compose up --build
```

---

## 📁 Project Structure

```
open-source-compass/
├── frontend/          # Next.js app
│   ├── app/           # Pages (login, home, chat)
│   ├── components/    # React components
│   └── store/         # Zustand state
├── backend/           # FastAPI server
│   ├── main.py        # API routes
│   └── services/      # Business logic
│       ├── agent.py   # LangGraph AI agent
│       ├── matcher.py # Issue matching
│       └── github.py  # GitHub API
├── db/                # Database models
└── utils/             # Shared utilities
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - feel free to use this project for learning or building your own!

---

## 🙏 Acknowledgments

- [LangGraph](https://github.com/langchain-ai/langgraph) for the agentic AI framework
- [Pinecone](https://www.pinecone.io/) for vector search
- [Vercel](https://vercel.com/) and [Render](https://render.com/) for hosting

---

**Made with ❤️ to help developers contribute to open source**

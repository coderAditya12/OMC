# Diagram 1: Complete System Architecture

```eraser
title OpenSource Compass - AI-Powered Open Source Contribution Platform

// ========================================
// USER & AUTHENTICATION LAYER
// ========================================

User [icon: user, color: blue]
GitHub OAuth [icon: github, color: black]

// ========================================
// FRONTEND - Next.js Application
// ========================================

Frontend App [icon: react, color: cyan] {
  Pages {
    Landing Page [icon: home]
    Login Page [icon: log-in]
    Home (Recommendations) [icon: compass]
    Explore Issues [icon: search]
    Chat Interface [icon: message-circle]
    Dashboard [icon: layout-dashboard]
    Auth Sync [icon: refresh-cw]
  }
  
  Components {
    Landing Components [icon: layout]
    Home Components [icon: grid]
    Chat Components [icon: message-square]
    UI Components [icon: package]
  }
  
  State Management {
    Zustand Chat Store [icon: database]
  }
  
  API Layer {
    NextAuth.js [icon: shield-check]
    Axios Client [icon: send]
  }
}

// ========================================
// API GATEWAY - FastAPI Backend
// ========================================

FastAPI Server [icon: server, color: green] {
  Main App {
    CORS Middleware [icon: shield]
    Health Check [icon: activity]
  }
  
  API Routers {
    /auth [icon: key]
    /recommend [icon: star]
    /chat [icon: message-circle]
    /chathistory [icon: clock]
    /chatsessions [icon: folder]
    /explore [icon: compass]
  }
}

// ========================================
// BUSINESS LOGIC LAYER
// ========================================

Core Services [icon: cpu, color: purple] {
  LangGraph Agent [icon: git-merge] {
    State Machine [icon: workflow]
    System Prompt Engine [icon: file-text]
    Tool Binding [icon: link-2]
    Message Handler [icon: message-square]
  }
  
  GitHub Tools [icon: github] {
    get_file_tree() [icon: folder-tree]
    fetch_file() [icon: file-code]
    get_github_link() [icon: external-link]
  }
  
  Recommendation Engine [icon: zap] {
    Profile Creator [icon: user-check]
    Repo Filter [icon: filter]
    Issue Matcher [icon: target]
  }
  
  Chat Management [icon: message-square] {
    Session Manager [icon: layers]
    Message Restoration [icon: rotate-ccw]
    Agent Cache [icon: hard-drive]
  }
}

// ========================================
// RAG PIPELINE
// ========================================

RAG System [icon: brain, color: pink] {
  Query Processing {
    Issue Context Extractor [icon: scissors]
    Query Embedding [icon: hash]
  }
  
  Pinecone Vector DB [icon: database] {
    README Namespace [icon: book-open]
    384-dim Vectors [icon: binary]
    Metadata Store [icon: tag]
  }
  
  Retrieval {
    Similarity Search [icon: search]
    Top-K Matching [icon: bar-chart-2]
    Context Injection [icon: corner-down-right]
  }
}

// ========================================
// BACKGROUND WORKERS
// ========================================

Background Jobs [icon: settings, color: orange] {
  Issue Syncer [icon: download-cloud] {
    Fetch from GitHub API [icon: cloud]
    Difficulty Detection [icon: sliders]
    Batch Upsert [icon: upload]
  }
  
  README Indexer [icon: book] {
    Fetch READMEs [icon: download]
    Text Chunking [icon: layout]
    Cohere Embeddings [icon: cpu]
    Pinecone Upload [icon: upload-cloud]
  }
  
  GitHub Actions [icon: play-circle] {
    Issue Sync Workflow [icon: refresh-cw]
    Keepalive Workflow [icon: heart-pulse]
  }
}

// ========================================
// DATA LAYER
// ========================================

PostgreSQL Database [icon: database, color: red] {
  Tables {
    Users (email PK) [icon: users]
    Repos (tier, stars) [icon: git-branch]
    Issues (difficulty, labels) [icon: alert-circle]
    ChatSessions [icon: message-square]
    ChatMessages [icon: file-text]
  }
}

Redis Cache [icon: zap, color: yellow] {
  Cache Types {
    User Profiles (15m TTL) [icon: user]
    Hot Issues (30m TTL) [icon: flame]
    Cache Stats [icon: bar-chart]
  }
}

// ========================================
// EXTERNAL SERVICES
// ========================================

External APIs [icon: cloud, color: gray] {
  GitHub API [icon: github]
  Gemini 2.5 Flash Lite [icon: sparkles]
  Groq Llama [icon: cpu]
  OpenRouter DeepSeek [icon: layers]
  Cohere Embeddings [icon: hash]
}

// ========================================
// CONNECTIONS & DATA FLOW
// ========================================

User > GitHub OAuth: OAuth Login
GitHub OAuth > Frontend App: Access Token

Frontend App > FastAPI Server: HTTPS API Calls
FastAPI Server > Core Services: Route Requests

// Recommendation Flow
Core Services > Redis Cache: Check Profile Cache
Core Services > PostgreSQL Database: Query Issues
Core Services > External APIs: Fetch GitHub Data
PostgreSQL Database > Core Services: Return Cached Issues

// Chat Flow
Core Services > LangGraph Agent: User Message
LangGraph Agent > GitHub Tools: Tool Calls
GitHub Tools > External APIs: GitHub API Requests
LangGraph Agent > RAG System: Query Context
RAG System > Pinecone Vector DB: Similarity Search
RAG System > LangGraph Agent: README Context
LangGraph Agent > External APIs: LLM Inference
LangGraph Agent > PostgreSQL Database: Save Messages

// Background Jobs Flow
Background Jobs > External APIs: Sync Data
Background Jobs > PostgreSQL Database: Upsert Issues/Repos
Background Jobs > RAG System: Index READMEs
Background Jobs > Redis Cache: Warm Cache

// Caching Flow
FastAPI Server > Redis Cache: Cache Operations
Redis Cache > PostgreSQL Database: Fallback on Miss

// Annotations
LangGraph Agent: "1. Classify intent\n2. Execute tools\n3. Format response\n4. Save to DB"
RAG System: "1. Embed query\n2. Vector search\n3. Retrieve chunks\n4. Inject context"
Background Jobs: "Runs on:\n- GitHub Actions (cron)\n- Manual trigger"
Redis Cache: "TTL-based:\n- Profiles: 15min\n- Issues: 30min"

```

---

# Diagram 2: Complete Request Flow

```eraser
title OpenSource Compass - Complete Request Flow

// ========================================
// USER JOURNEY: RECOMMENDATIONS
// ========================================

User Visits Home [shape: oval, icon: user, color: blue]
User Visits Home > GitHub Auth Check [icon: shield]

GitHub Auth Check > {
  Authenticated [icon: check-circle, color: green]
  Not Authenticated [icon: x-circle, color: red]
}

Not Authenticated > Redirect to Login [icon: log-in]
Redirect to Login > GitHub OAuth Flow [icon: github]
GitHub OAuth Flow > Store Access Token [icon: key]

Authenticated > Load Home Page [icon: home]
Store Access Token > Load Home Page

Load Home Page > POST /recommend [icon: send, color: purple]

// ========================================
// RECOMMENDATION PIPELINE
// ========================================

POST /recommend > Fetch User from GitHub [icon: user]
Fetch User from GitHub > Get User Repos [icon: git-branch]

Get User Repos > {
  Has Repos [icon: folder, color: green]
  No Repos (New User) [icon: user-plus, color: orange]
}

Has Repos > Create User Profile [icon: file-text]
Create User Profile > Extract Languages [icon: code]

No Repos (New User) > Use Default Languages [icon: list]
Use Default Languages > Set: Python, JS, TS [icon: tag]

Extract Languages > Check Redis Cache [icon: zap, color: yellow]

Check Redis Cache > {
  Cache Hit [icon: check, color: green]
  Cache Miss [icon: x, color: red]
}

Cache Hit > Return Cached Issues [icon: database]
Cache Miss > Query PostgreSQL [icon: database, color: red]

Query PostgreSQL > Get Issues by Language [icon: search]
Get Issues by Language > {
  Issues Found [icon: check-circle, color: green]
  No Issues [icon: alert-circle, color: orange]
}

Issues Found > Filter Chatted Issues [icon: filter]
No Issues > Fallback to Popular [icon: trending-up]

Fallback to Popular > Filter Chatted Issues

Filter Chatted Issues > Run Matcher Algorithm [icon: cpu]
Run Matcher Algorithm > Score & Rank Issues [icon: bar-chart]
Score & Rank Issues > Cache Results [icon: save]
Cache Results > Return Recommendations [shape: oval, icon: star, color: green]

// ========================================
// USER JOURNEY: CHAT WITH AGENT
// ========================================

User Clicks Issue [shape: oval, icon: mouse-pointer, color: blue]
User Clicks Issue > Navigate to /chat [icon: message-circle]

Navigate to /chat > POST /chat [icon: send, color: purple]
POST /chat > Get or Create Session [icon: database]

Get or Create Session > {
  Session Exists [icon: folder-open, color: green]
  New Session [icon: folder-plus, color: blue]
}

New Session > Create Agent [icon: cpu]
Create Agent > Query RAG for README [icon: search]

Query RAG for README > Generate Query Embedding [icon: hash]
Generate Query Embedding > Search Pinecone [icon: database, color: pink]

Search Pinecone > {
  README Found [icon: check, color: green]
  No README [icon: x, color: red]
}

README Found > Inject Context [icon: corner-down-right]
No README > Fetch Full README [icon: download]

Fetch Full README > Inject Context
Inject Context > Initialize LangGraph [icon: git-merge]
Initialize LangGraph > Bind GitHub Tools [icon: tool]
Bind GitHub Tools > Cache Agent [icon: hard-drive]

Session Exists > Load Cached Agent [icon: folder-open]
Load Cached Agent > Restore Chat History [icon: clock]

Cache Agent > Process User Message [icon: message-square]
Restore Chat History > Process User Message

// ========================================
// LANGGRAPH AGENT PROCESSING
// ========================================

Process User Message > Classify Intent [icon: filter, color: orange]

Classify Intent > {
  Small Talk [icon: message-circle]
  File Question [icon: folder-tree]
  Code Explanation [icon: code]
  General Question [icon: help-circle]
  Issue Explanation [icon: info]
}

Small Talk > Skip Tools [icon: fast-forward]
General Question > Skip Tools

File Question > Call get_file_tree() [icon: folder-tree, color: orange]
Code Explanation > Call fetch_file() [icon: file-code, color: orange]
Issue Explanation > Call get_github_link() [icon: link, color: orange]

Call get_file_tree() > GitHub API Request [icon: github, color: black]
Call fetch_file() > GitHub API Request
Call get_github_link() > Generate URL [icon: link-2]

GitHub API Request > Parse Response [icon: file-text]
Parse Response > Return to Agent [icon: corner-up-left]
Generate URL > Return to Agent

Skip Tools > Format Context [icon: align-left]
Return to Agent > Format Context

Format Context > Call LLM [icon: brain, color: purple]

Call LLM > {
  Gemini 2.5 Flash [icon: sparkles]
  Groq Llama [icon: zap]
  OpenRouter DeepSeek [icon: cloud]
}

Gemini 2.5 Flash > Generate Response [icon: cpu]
Groq Llama > Generate Response
OpenRouter DeepSeek > Generate Response

Generate Response > Check Tool Calls [icon: git-branch]

Check Tool Calls > {
  Has Tool Calls [icon: tool, color: orange]
  No Tool Calls [icon: check, color: green]
}

Has Tool Calls > Call get_file_tree()
No Tool Calls > Save to Database [icon: save]

Save to Database > Save User Message [icon: message-square]
Save User Message > Save AI Response [icon: bot]
Save AI Response > Update Agent Cache [icon: refresh-cw]
Update Agent Cache > Return to Frontend [shape: oval, icon: monitor, color: green]

// ========================================
// BACKGROUND SYNC WORKFLOW
// ========================================

GitHub Actions Cron [shape: oval, icon: clock, color: gray]
GitHub Actions Cron > Trigger Sync Job [icon: play-circle]

Trigger Sync Job > Fetch All Repos [icon: database]
Fetch All Repos > For Each Repo Loop [icon: repeat]

For Each Repo Loop > Fetch Issues from GitHub [icon: download-cloud]
Fetch Issues from GitHub > Detect Difficulty [icon: sliders]
Detect Difficulty > Upsert to PostgreSQL [icon: upload]

Upsert to PostgreSQL > Trigger README Indexer [icon: book]
Trigger README Indexer > Fetch README Content [icon: download]
Fetch README Content > Chunk Text [icon: scissors]
Chunk Text > Generate Cohere Embeddings [icon: cpu]
Generate Cohere Embeddings > Upsert to Pinecone [icon: upload-cloud, color: pink]
Upsert to Pinecone > Update Redis Cache [icon: zap, color: yellow]
Update Redis Cache > Sync Complete [shape: oval, icon: check-circle, color: green]

```

---

# Diagram 3: Database Schema

```eraser
title OpenSource Compass - Database Schema

Users [icon: users, color: blue] {
  email (PK) [icon: key]
  name [icon: user]
  image [icon: image]
}

Repos [icon: git-branch, color: green] {
  id (PK) [icon: key]
  full_name (unique) [icon: tag]
  owner [icon: user]
  name [icon: file]
  language [icon: code]
  description [icon: file-text]
  stars [icon: star]
  tier [icon: award]
  last_synced [icon: clock]
  is_active [icon: check-circle]
  created_at [icon: calendar]
}

Issues [icon: alert-circle, color: orange] {
  id (PK) [icon: key]
  repo_id (FK) [icon: link]
  github_id [icon: hash]
  number [icon: hash]
  title [icon: type]
  body [icon: file-text]
  labels (JSON) [icon: tag]
  difficulty [icon: sliders]
  html_url [icon: link]
  is_open [icon: circle]
  comments_count [icon: message-circle]
  created_at [icon: calendar]
  updated_at [icon: clock]
  fetched_at [icon: download]
}

ChatSessions [icon: message-square, color: purple] {
  id (PK) [icon: key]
  user_id [icon: user]
  issue_url [icon: link]
  repo_name [icon: git-branch]
  issue_title [icon: type]
  created_at [icon: calendar]
}

ChatMessages [icon: file-text, color: cyan] {
  id (PK) [icon: key]
  session_id (FK) [icon: link]
  role [icon: user-check]
  content [icon: align-left]
  created_at [icon: calendar]
}

Repos > Issues: one-to-many
ChatSessions > ChatMessages: one-to-many

```

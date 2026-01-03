"use client";

import { useState } from "react";
import { Search, Github, ArrowRight, Loader2, Sparkles, X, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import axios from "axios";

// --- Types ---
interface Issue {
  id: number;
  title: string;
  url: string;
  repo_name: string;
  score: number;
  body?: string; // We might need this later
}

interface PlanResponse {
  plan: string;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Issue[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  
  // State for the AI Plan Modal
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [plan, setPlan] = useState<string>("");
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Handlers ---

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoadingSearch(true);
    setResults([]); 
    
    try {
      const res = await axios.get(`http://localhost:8000/search?q=${query}&limit=5`);
      const data =res.data
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch issues:", error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleGeneratePlan = async (issue: Issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
    setLoadingPlan(true);
    setPlan(""); // Reset previous plan

    try {
      const res = await axios.post("http://localhost:8000/generate-plan", 
        {
          title: issue.title,
          body: "Description not fetched yet in this demo" // In real app, fetch full body first
        }
    );
      
      const data: PlanResponse = res.data
      console.log("Received plan:", data.plan);
      setPlan(data.plan);
    } catch (error) {
      setPlan("❌ Error: Failed to generate plan. Please try again.");
    } finally {
      setLoadingPlan(false);
    }
  };

  // --- UI Components ---

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center pt-24 px-4 pb-20">
      
      {/* 1. Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600/10 p-3 rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Github className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          OpenSource <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Matchmaker</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Don't just search for keywords. Describe the bug you want to fix, and our AI will find the perfect issue & guide you.
        </p>
      </motion.div>

      {/* 2. Search Bar */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-200"></div>
          <div className="relative flex items-center bg-[#111] rounded-lg border border-gray-800 p-2">
            <Search className="w-5 h-5 text-gray-400 ml-3" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. 'I know React and want to fix UI bugs'..." 
              className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 p-3 text-lg outline-none"
            />
            <button 
              onClick={handleSearch}
              disabled={loadingSearch}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-md font-medium transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loadingSearch ? <Loader2 className="w-5 h-5 animate-spin" /> : "Match"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* 3. Results List */}
      <div className="w-full max-w-2xl mt-12 space-y-4">
        {results.map((issue, index) => (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-[#111] border border-gray-800 hover:border-blue-500/50 p-6 rounded-xl transition-all hover:bg-[#161616]"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-blue-400 bg-blue-900/20 px-2 py-1 rounded border border-blue-900/30">
                    {issue.repo_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    Match: {(issue.score * 100).toFixed(0)}%
                  </span>
                </div>
                <h3 className="text-xl font-semibold group-hover:text-blue-400 transition-colors mb-2">
                  {issue.title}
                </h3>
                
                <div className="flex gap-3 mt-4">
                  {/* Primary Action: Go to GitHub */}
                  <a 
                    href={issue.url} 
                    target="_blank" 
                    className="text-sm flex items-center gap-1 text-gray-400 hover:text-white transition-colors border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-md"
                  >
                    <Github className="w-4 h-4" /> View Issue
                  </a>

                  {/* Secondary Action: AI Agent */}
                  <button
                    onClick={() => handleGeneratePlan(issue)}
                    className="text-sm flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors border border-blue-900/50 hover:border-blue-500/50 bg-blue-900/10 px-3 py-1.5 rounded-md"
                  >
                    <Sparkles className="w-4 h-4" /> Generate Plan
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 4. AI Plan Modal (The "Copilot" UI) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] border border-gray-800 w-full max-w-3xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-800 flex justify-between items-start bg-[#161616]">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-blue-400">
                    <Sparkles className="w-5 h-5" /> AI Contributor Plan
                  </h2>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                    Strategy for: {selectedIssue?.title}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {loadingPlan ? (
                  <div className="flex flex-col items-center justify-center h-48 space-y-4">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-gray-400 animate-pulse">Reading issue context...</p>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-blue max-w-none">
                    <ReactMarkdown>{plan}</ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-800 bg-[#161616] flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <a 
                  href={selectedIssue?.url} 
                  target="_blank"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium flex items-center gap-2"
                >
                   Start Coding <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
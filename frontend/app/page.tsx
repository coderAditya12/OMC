"use client";

import { useState } from "react";
import { Search, ArrowRight, Loader2,Computer} from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";

// Define what an Issue looks like (matches your Python API)
interface Issue {
  id: number;
  title: string;
  url: string;
  repo_name: string;
  score: number;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);

  // The Search Logic
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setResults([]); // Clear old results

    try {
      // Connect to your Python Backend
      const responseData = await axios.get(`http://localhost:8000/search?q=${query}&limit=5`);

      console.log(responseData)
      setResults(responseData.data);
    } catch (error) {
      console.error("Failed to fetch issues:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center pt-24 px-4">
      {/* 1. Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600/10 p-3 rounded-full border border-blue-500/20">
            <Computer className="w-8 h-8 text-blue-500" />

          </div>
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          OpenSource <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Matchmaker</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Don't just search for keywords. Describe the bug you want to fix, and our AI will find the perfect issue for you.
        </p>
      </motion.div>

      {/* 2. Search Bar */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-2xl relative"
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
              placeholder="e.g. 'I want to fix memory leaks in Python'..." 
              className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 p-3 text-lg outline-none"
            />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Match"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* 3. Results Grid */}
      <div className="w-full max-w-2xl mt-12 space-y-4">
        {results.map((issue, index) => (
          <motion.a
            key={issue.id}
            href={issue.url}
            target="_blank"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="block group"
          >
            <div className="bg-[#111] border border-gray-800 hover:border-blue-500/50 p-6 rounded-xl transition-all hover:bg-[#161616]">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-blue-400 bg-blue-900/20 px-2 py-1 rounded">
                      {issue.repo_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      Match: {(issue.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                    {issue.title}
                  </h3>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </motion.a>
        ))}

        {/* Empty State */}
        {!loading && results.length === 0 && query && (
          <div className="text-center text-gray-500 mt-8">
            <p>No matches found. Try describing your skills differently.</p>
          </div>
        )}
      </div>
    </main>
  );
}
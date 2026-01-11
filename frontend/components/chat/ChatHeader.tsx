"use client";

/**
 * ChatHeader Component - ChatGPT Style
 * 
 * Clean header with issue context and sidebar toggle
 */

import { motion } from "framer-motion";
import Link from "next/link";

interface ChatHeaderProps {
    issueTitle: string;
    repoName: string;
    issueUrl?: string;
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
}

export default function ChatHeader({
    issueTitle,
    repoName,
    issueUrl,
    sidebarOpen,
    onToggleSidebar
}: ChatHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-950/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40"
        >
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
                {/* Toggle Sidebar Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onToggleSidebar}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                >
                    <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {sidebarOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </motion.button>

                {/* Issue Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs">🧭</span>
                        </div>
                        <h1 className="text-white font-semibold truncate">
                            {issueTitle || "New Chat"}
                        </h1>
                    </div>
                    {repoName && (
                        <p className="text-white/50 text-sm truncate pl-8">
                            {repoName}
                        </p>
                    )}
                </div>

                {/* View Issue Button */}
                {issueUrl && (
                    <a
                        href={issueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white text-sm transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span className="hidden sm:inline">View Issue</span>
                    </a>
                )}
            </div>
        </motion.div>
    );
}

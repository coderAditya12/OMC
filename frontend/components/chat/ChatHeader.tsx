"use client";

/**
 * ChatHeader Component
 * Header with compass logo, AI status badge, and tool buttons
 */

import { motion } from "framer-motion";

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
            className="glass-navbar sticky top-0 z-40"
        >
            <div className="max-w-5xl mx-auto px-4 py-3">
                <div className="flex items-center gap-4">
                    {/* Toggle Sidebar Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onToggleSidebar}
                        className="p-2 hover:bg-[hsl(0,0%,100%,0.1)] rounded-lg transition-colors"
                        title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                    >
                        <svg className="w-5 h-5 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {sidebarOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </motion.button>

                    {/* Logo & Title */}
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ rotate: 45 }}
                            className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] flex items-center justify-center"
                        >
                            <span className="text-sm">🧭</span>
                        </motion.div>
                        <div>
                            <h1 className="text-white font-semibold flex items-center gap-2">
                                AI Assistant
                                {/* Active Badge */}
                                <span className="badge-active px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(142,71%,55%)] animate-pulse"></span>
                                    Active
                                </span>
                            </h1>
                            <p className="text-[var(--foreground-subtle)] text-xs">
                                Powered by RAG + LangGraph
                            </p>
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Tool Buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        {issueUrl && (
                            <a
                                href={issueUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-ghost text-xs flex items-center gap-1.5"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Issue Details
                            </a>
                        )}
                    </div>
                </div>

                {/* Issue Context Bar */}
                {(issueTitle && issueTitle !== "Unknown Issue") && (
                    <div className="mt-2 pt-2 border-t border-[var(--border)]">
                        <p className="text-sm text-white truncate">{issueTitle}</p>
                        {repoName && (
                            <p className="text-xs text-[var(--foreground-subtle)]">{repoName}</p>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

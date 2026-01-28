"use client";

/**
 * ChatSidebar Component
 * Clean session history with new design system
 */

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

interface ChatSession {
    session_id: string;
    issue_title: string;
    repo_name: string;
    created_at: string;
}

interface ChatSidebarProps {
    sessions: ChatSession[];
    currentSessionId: string | null;
    isOpen: boolean;
    onSessionClick: (session: ChatSession) => void;
    onNewChat?: () => void;
}

export default function ChatSidebar({
    sessions,
    currentSessionId,
    isOpen,
    onSessionClick,
    onNewChat
}: ChatSidebarProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-72 bg-[hsl(240,10%,6%)] border-r border-[var(--border)] flex flex-col h-screen sticky top-0"
        >
            {/* Header with New Chat button */}
            <div className="p-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/home")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] hover:bg-[hsl(0,0%,100%,0.05)] hover:border-[hsl(191,91%,37%,0.3)] transition-all text-[var(--foreground-muted)] hover:text-white"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-medium">New Issue Chat</span>
                </motion.button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto px-3">
                <div className="text-xs font-semibold text-[var(--foreground-subtle)] uppercase tracking-wider px-3 py-3">
                    Recent Chats
                </div>

                {sessions.length === 0 ? (
                    <div className="px-3 py-8 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[hsl(0,0%,100%,0.05)] flex items-center justify-center">
                            <svg className="w-6 h-6 text-[var(--foreground-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-[var(--foreground-muted)] text-sm">No chats yet</p>
                        <p className="text-[var(--foreground-subtle)] text-xs mt-1">Start by selecting an issue</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {sessions.map((session, index) => (
                            <motion.button
                                key={session.session_id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => onSessionClick(session)}
                                className={`w-full text-left px-3 py-3 rounded-xl transition-all group ${currentSessionId === session.session_id
                                    ? "bg-[hsl(191,91%,37%,0.15)] border border-[hsl(191,91%,37%,0.3)]"
                                    : "hover:bg-[hsl(0,0%,100%,0.05)]"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${currentSessionId === session.session_id
                                        ? "bg-[hsl(191,91%,37%,0.25)]"
                                        : "bg-[hsl(0,0%,100%,0.05)] group-hover:bg-[hsl(0,0%,100%,0.1)]"
                                        }`}>
                                        <svg className={`w-4 h-4 ${currentSessionId === session.session_id
                                            ? "text-[hsl(191,91%,55%)]"
                                            : "text-[var(--foreground-subtle)]"
                                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${currentSessionId === session.session_id
                                            ? "text-white"
                                            : "text-[var(--foreground-muted)]"
                                            }`}>
                                            {session.issue_title}
                                        </p>
                                        <p className="text-xs text-[var(--foreground-subtle)] truncate mt-0.5">
                                            {session.repo_name}
                                        </p>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--border)]">
                <Link
                    href="/home"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[hsl(0,0%,100%,0.05)] transition-all text-[var(--foreground-muted)] hover:text-white text-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Back to Dashboard</span>
                </Link>
            </div>
        </motion.div>
    );
}

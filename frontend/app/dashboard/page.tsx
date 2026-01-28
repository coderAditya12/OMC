"use client";

/**
 * Dashboard Page - OpenSource Compass
 * Shows user profile and all chat history organized by issue
 */

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// Components
import HomeNavbar from "@/components/home/HomeNavbar";
import FloatingOrbs from "@/components/ui/FloatingOrbs";

interface ChatSession {
    session_id: string;
    issue_title: string;
    repo_name: string;
    created_at: string;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    created_at: string;
}

interface ChatHistory {
    session_id: string;
    issue_title: string;
    repo_name: string;
    messages: Message[];
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSession, setExpandedSession] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatHistory | null>(null);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Fetch all chat sessions
    useEffect(() => {
        if (!session?.user?.email || status !== "authenticated") return;

        const fetchSessions = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/sessions/${session.user?.email}`
                );
                setSessions(response.data.sessions || []);
            } catch (err) {
                console.error("Failed to fetch sessions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [session, status]);

    // Fetch chat history for a session
    const fetchChatHistory = async (sessionId: string) => {
        if (expandedSession === sessionId) {
            setExpandedSession(null);
            setChatHistory(null);
            return;
        }

        setLoadingHistory(true);
        setExpandedSession(sessionId);

        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/history/${sessionId}`
            );
            setChatHistory(response.data);
        } catch (err) {
            console.error("Failed to fetch chat history:", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Loading State
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-[hsl(191,91%,37%)] border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen overflow-hidden" style={{ background: "var(--background)" }}>
            {/* Background */}
            <FloatingOrbs />

            {/* Navigation */}
            <HomeNavbar
                userImage={session.user?.image}
                userName={session.user?.name}
            />

            {/* Main Content */}
            <main className="pt-24 pb-12 px-6 relative z-10">
                <div className="max-w-4xl mx-auto">

                    {/* Profile Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8 mb-8"
                    >
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            {session.user?.image && (
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] rounded-2xl blur opacity-40" />
                                    <Image
                                        src={session.user.image}
                                        alt="Profile"
                                        width={96}
                                        height={96}
                                        className="relative rounded-2xl border-2 border-[hsl(191,91%,37%,0.5)]"
                                    />
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-white mb-1">
                                    {session.user?.name || "Developer"}
                                </h1>
                                <p className="text-[var(--foreground-muted)] mb-4">
                                    {session.user?.email}
                                </p>

                                {/* Stats */}
                                <div className="flex gap-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold gradient-text">{sessions.length}</div>
                                        <div className="text-xs text-[var(--foreground-subtle)]">Chat Sessions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">
                                            {sessions.reduce((acc, s) => acc + (s.issue_title ? 1 : 0), 0)}
                                        </div>
                                        <div className="text-xs text-[var(--foreground-subtle)]">Issues Explored</div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex flex-col gap-2">
                                <Link
                                    href="/home"
                                    className="btn-primary text-sm px-4 py-2"
                                >
                                    Find Issues
                                </Link>
                                <Link
                                    href="/chat"
                                    className="btn-ghost text-sm px-4 py-2"
                                >
                                    New Chat
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Chat History Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-8"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            Chat History
                        </h2>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-8 h-8 border-3 border-[hsl(191,91%,37%)] border-t-transparent rounded-full"
                                />
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[hsl(0,0%,100%,0.1)] flex items-center justify-center">
                                    <svg className="w-8 h-8 text-[var(--foreground-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-[var(--foreground-muted)] text-lg">No chat history yet</p>
                                <p className="text-[var(--foreground-subtle)] text-sm mt-2">
                                    Start by exploring issues and chatting with the AI
                                </p>
                                <Link href="/home" className="btn-primary inline-block mt-6">
                                    Find Issues
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sessions.map((chatSession, index) => (
                                    <motion.div
                                        key={chatSession.session_id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        {/* Session Card */}
                                        <button
                                            onClick={() => fetchChatHistory(chatSession.session_id)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all ${expandedSession === chatSession.session_id
                                                    ? "bg-[hsl(191,91%,37%,0.1)] border-[hsl(191,91%,37%,0.3)]"
                                                    : "bg-[hsl(0,0%,100%,0.03)] border-[var(--border)] hover:border-[hsl(191,91%,37%,0.3)] hover:bg-[hsl(0,0%,100%,0.05)]"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-white font-medium truncate">
                                                        {chatSession.issue_title || "Untitled Chat"}
                                                    </h3>
                                                    <p className="text-[var(--foreground-subtle)] text-sm mt-1">
                                                        {chatSession.repo_name}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[var(--foreground-subtle)] text-xs">
                                                        {formatDate(chatSession.created_at)}
                                                    </span>
                                                    <motion.div
                                                        animate={{ rotate: expandedSession === chatSession.session_id ? 180 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <svg className="w-5 h-5 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </button>

                                        {/* Expanded Chat History */}
                                        <AnimatePresence>
                                            {expandedSession === chatSession.session_id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-2 p-4 rounded-xl bg-[hsl(240,10%,6%)] border border-[var(--border)]">
                                                        {loadingHistory ? (
                                                            <div className="flex items-center justify-center py-8">
                                                                <motion.div
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                    className="w-6 h-6 border-2 border-[hsl(191,91%,37%)] border-t-transparent rounded-full"
                                                                />
                                                            </div>
                                                        ) : chatHistory?.messages.length === 0 ? (
                                                            <p className="text-[var(--foreground-subtle)] text-center py-4">
                                                                No messages in this chat
                                                            </p>
                                                        ) : (
                                                            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                                                                {chatHistory?.messages.map((msg, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                                                                    >
                                                                        {msg.role === "assistant" && (
                                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] flex items-center justify-center flex-shrink-0">
                                                                                <span className="text-sm">🧭</span>
                                                                            </div>
                                                                        )}
                                                                        <div
                                                                            className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === "user"
                                                                                    ? "bg-[hsl(191,91%,37%,0.2)] text-white"
                                                                                    : "bg-[hsl(0,0%,100%,0.05)] text-[var(--foreground-muted)]"
                                                                                }`}
                                                                        >
                                                                            <p className="whitespace-pre-wrap break-words">
                                                                                {msg.content.length > 300
                                                                                    ? msg.content.substring(0, 300) + "..."
                                                                                    : msg.content}
                                                                            </p>
                                                                        </div>
                                                                        {msg.role === "user" && (
                                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(262,80%,50%)] to-[hsl(280,85%,40%)] flex items-center justify-center flex-shrink-0">
                                                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                                </svg>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Continue Chat Button */}
                                                        <div className="mt-4 pt-4 border-t border-[var(--border)]">
                                                            <Link
                                                                href={`/chat?sessionId=${chatSession.session_id}`}
                                                                className="btn-primary text-sm inline-flex items-center gap-2"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                                </svg>
                                                                Continue Chat
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

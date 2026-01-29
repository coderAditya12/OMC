"use client";

/**
 * Chat Page - AI Assistant Interface
 * 
 * ChatGPT-style chat interface with sidebar and centered messages
 */

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import useChatStore from "@/store/chatStore";

// Import chat components
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";

// Types
interface ChatSession {
    session_id: string;
    issue_title: string;
    repo_name: string;
    created_at: string;
}

// ==========================================
// Main Chat Component
// ==========================================

function ChatContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state
    const [input, setInput] = useState("");
    const [previousSessions, setPreviousSessions] = useState<ChatSession[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Zustand store
    const messages = useChatStore((state) => state.messages);
    const sessionId = useChatStore((state) => state.sessionId);
    const isLoading = useChatStore((state) => state.isLoading);
    const issueTitle = useChatStore((state) => state.issueTitle);
    const repoName = useChatStore((state) => state.repoName);
    const issueUrl = useChatStore((state) => state.issueUrl);

    const addMessage = useChatStore((state) => state.addMessage);
    const setSessionId = useChatStore((state) => state.setSessionId);
    const setLoading = useChatStore((state) => state.setLoading);
    const setIssueContext = useChatStore((state) => state.setIssueContext);
    const loadMessages = useChatStore((state) => state.loadMessages);
    const clearChat = useChatStore((state) => state.clearChat);

    // ==========================================
    // Effects
    // ==========================================

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        const title = searchParams.get("title") || "Unknown Issue";
        const body = searchParams.get("body") || "";
        const labels = searchParams.get("labels")?.split(",") || [];
        const repo = searchParams.get("repo") || "";
        const url = searchParams.get("url") || "";
        const existingSessionId = searchParams.get("session_id");

        clearChat();
        setIssueContext({
            issueTitle: title,
            issueBody: body,
            issueLabels: labels,
            repoName: repo,
            issueUrl: url,
        });

        if (existingSessionId) {
            loadChatHistory(existingSessionId);
        }
    }, [searchParams]);

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            loadPreviousSessions();
        }
    }, [status, session?.user?.email]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ==========================================
    // API Functions
    // ==========================================

    const loadPreviousSessions = async () => {
        try {
            const userId = session?.user?.email || "anonymous";
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/sessions/${userId}`);
            const data = await response.json();
            if (data.status === "success") {
                setPreviousSessions(data.sessions);
            }
        } catch (error) {
            console.error("Failed to load sessions:", error);
        }
    };

    const loadChatHistory = async (sessionIdToLoad: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/history/${sessionIdToLoad}`);
            const data = await response.json();

            if (data.status === "success") {
                console.log("Loaded chat history, issue_url:", data.issue_url);
                setSessionId(sessionIdToLoad);
                setIssueContext({
                    issueTitle: data.issue_title,
                    issueBody: "",
                    issueLabels: [],
                    repoName: data.repo_name,
                    issueUrl: data.issue_url || "",
                });
                const historyMessages = data.messages.map((msg: { role: string; content: string }) => ({
                    role: msg.role as "user" | "assistant",
                    content: msg.content
                }));
                loadMessages(historyMessages);
            }
        } catch (error) {
            console.error("Failed to load chat history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSessionClick = (clickedSession: ChatSession) => {
        clearChat();
        loadChatHistory(clickedSession.session_id);
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        addMessage({ role: "user", content: userMessage });
        setLoading(true);

        try {
            const store = useChatStore.getState();
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    access_token: session?.accessToken,
                    user_email: session?.user?.email || "anonymous",
                    session_id: sessionId,
                    repo_name: store.repoName,
                    issue_url: store.issueUrl,
                    issue_title: store.issueTitle,
                    issue_body: store.issueBody,
                    issue_labels: store.issueLabels,
                    message: userMessage,
                    system_prompt: null
                })
            });

            const data = await response.json();

            if (data.status === "success") {
                setSessionId(data.session_id);
                addMessage({ role: "assistant", content: data.response });
                loadPreviousSessions();
            } else {
                addMessage({ role: "assistant", content: "Sorry, something went wrong. Please try again." });
            }
        } catch (error) {
            addMessage({ role: "assistant", content: "Failed to connect to server. Please check your connection." });
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Loading State
    // ==========================================

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    const suggestedPrompts = [
        "Explain this issue to me",
        "What files should I look at?",
        "How do I set up the project?",
        "What are the prerequisites?"
    ];

    // ==========================================
    // Render
    // ==========================================

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar */}
            <ChatSidebar
                sessions={previousSessions}
                currentSessionId={sessionId}
                isOpen={sidebarOpen}
                onSessionClick={handleSessionClick}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <ChatHeader
                    issueTitle={issueTitle}
                    repoName={repoName}
                    issueUrl={issueUrl}
                    sidebarOpen={sidebarOpen}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto">
                    {/* Welcome Screen when no messages */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center mb-8"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-emerald-500/25">
                                    <span className="text-2xl">🧭</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    How can I help you?
                                </h2>
                                <p className="text-white/50 max-w-md">
                                    Ask me anything about this issue. I can explain the code, help you understand the requirements, or guide you through the contribution process.
                                </p>
                            </motion.div>

                            {/* Suggested Prompts */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="grid grid-cols-2 gap-3 max-w-lg px-4"
                            >
                                {suggestedPrompts.map((prompt, i) => (
                                    <motion.button
                                        key={i}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setInput(prompt)}
                                        className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-xl text-white/70 hover:text-white text-sm text-left transition-all"
                                    >
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            {prompt}
                                        </div>
                                    </motion.button>
                                ))}
                            </motion.div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, i) => (
                        <ChatMessage key={i} role={msg.role} content={msg.content} />
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="py-6 bg-white/[0.02]">
                            <div className="max-w-3xl mx-auto px-4 flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                    <span className="text-sm">🧭</span>
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
                                        Compass AI
                                    </div>
                                    <div className="flex gap-1.5">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                            className="w-2 h-2 bg-emerald-400 rounded-full"
                                        />
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                            className="w-2 h-2 bg-emerald-400 rounded-full"
                                        />
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                            className="w-2 h-2 bg-emerald-400 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <ChatInput
                    value={input}
                    onChange={setInput}
                    onSend={sendMessage}
                    disabled={isLoading}
                />
            </div>
        </div>
    );
}

// ==========================================
// Wrapper with Suspense
// ==========================================

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
                />
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}

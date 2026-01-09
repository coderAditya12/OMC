"use client";

/**
 * Chat Page - AI Assistant Interface
 * 
 * This is the main chat page that combines all the components.
 * Components are kept in /components/chat/ folder.
 */

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import useChatStore from "@/store/chatStore";

// Import our chat components
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";

// ==========================================
// Types
// ==========================================

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

    // Load previous sessions when user is authenticated
    useEffect(() => {
        // Use email as user identifier since NextAuth doesn't include id by default
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
            console.log("[DEBUG] Loading sessions for user:", userId);

            const response = await fetch(`http://localhost:8000/chat/sessions/${userId}`);
            const data = await response.json();

            console.log("[DEBUG] Sessions response:", data);

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
            const response = await fetch(`http://localhost:8000/chat/history/${sessionIdToLoad}`);
            const data = await response.json();

            if (data.status === "success") {
                setSessionId(sessionIdToLoad);
                setIssueContext({
                    issueTitle: data.issue_title,
                    issueBody: "",
                    issueLabels: [],
                    repoName: data.repo_name,
                    issueUrl: "",
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
            const response = await fetch("http://localhost:8000/chat", {
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
                addMessage({ role: "assistant", content: "Error: " + (data.detail || "Something went wrong") });
            }
        } catch (error) {
            addMessage({ role: "assistant", content: "Failed to connect to server" });
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Loading State
    // ==========================================

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const suggestedPrompts = ["Explain the issue", "Show file tree", "What are the prerequisites?", "How do I start?"];

    // ==========================================
    // Render
    // ==========================================

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">

            {/* Sidebar Component */}
            <ChatSidebar
                sessions={previousSessions}
                currentSessionId={sessionId}
                isOpen={sidebarOpen}
                onSessionClick={handleSessionClick}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col max-w-4xl mx-auto">

                {/* Header Component */}
                <ChatHeader
                    issueTitle={issueTitle}
                    repoName={repoName}
                    sidebarOpen={sidebarOpen}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    {/* Suggested Prompts */}
                    {messages.length === 0 && (
                        <div className="flex flex-wrap gap-2 justify-center py-8">
                            {suggestedPrompts.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(prompt)}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 text-sm transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Messages using ChatMessage Component */}
                    {messages.map((msg, i) => (
                        <ChatMessage key={i} role={msg.role} content={msg.content} />
                    ))}

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white/10 border border-white/10 p-4 rounded-2xl">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Component */}
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}

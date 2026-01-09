"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "assistant";
    content: string;
}

function ChatContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get issue info from URL params
    const issueTitle = searchParams.get("title") || "Unknown Issue";
    const issueBody = searchParams.get("body") || "";
    const issueLabels = searchParams.get("labels")?.split(",") || [];
    const repoName = searchParams.get("repo") || "";
    const issueUrl = searchParams.get("url") || "";

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    access_token: session?.accessToken,
                    user_id: session?.user?.id || "anonymous",
                    session_id: sessionId,
                    repo_name: repoName,
                    issue_url: issueUrl,
                    issue_title: issueTitle,
                    issue_body: issueBody,
                    issue_labels: issueLabels,
                    message: userMessage,
                    system_prompt: null
                })
            });

            const data = await response.json();

            if (data.status === "success") {
                setSessionId(data.session_id);
                setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: "Error: " + (data.detail || "Something went wrong") }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: "assistant", content: "Failed to connect to server" }]);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-md p-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-white font-semibold truncate">{issueTitle}</h1>
                        <p className="text-white/50 text-sm truncate">📦 {repoName}</p>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-4xl mx-auto space-y-4">
                    {/* Welcome Message */}
                    {messages.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🤖</div>
                            <h2 className="text-2xl font-bold text-white mb-2">AI Assistant</h2>
                            <p className="text-white/60 max-w-md mx-auto">
                                I have context about this issue and can help you understand the codebase.
                                Ask me anything!
                            </p>
                            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                {["Explain this issue", "Show me the file structure", "What files should I look at?"].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setInput(suggestion)}
                                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white/80 text-sm hover:bg-white/20 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] p-4 rounded-2xl ${msg.role === "user"
                                    ? "bg-purple-600 text-white"
                                    : "bg-white/10 text-white/90 border border-white/10"
                                    }`}
                            >
                                {msg.role === "user" ? (
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                ) : (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                pre: ({ children }) => (
                                                    <pre className="bg-black/30 p-3 rounded-lg overflow-x-auto text-sm">
                                                        {children}
                                                    </pre>
                                                ),
                                                code: ({ children }) => (
                                                    <code className="bg-black/30 px-1 py-0.5 rounded text-purple-300">
                                                        {children}
                                                    </code>
                                                ),
                                                ul: ({ children }) => (
                                                    <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
                                                ),
                                                ol: ({ children }) => (
                                                    <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
                                                ),
                                                h1: ({ children }) => (
                                                    <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>
                                                ),
                                                h2: ({ children }) => (
                                                    <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>
                                                ),
                                                h3: ({ children }) => (
                                                    <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>
                                                ),
                                                p: ({ children }) => (
                                                    <p className="my-2">{children}</p>
                                                ),
                                                strong: ({ children }) => (
                                                    <strong className="font-bold text-white">{children}</strong>
                                                ),
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading */}
                    {loading && (
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
            </div>

            {/* Input */}
            <div className="border-t border-white/10 bg-black/20 backdrop-blur-md p-4">
                <div className="max-w-4xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Ask about this issue..."
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl text-white font-medium transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div >
    );
}

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


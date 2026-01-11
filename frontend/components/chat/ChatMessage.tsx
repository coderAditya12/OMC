"use client";

/**
 * ChatMessage Component - ChatGPT Style
 * 
 * Clean, centered messages with avatar icons like ChatGPT
 */

import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

interface ChatMessageProps {
    role: "user" | "assistant";
    content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === "user";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`py-6 ${isUser ? "bg-transparent" : "bg-white/[0.02]"}`}
        >
            <div className="max-w-3xl mx-auto px-4 flex gap-4">
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isUser
                        ? "bg-gradient-to-br from-violet-500 to-purple-600"
                        : "bg-gradient-to-br from-emerald-500 to-cyan-500"
                    }`}>
                    {isUser ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    ) : (
                        <span className="text-sm">🧭</span>
                    )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                    {/* Role Label */}
                    <div className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
                        {isUser ? "You" : "Compass AI"}
                    </div>

                    {/* Message */}
                    {isUser ? (
                        <p className="text-white/90 whitespace-pre-wrap leading-relaxed">
                            {content}
                        </p>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none text-white/90">
                            <ReactMarkdown
                                components={{
                                    pre: ({ children }) => (
                                        <pre className="bg-slate-800/80 border border-white/10 p-4 rounded-xl overflow-x-auto text-sm my-4">
                                            {children}
                                        </pre>
                                    ),
                                    code: ({ className, children }) => {
                                        const isBlock = className?.includes("language-");
                                        if (isBlock) {
                                            return <code className="text-emerald-300">{children}</code>;
                                        }
                                        return (
                                            <code className="bg-white/10 px-1.5 py-0.5 rounded text-emerald-300 text-sm">
                                                {children}
                                            </code>
                                        );
                                    },
                                    ul: ({ children }) => (
                                        <ul className="list-none space-y-2 my-4">
                                            {children}
                                        </ul>
                                    ),
                                    li: ({ children }) => (
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-400 mt-1.5">•</span>
                                            <span>{children}</span>
                                        </li>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="list-decimal list-inside space-y-2 my-4">{children}</ol>
                                    ),
                                    h1: ({ children }) => (
                                        <h1 className="text-xl font-bold text-white mt-6 mb-3 pb-2 border-b border-white/10">
                                            {children}
                                        </h1>
                                    ),
                                    h2: ({ children }) => (
                                        <h2 className="text-lg font-bold text-white mt-5 mb-2">
                                            {children}
                                        </h2>
                                    ),
                                    h3: ({ children }) => (
                                        <h3 className="text-base font-semibold text-white mt-4 mb-2">
                                            {children}
                                        </h3>
                                    ),
                                    p: ({ children }) => (
                                        <p className="my-3 leading-relaxed">{children}</p>
                                    ),
                                    strong: ({ children }) => (
                                        <strong className="font-semibold text-white">{children}</strong>
                                    ),
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-4 border-emerald-500/50 pl-4 my-4 italic text-white/70">
                                            {children}
                                        </blockquote>
                                    ),
                                    a: ({ href, children }) => (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                                        >
                                            {children}
                                        </a>
                                    ),
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

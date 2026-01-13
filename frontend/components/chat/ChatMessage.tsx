"use client";

/**
 * ChatMessage Component - ChatGPT Style
 * 
 * Clean, centered messages with avatar icons like ChatGPT
 * Better file tree and code block styling
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
                <div className="flex-1 min-w-0 overflow-hidden">
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
                                        <div className="relative my-4">
                                            <pre className="bg-slate-900 border border-slate-700 p-4 rounded-xl overflow-x-auto text-sm">
                                                {children}
                                            </pre>
                                        </div>
                                    ),
                                    code: ({ className, children }) => {
                                        const isBlock = className?.includes("language-");
                                        if (isBlock) {
                                            return (
                                                <code className="text-emerald-300 font-mono text-[13px] leading-relaxed">
                                                    {children}
                                                </code>
                                            );
                                        }
                                        return (
                                            <code className="bg-slate-800 border border-slate-600 px-1.5 py-0.5 rounded text-cyan-300 text-sm font-mono">
                                                {children}
                                            </code>
                                        );
                                    },
                                    ul: ({ children }) => (
                                        <ul className="list-none space-y-1.5 my-3">
                                            {children}
                                        </ul>
                                    ),
                                    li: ({ children }) => (
                                        <li className="flex items-start gap-2 text-white/80">
                                            <span className="text-emerald-400 mt-0.5">▸</span>
                                            <span className="flex-1">{children}</span>
                                        </li>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="list-decimal list-inside space-y-2 my-4">{children}</ol>
                                    ),
                                    h1: ({ children }) => (
                                        <h1 className="text-xl font-bold text-white mt-6 mb-3 pb-2 border-b border-emerald-500/30 flex items-center gap-2">
                                            <span className="text-emerald-400">▎</span>
                                            {children}
                                        </h1>
                                    ),
                                    h2: ({ children }) => (
                                        <h2 className="text-lg font-bold text-white mt-5 mb-2 flex items-center gap-2">
                                            <span className="text-emerald-400 text-sm">●</span>
                                            {children}
                                        </h2>
                                    ),
                                    h3: ({ children }) => (
                                        <h3 className="text-base font-semibold text-white mt-4 mb-2 text-emerald-100">
                                            {children}
                                        </h3>
                                    ),
                                    p: ({ children }) => (
                                        <p className="my-3 leading-relaxed text-white/85">{children}</p>
                                    ),
                                    strong: ({ children }) => (
                                        <strong className="font-semibold text-white">{children}</strong>
                                    ),
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-4 border-emerald-500/50 pl-4 my-4 bg-emerald-500/5 py-2 rounded-r-lg italic text-white/70">
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
                                    // Style tables for file trees
                                    table: ({ children }) => (
                                        <div className="my-4 overflow-x-auto custom-scrollbar">
                                            <table className="min-w-full text-sm">
                                                {children}
                                            </table>
                                        </div>
                                    ),
                                    th: ({ children }) => (
                                        <th className="text-left text-emerald-400 font-semibold pb-2 border-b border-white/10">
                                            {children}
                                        </th>
                                    ),
                                    td: ({ children }) => (
                                        <td className="py-1 pr-4 text-white/70 font-mono text-xs">
                                            {children}
                                        </td>
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

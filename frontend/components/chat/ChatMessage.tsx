"use client";

/**
 * ChatMessage Component
 * Clean message bubbles with gradient avatars and markdown support
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
            className={`py-6 ${isUser ? "bg-transparent" : "bg-[hsl(0,0%,100%,0.02)]"}`}
        >
            <div className="max-w-3xl mx-auto px-4 flex gap-4">
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isUser
                    ? "bg-gradient-to-br from-[hsl(262,80%,50%)] to-[hsl(280,85%,40%)]"
                    : "bg-gradient-to-br from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)]"
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
                    <div className="text-xs font-semibold text-[var(--foreground-subtle)] uppercase tracking-wide mb-2">
                        {isUser ? "You" : "Compass AI"}
                    </div>

                    {/* Message */}
                    {isUser ? (
                        <p className="text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
                            {content}
                        </p>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none text-[var(--foreground)]">
                            <ReactMarkdown
                                components={{
                                    pre: ({ children }) => (
                                        <div className="relative my-4">
                                            <pre className="bg-[hsl(240,10%,8%)] border border-[var(--border)] p-4 rounded-xl overflow-x-auto text-sm">
                                                {children}
                                            </pre>
                                        </div>
                                    ),
                                    code: ({ className, children }) => {
                                        const isBlock = className?.includes("language-");
                                        if (isBlock) {
                                            return (
                                                <code className="text-[hsl(191,91%,55%)] font-mono text-[13px] leading-relaxed">
                                                    {children}
                                                </code>
                                            );
                                        }
                                        return (
                                            <code className="bg-[hsl(240,10%,12%)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[hsl(217,91%,70%)] text-sm font-mono">
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
                                        <li className="flex items-start gap-2 text-[var(--foreground-muted)]">
                                            <span className="text-[hsl(191,91%,50%)] mt-0.5">▸</span>
                                            <span className="flex-1">{children}</span>
                                        </li>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="list-decimal list-inside space-y-2 my-4">{children}</ol>
                                    ),
                                    h1: ({ children }) => (
                                        <h1 className="text-xl font-bold text-white mt-6 mb-3 pb-2 border-b border-[hsl(191,91%,37%,0.3)] flex items-center gap-2">
                                            <span className="text-[hsl(191,91%,50%)]">▎</span>
                                            {children}
                                        </h1>
                                    ),
                                    h2: ({ children }) => (
                                        <h2 className="text-lg font-bold text-white mt-5 mb-2 flex items-center gap-2">
                                            <span className="text-[hsl(191,91%,50%)] text-sm">●</span>
                                            {children}
                                        </h2>
                                    ),
                                    h3: ({ children }) => (
                                        <h3 className="text-base font-semibold text-white mt-4 mb-2">
                                            {children}
                                        </h3>
                                    ),
                                    p: ({ children }) => (
                                        <p className="my-3 leading-relaxed text-[var(--foreground-muted)]">{children}</p>
                                    ),
                                    strong: ({ children }) => (
                                        <strong className="font-semibold text-white">{children}</strong>
                                    ),
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-4 border-[hsl(191,91%,37%,0.5)] pl-4 my-4 bg-[hsl(191,91%,37%,0.05)] py-2 rounded-r-lg italic text-[var(--foreground-muted)]">
                                            {children}
                                        </blockquote>
                                    ),
                                    a: ({ href, children }) => (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[hsl(191,91%,50%)] hover:text-[hsl(191,91%,60%)] underline underline-offset-2"
                                        >
                                            {children}
                                        </a>
                                    ),
                                    table: ({ children }) => (
                                        <div className="my-4 overflow-x-auto custom-scrollbar">
                                            <table className="min-w-full text-sm">
                                                {children}
                                            </table>
                                        </div>
                                    ),
                                    th: ({ children }) => (
                                        <th className="text-left text-[hsl(191,91%,50%)] font-semibold pb-2 border-b border-[var(--border)]">
                                            {children}
                                        </th>
                                    ),
                                    td: ({ children }) => (
                                        <td className="py-1 pr-4 text-[var(--foreground-muted)] font-mono text-xs">
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

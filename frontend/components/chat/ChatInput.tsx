"use client";

/**
 * ChatInput Component
 * Modern input with glass styling and gradient send button
 */

import { motion } from "framer-motion";

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    disabled: boolean;
    placeholder?: string;
}

export default function ChatInput({
    value,
    onChange,
    onSend,
    disabled,
    placeholder = "Ask about this issue..."
}: ChatInputProps) {

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey && !disabled) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="sticky bottom-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent pt-6 pb-6">
            <div className="max-w-3xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                >
                    {/* Input Container */}
                    <div className="flex items-end gap-3 glass-card p-2 focus-within:border-[hsl(191,91%,37%,0.5)] transition-colors !rounded-2xl">
                        {/* Text Area */}
                        <textarea
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            rows={1}
                            className="flex-1 bg-transparent border-none px-3 py-2 text-white placeholder-[var(--foreground-subtle)] focus:outline-none resize-none max-h-32 min-h-[44px]"
                            style={{ scrollbarWidth: "thin" }}
                        />

                        {/* Send Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onSend}
                            disabled={disabled || !value.trim()}
                            className={`flex-shrink-0 p-3 rounded-xl transition-all ${disabled || !value.trim()
                                ? "bg-[hsl(0,0%,100%,0.1)] text-[var(--foreground-subtle)] cursor-not-allowed"
                                : "bg-gradient-to-r from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] text-white shadow-lg shadow-[hsl(191,91%,37%,0.25)] hover:shadow-[hsl(191,91%,37%,0.4)]"
                                }`}
                        >
                            {disabled ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </motion.div>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </motion.button>
                    </div>

                    {/* Hint Text */}
                    <p className="text-center text-[var(--foreground-subtle)] text-xs mt-3">
                        Press Enter to send • Shift+Enter for new line
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

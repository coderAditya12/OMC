/**
 * ChatMessage Component
 * 
 * Renders a single chat message (either user or assistant).
 * Uses ReactMarkdown for rendering AI responses with nice formatting.
 */

import ReactMarkdown from "react-markdown";

// Props that this component expects
interface ChatMessageProps {
    role: "user" | "assistant";
    content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
    // User messages - simple white text on purple background
    if (role === "user") {
        return (
            <div className="flex justify-end">
                <div className="max-w-[80%] p-4 rounded-2xl bg-purple-600 text-white">
                    <p className="whitespace-pre-wrap">{content}</p>
                </div>
            </div>
        );
    }

    // Assistant messages - formatted markdown on dark background
    return (
        <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-2xl bg-white/10 text-white/90 border border-white/10">
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
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

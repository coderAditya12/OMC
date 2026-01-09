/**
 * ChatSidebar Component
 * 
 * Displays a list of previous chat sessions.
 * When a session is clicked, it loads that chat's history.
 */

import { useRouter } from "next/navigation";

// Type for a chat session
interface ChatSession {
    session_id: string;
    issue_title: string;
    repo_name: string;
    created_at: string;
}

// Props that this component expects
interface ChatSidebarProps {
    sessions: ChatSession[];
    currentSessionId: string | null;
    isOpen: boolean;
    onSessionClick: (session: ChatSession) => void;
}

export default function ChatSidebar({
    sessions,
    currentSessionId,
    isOpen,
    onSessionClick
}: ChatSidebarProps) {
    const router = useRouter();

    // If sidebar is closed, don't render anything
    if (!isOpen) {
        return null;
    }

    return (
        <div className="w-72 border-r border-white/10 flex flex-col">

            {/* Sidebar Header */}
            <div className="p-4 border-b border-white/10">
                <h2 className="text-white font-semibold">Previous Chats</h2>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto">
                {sessions.length === 0 ? (
                    <p className="text-white/50 text-sm p-4">No previous chats</p>
                ) : (
                    sessions.map((session) => (
                        <button
                            key={session.session_id}
                            onClick={() => onSessionClick(session)}
                            className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/10 transition-colors ${currentSessionId === session.session_id ? "bg-white/10" : ""
                                }`}
                        >
                            <p className="text-white text-sm font-medium truncate">
                                {session.issue_title}
                            </p>
                            <p className="text-white/50 text-xs truncate mt-1">
                                {session.repo_name}
                            </p>
                        </button>
                    ))
                )}
            </div>

            {/* Back to Home Button */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={() => router.push("/home")}
                    className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 text-sm transition-colors"
                >
                    ← Back to Issues
                </button>
            </div>
        </div>
    );
}

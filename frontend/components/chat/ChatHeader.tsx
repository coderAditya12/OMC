/**
 * ChatHeader Component
 * 
 * Shows the current issue title and repo name at the top of the chat.
 * Includes a button to toggle the sidebar.
 */

interface ChatHeaderProps {
    issueTitle: string;
    repoName: string;
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
}

export default function ChatHeader({
    issueTitle,
    repoName,
    sidebarOpen,
    onToggleSidebar
}: ChatHeaderProps) {
    return (
        <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-4">
                {/* Toggle Sidebar Button */}
                <button
                    onClick={onToggleSidebar}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                >
                    <span className="text-white/70">{sidebarOpen ? "◀" : "▶"}</span>
                </button>

                {/* Issue Info */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-white font-semibold truncate">
                        {issueTitle || "Chat"}
                    </h1>
                    <p className="text-white/50 text-sm truncate">
                        {repoName}
                    </p>
                </div>
            </div>
        </div>
    );
}

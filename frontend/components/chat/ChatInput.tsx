/**
 * ChatInput Component
 * 
 * The input box and send button at the bottom of the chat.
 * Handles Enter key to send messages.
 */

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

    // Handle Enter key press
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !disabled) {
            onSend();
        }
    };

    return (
        <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                />
                <button
                    onClick={onSend}
                    disabled={disabled}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 rounded-xl text-white font-medium transition-colors"
                >
                    Send
                </button>
            </div>
        </div>
    );
}

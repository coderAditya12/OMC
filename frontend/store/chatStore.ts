/**
 * Chat Store - Zustand State Management
 * 
 * This file manages all the chat-related state in our application.
 * Think of it like a "global useState" that can be accessed from any component.
 * 
 * How Zustand works:
 * 1. We create a "store" with initial state and functions to update it
 * 2. Any component can use this store with the useChatStore() hook
 * 3. When state changes, all components using that state will re-render
 */

import { create } from "zustand";

// ==========================================
// Types - Define the shape of our data
// ==========================================

// A single chat message
interface Message {
    role: "user" | "assistant";
    content: string;
}

// The complete state of our chat store
interface ChatState {
    // Data
    messages: Message[];
    sessionId: string | null;
    isLoading: boolean;
    error: string | null;

    // Issue context (passed from the home page)
    issueTitle: string;
    issueBody: string;
    issueLabels: string[];
    repoName: string;
    issueUrl: string;
}

// Actions that can modify the state
interface ChatActions {
    // Set issue context when opening a chat
    setIssueContext: (context: {
        issueTitle: string;
        issueBody: string;
        issueLabels: string[];
        repoName: string;
        issueUrl: string;
    }) => void;

    // Add a message to the chat
    addMessage: (message: Message) => void;

    // Set the session ID (from backend response)
    setSessionId: (id: string) => void;

    // Set loading state
    setLoading: (loading: boolean) => void;

    // Set error message
    setError: (error: string | null) => void;

    // Load messages from history
    loadMessages: (messages: Message[]) => void;

    // Clear the entire chat
    clearChat: () => void;
}

// ==========================================
// Create the Store
// ==========================================

// Combine state and actions into one type
type ChatStore = ChatState & ChatActions;

// Create the Zustand store
const useChatStore = create<ChatStore>((set) => ({
    // ========== Initial State ==========
    messages: [],
    sessionId: null,
    isLoading: false,
    error: null,
    issueTitle: "",
    issueBody: "",
    issueLabels: [],
    repoName: "",
    issueUrl: "",

    // ========== Actions ==========

    // Set the issue context when user clicks "Ask AI" on an issue
    setIssueContext: (context) => {
        set({
            issueTitle: context.issueTitle,
            issueBody: context.issueBody,
            issueLabels: context.issueLabels,
            repoName: context.repoName,
            issueUrl: context.issueUrl,
        });
    },

    // Add a new message to the chat (either user or assistant)
    addMessage: (message) => {
        set((state) => ({
            messages: [...state.messages, message],
        }));
    },

    // Save the session ID from the backend
    setSessionId: (id) => {
        set({ sessionId: id });
    },

    // Toggle loading state (used when waiting for AI response)
    setLoading: (loading) => {
        set({ isLoading: loading });
    },

    // Set an error message to display to the user
    setError: (error) => {
        set({ error: error });
    },

    // Load messages from database (when returning to a previous chat)
    loadMessages: (messages) => {
        set({ messages: messages });
    },

    // Clear everything and start fresh
    clearChat: () => {
        set({
            messages: [],
            sessionId: null,
            isLoading: false,
            error: null,
        });
    },
}));

// Export the store hook
export default useChatStore;

"use client";

/**
 * Explore Issues Page - OpenSource Compass
 * Browse all issues from database with language filters
 */

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Components
import HomeNavbar from "@/components/home/HomeNavbar";
import FloatingOrbs from "@/components/ui/FloatingOrbs";
import { IssuesListSkeleton } from "@/components/ui/Skeleton";

interface Issue {
    id: number;
    github_id: number;
    number: number;
    title: string;
    body: string;
    labels: string[];
    difficulty: string;
    html_url: string;
    comments_count: number;
    repo_name: string;
    language: string;
    stars: number;
    updated_at: string;
}

interface Language {
    name: string;
    count: number;
}

export default function ExplorePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Fetch available languages
    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/issues/languages`
                );
                setLanguages(response.data.languages || []);
            } catch (err) {
                console.error("Failed to fetch languages:", err);
            }
        };
        fetchLanguages();
    }, []);

    // Fetch issues
    useEffect(() => {
        const fetchIssues = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: "20",
                });
                if (selectedLanguage !== "all") {
                    params.append("language", selectedLanguage);
                }

                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/issues?${params}`
                );
                setIssues(response.data.issues || []);
                setTotalPages(response.data.total_pages || 1);
                setTotal(response.data.total || 0);
            } catch (err) {
                console.error("Failed to fetch issues:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchIssues();
    }, [selectedLanguage, page]);

    // Format date
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    // Loading State
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-[hsl(191,91%,37%)] border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen overflow-hidden" style={{ background: "var(--background)" }}>
            {/* Background */}
            <FloatingOrbs />

            {/* Navigation */}
            <HomeNavbar
                userImage={session.user?.image}
                userName={session.user?.name}
            />

            {/* Main Content */}
            <main className="pt-24 pb-12 px-6 relative z-10">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Explore <span className="gradient-text">Issues</span> 🔍
                        </h1>
                        <p className="text-lg text-[var(--foreground-muted)]">
                            Browse {total.toLocaleString()} open issues from {languages.length} languages
                        </p>
                    </motion.div>

                    {/* Language Filter Tags */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                    >
                        <div className="flex flex-wrap gap-2">
                            {/* All button */}
                            <button
                                onClick={() => { setSelectedLanguage("all"); setPage(1); }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedLanguage === "all"
                                        ? "bg-gradient-to-r from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] text-white shadow-lg shadow-[hsl(191,91%,37%,0.25)]"
                                        : "bg-[hsl(0,0%,100%,0.05)] text-[var(--foreground-muted)] hover:bg-[hsl(0,0%,100%,0.1)] border border-[var(--border)]"
                                    }`}
                            >
                                All Languages
                            </button>

                            {/* Language tags */}
                            {languages.slice(0, 15).map((lang) => (
                                <button
                                    key={lang.name}
                                    onClick={() => { setSelectedLanguage(lang.name); setPage(1); }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${selectedLanguage === lang.name
                                            ? "bg-gradient-to-r from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] text-white shadow-lg shadow-[hsl(191,91%,37%,0.25)]"
                                            : "bg-[hsl(0,0%,100%,0.05)] text-[var(--foreground-muted)] hover:bg-[hsl(0,0%,100%,0.1)] border border-[var(--border)]"
                                        }`}
                                >
                                    {lang.name}
                                    <span className={`text-xs ${selectedLanguage === lang.name ? "text-white/70" : "text-[var(--foreground-subtle)]"}`}>
                                        {lang.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Issues List */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6"
                    >
                        {loading ? (
                            <IssuesListSkeleton count={5} />
                        ) : issues.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[hsl(0,0%,100%,0.1)] flex items-center justify-center">
                                    <svg className="w-8 h-8 text-[var(--foreground-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <p className="text-[var(--foreground-muted)] text-lg">No issues found</p>
                                <p className="text-[var(--foreground-subtle)] text-sm mt-2">Try selecting a different language</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence mode="popLayout">
                                    {issues.map((issue, index) => (
                                        <motion.div
                                            key={issue.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="p-5 rounded-xl bg-[hsl(0,0%,100%,0.02)] border border-[var(--border)] hover:border-[hsl(191,91%,37%,0.3)] hover:bg-[hsl(0,0%,100%,0.04)] transition-all group"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                {/* Issue Info */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Title */}
                                                    <h3 className="text-white font-medium text-lg group-hover:text-[hsl(191,91%,60%)] transition-colors line-clamp-2">
                                                        {issue.title}
                                                    </h3>

                                                    {/* Repo & Meta */}
                                                    <div className="flex items-center gap-3 mt-2 text-sm text-[var(--foreground-subtle)]">
                                                        <span className="text-[hsl(191,91%,55%)]">{issue.repo_name}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                            </svg>
                                                            {issue.stars.toLocaleString()}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{formatDate(issue.updated_at)}</span>
                                                    </div>

                                                    {/* Labels */}
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {/* Language tag */}
                                                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[hsl(191,91%,37%,0.2)] text-[hsl(191,91%,60%)] border border-[hsl(191,91%,37%,0.3)]">
                                                            {issue.language}
                                                        </span>

                                                        {/* Issue labels */}
                                                        {issue.labels.slice(0, 3).map((label, i) => (
                                                            <span
                                                                key={i}
                                                                className="px-2 py-0.5 text-xs font-medium rounded-full bg-[hsl(262,80%,50%,0.15)] text-[hsl(262,80%,70%)] border border-[hsl(262,80%,50%,0.3)]"
                                                            >
                                                                {label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Chat Button */}
                                                <Link
                                                    href={`/chat?issue=${encodeURIComponent(JSON.stringify({
                                                        title: issue.title,
                                                        body: issue.body,
                                                        url: issue.html_url,
                                                        repo: issue.repo_name,
                                                        labels: issue.labels,
                                                        language: issue.language
                                                    }))}`}
                                                    className="flex-shrink-0"
                                                >
                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="px-4 py-2 bg-gradient-to-r from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] text-white text-sm font-medium rounded-xl shadow-lg shadow-[hsl(191,91%,37%,0.25)] flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                        Chat
                                                    </motion.div>
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 pt-6 mt-6 border-t border-[var(--border)]">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                            disabled={page === 1}
                                            className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${page === 1
                                                    ? 'bg-[hsl(0,0%,100%,0.05)] text-[var(--foreground-subtle)] cursor-not-allowed'
                                                    : 'bg-[hsl(0,0%,100%,0.1)] text-white hover:bg-[hsl(0,0%,100%,0.15)]'
                                                }`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Previous
                                        </motion.button>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[var(--foreground-muted)]">Page</span>
                                            <span className="px-3 py-1 bg-gradient-to-r from-[hsl(191,91%,37%)] to-[hsl(217,91%,60%)] rounded-lg text-white font-bold">
                                                {page}
                                            </span>
                                            <span className="text-[var(--foreground-muted)]">of {totalPages}</span>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={page === totalPages}
                                            className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${page === totalPages
                                                    ? 'bg-[hsl(0,0%,100%,0.05)] text-[var(--foreground-subtle)] cursor-not-allowed'
                                                    : 'bg-[hsl(0,0%,100%,0.1)] text-white hover:bg-[hsl(0,0%,100%,0.15)]'
                                                }`}
                                        >
                                            Next
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

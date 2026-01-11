"use client";

/**
 * Issue Card Component
 * Beautiful card for displaying recommended issues
 */

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Issue {
    id: number;
    title: string;
    body: string;
    url: string;
    repo: string;
    labels: string[];
    language: string;
    match_score: number;
    comments: number;
}

interface IssueCardProps {
    issue: Issue;
    index: number;
}

export default function IssueCard({ issue, index }: IssueCardProps) {
    const router = useRouter();

    // Get score colors
    const getScoreGradient = (score: number) => {
        if (score >= 70) return "from-emerald-500 to-green-500";
        if (score >= 50) return "from-amber-500 to-orange-500";
        return "from-blue-500 to-cyan-500";
    };

    const handleAskAI = () => {
        const params = new URLSearchParams({
            title: issue.title,
            body: issue.body || "",
            labels: issue.labels.join(","),
            repo: issue.repo,
            url: issue.url
        });
        router.push(`/chat?${params.toString()}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01, y: -4 }}
            className="group p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-emerald-500/40 transition-all duration-300"
        >
            <div className="flex items-start gap-4">
                {/* Match Score Badge */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${getScoreGradient(issue.match_score)} flex flex-col items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                    <span className="text-white font-bold text-lg">{Math.round(issue.match_score)}%</span>
                    <span className="text-white/80 text-xs">match</span>
                </div>

                {/* Issue Details */}
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <a
                        href={issue.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-semibold text-white hover:text-emerald-400 transition-colors line-clamp-2 mb-2 block"
                    >
                        {issue.title}
                    </a>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {/* Repo */}
                        <span className="text-white/50 text-sm flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            {issue.repo}
                        </span>

                        {/* Language */}
                        {issue.language && (
                            <span className="px-2.5 py-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-medium flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                {issue.language}
                            </span>
                        )}

                        {/* Fresh Badge */}
                        {issue.comments === 0 && (
                            <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-medium flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                                Fresh
                            </span>
                        )}
                    </div>

                    {/* Labels */}
                    <div className="flex flex-wrap gap-1.5">
                        {issue.labels.slice(0, 4).map((label) => (
                            <span
                                key={label}
                                className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white/60 text-xs"
                            >
                                {label}
                            </span>
                        ))}
                        {issue.labels.length > 4 && (
                            <span className="px-2 py-1 text-white/40 text-xs">
                                +{issue.labels.length - 4} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Ask AI Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAskAI}
                    className="flex-shrink-0 px-5 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 rounded-xl text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="hidden sm:inline">Ask AI</span>
                </motion.button>
            </div>
        </motion.div>
    );
}

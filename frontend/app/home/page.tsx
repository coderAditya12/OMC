"use client";

/**
 * Home Page - OpenSource Compass
 * 
 * Dashboard page showing personalized issue recommendations
 */

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

// Components
import HomeNavbar from "@/components/home/HomeNavbar";
import ProfileCard from "@/components/home/ProfileCard";
import IssueCard from "@/components/home/IssueCard";
import StatsGrid from "@/components/home/StatsGrid";
import FloatingOrbs from "@/components/ui/FloatingOrbs";

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

interface ProfileSummary {
    username: string;
    primary_language: string;
    experience_level: string;
    interests: string[];
}

export default function HomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [recommendations, setRecommendations] = useState<Issue[]>([]);
    const [profile, setProfile] = useState<ProfileSummary | null>(null);
    const [missingLanguages, setMissingLanguages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false); // Use state instead of ref

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Fetch recommendations - only once when session is ready
    useEffect(() => {
        // Skip if already fetched, currently loading, or no session
        if (hasFetched || loading || !session?.accessToken || status !== "authenticated") {
            return;
        }

        const fetchRecommendations = async () => {
            setHasFetched(true); // Mark as fetched BEFORE making request
            setLoading(true);
            setError(null);

            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/recommend`, {
                    access_token: session.accessToken,
                    user_email: session.user?.email || null,
                });

                setRecommendations(response.data.recommendations || []);
                setProfile(response.data.profile || null);
                setMissingLanguages(response.data.missing_languages || []);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.detail || err.message || "Something went wrong");
                } else {
                    setError(err instanceof Error ? err.message : "Something went wrong");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [session, status, hasFetched, loading]);

    // Loading State
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!session) return null;

    // Stats data
    const stats = [
        {
            label: "Issues Found",
            value: recommendations.length,
            gradient: "from-emerald-500 to-cyan-500",
            icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            )
        },
        {
            label: "Top Match",
            value: recommendations.length > 0 ? `${Math.round(recommendations[0].match_score)}%` : "0%",
            gradient: "from-violet-500 to-purple-500",
            icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            )
        },
        {
            label: "Languages",
            value: new Set(recommendations.map(r => r.language)).size,
            gradient: "from-amber-500 to-orange-500",
            icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            )
        },
        {
            label: "Repos",
            value: new Set(recommendations.map(r => r.repo)).size,
            gradient: "from-pink-500 to-rose-500",
            icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
            )
        }
    ];
    return (
        <div className="min-h-screen bg-slate-950 overflow-hidden">
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
                    {/* Welcome Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Welcome back,{" "}
                            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                {session.user?.name?.split(" ")[0] || "Developer"}
                            </span>
                            ! 👋
                        </h1>
                        <p className="text-lg text-white/60">
                            Here are your personalized open source recommendations
                        </p>
                    </motion.div>

                    {/* Profile Card */}
                    {profile && (
                        <div className="mb-8">
                            <ProfileCard
                                username={profile.username}
                                primaryLanguage={profile.primary_language}
                                experienceLevel={profile.experience_level}
                                interests={profile.interests}
                                userImage={session.user?.image}
                            />
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="mb-8">
                        <StatsGrid stats={stats} />
                    </div>

                    {/* Recommendations Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8"
                    >
                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                Recommended Issues
                            </h2>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setRecommendations([]);
                                    setLoading(false);
                                }}
                                className="px-4 py-2 text-sm font-medium text-emerald-300 hover:text-white border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </motion.button>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-emerald-500/25">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </motion.div>
                                <p className="text-white/60 mt-6 text-lg">Analyzing your profile...</p>
                                <p className="text-white/40 text-sm mt-2">Finding the best matches for you</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-red-400 text-lg mb-2">{error}</p>
                                <button
                                    onClick={() => { setError(null); setRecommendations([]); }}
                                    className="text-emerald-400 hover:text-emerald-300 font-medium"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {/* Missing Languages Warning */}
                        {!loading && !error && missingLanguages.length > 0 && profile && (
                            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <p className="text-amber-200 font-medium">
                                            No beginner-friendly issues found for {missingLanguages.join(", ")}
                                        </p>
                                        <p className="text-amber-200/70 text-sm mt-1">
                                            {missingLanguages.includes(profile.primary_language)
                                                ? `Showing issues from your other languages instead.`
                                                : `These languages didn't have matching active repositories (>500 stars, updated in last 15 days).`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Issues List */}
                        {!loading && !error && recommendations.length > 0 && (
                            <div className="space-y-4">
                                {recommendations.map((issue, index) => (
                                    <IssueCard key={Math.random() || index} issue={issue} index={index} />
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && recommendations.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <p className="text-white/60 text-lg">No recommendations yet</p>
                                <p className="text-white/40 text-sm mt-2">We&apos;ll analyze your profile and find matching issues</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Fetch recommendations when session is available
    useEffect(() => {
        const fetchRecommendations = async () => {
            if (session?.accessToken && !loading && recommendations.length === 0) {
                setLoading(true);
                setError(null);
                try {
                    const response = await fetch("http://localhost:8000/recommend", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            access_token: session.accessToken,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error("Failed to fetch recommendations");
                    }

                    const data = await response.json();
                    setRecommendations(data.recommendations || []);
                    setProfile(data.profile || null);
                } catch (err) {
                    setError(err instanceof Error ? err.message : "Something went wrong");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchRecommendations();
    }, [session, loading, recommendations.length]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const getScoreColor = (score: number) => {
        if (score >= 70) return "from-emerald-500 to-green-500";
        if (score >= 50) return "from-amber-500 to-orange-500";
        return "from-blue-500 to-cyan-500";
    };

    const getScoreBg = (score: number) => {
        if (score >= 70) return "bg-emerald-500/20 border-emerald-500/30";
        if (score >= 50) return "bg-amber-500/20 border-amber-500/30";
        return "bg-blue-500/20 border-blue-500/30";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <span className="text-white font-bold text-xl">O</span>
                        </div>
                        <span className="text-white font-semibold text-xl tracking-tight">OpenSource Compass</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {session.user?.image && (
                            <Image
                                src={session.user.image}
                                alt="Profile"
                                width={36}
                                height={36}
                                className="rounded-full border-2 border-purple-500/50"
                            />
                        )}
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white border border-white/20 rounded-full hover:bg-white/10 transition-all"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-24 pb-12 px-6">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Welcome back,{" "}
                            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                                {session.user?.name?.split(" ")[0] || "User"}
                            </span>
                            !
                        </h1>
                        <p className="text-lg text-white/60">
                            Find your perfect open source contribution matching your skills
                        </p>
                    </div>

                    {/* Profile Summary Card */}
                    {profile && (
                        <div className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <div className="flex flex-wrap items-center gap-4">
                                {session.user?.image && (
                                    <Image
                                        src={session.user.image}
                                        alt="Profile"
                                        width={60}
                                        height={60}
                                        className="rounded-full border-2 border-purple-500/50"
                                    />
                                )}
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-white">@{profile.username}</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full text-violet-300 text-sm">
                                            {profile.primary_language}
                                        </span>
                                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm capitalize">
                                            {profile.experience_level}
                                        </span>
                                        {profile.interests.slice(0, 3).map((interest) => (
                                            <span
                                                key={interest}
                                                className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-white/70 text-sm"
                                            >
                                                {interest}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recommendations Section */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="text-3xl">🎯</span>
                                Recommended Issues For You
                            </h2>
                            <button
                                onClick={() => {
                                    setRecommendations([]);
                                    setLoading(false);
                                }}
                                className="px-4 py-2 text-sm font-medium text-purple-300 hover:text-white border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-all"
                            >
                                🔄 Refresh
                            </button>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-white/60">Analyzing your profile and finding matches...</p>
                                <p className="text-white/40 text-sm mt-2">This may take a few seconds</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-4">😕</div>
                                <p className="text-red-400 mb-2">{error}</p>
                                <button
                                    onClick={() => {
                                        setError(null);
                                        setRecommendations([]);
                                    }}
                                    className="text-purple-400 hover:text-purple-300"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {/* Recommendations List */}
                        {!loading && !error && recommendations.length > 0 && (
                            <div className="space-y-4">
                                {recommendations.map((issue, index) => (
                                    <div
                                        key={issue.id || index}
                                        className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Match Score Badge */}
                                            <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${getScoreColor(issue.match_score)} flex flex-col items-center justify-center shadow-lg`}>
                                                <span className="text-white font-bold text-lg">{Math.round(issue.match_score)}%</span>
                                                <span className="text-white/80 text-xs">match</span>
                                            </div>

                                            {/* Issue Details */}
                                            <div className="flex-1 min-w-0">
                                                <a
                                                    href={issue.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-lg font-semibold text-white hover:text-purple-300 transition-colors line-clamp-2 mb-2 block"
                                                >
                                                    {issue.title}
                                                </a>

                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    <span className="text-white/50 text-sm">📦 {issue.repo}</span>
                                                    {issue.language && (
                                                        <span className="px-2 py-0.5 bg-violet-500/20 border border-violet-500/30 rounded text-violet-300 text-xs">
                                                            {issue.language}
                                                        </span>
                                                    )}
                                                    {issue.comments === 0 && (
                                                        <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-green-300 text-xs">
                                                            🔥 Fresh
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Labels */}
                                                <div className="flex flex-wrap gap-1.5">
                                                    {issue.labels.slice(0, 4).map((label) => (
                                                        <span
                                                            key={label}
                                                            className="px-2 py-0.5 bg-white/10 rounded text-white/60 text-xs"
                                                        >
                                                            {label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Ask AI Button */}
                                            <button
                                                onClick={() => {
                                                    const params = new URLSearchParams({
                                                        title: issue.title,
                                                        body: issue.body || "",
                                                        labels: issue.labels.join(","),
                                                        repo: issue.repo,
                                                        url: issue.url
                                                    });
                                                    router.push(`/chat?${params.toString()}`);
                                                }}
                                                className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-lg text-white font-medium text-sm transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
                                            >
                                                <span>🤖</span>
                                                <span>Ask AI</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && recommendations.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-4">🔍</div>
                                <p className="text-white/60">No recommendations yet</p>
                                <p className="text-white/40 text-sm">We&apos;ll analyze your profile and find matching issues</p>
                            </div>
                        )}
                    </div>

                    {/* Stats Section */}
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-white">{recommendations.length}</div>
                            <div className="text-white/60 text-sm">Issues Found</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-white">
                                {recommendations.length > 0 ? Math.round(recommendations[0].match_score) : 0}%
                            </div>
                            <div className="text-white/60 text-sm">Top Match</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-white">
                                {new Set(recommendations.map(r => r.language)).size}
                            </div>
                            <div className="text-white/60 text-sm">Languages</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-white">
                                {new Set(recommendations.map(r => r.repo)).size}
                            </div>
                            <div className="text-white/60 text-sm">Repos</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

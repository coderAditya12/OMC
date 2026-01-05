"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function HomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <span className="text-white font-bold text-xl">O</span>
                        </div>
                        <span className="text-white font-semibold text-xl tracking-tight">OMC</span>
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
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Welcome back,{" "}
                            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                                {session.user?.name?.split(" ")[0] || "User"}
                            </span>
                            !
                        </h1>
                        <p className="text-lg text-white/60">
                            Ready to boost your productivity with AI?
                        </p>
                    </div>

                    {/* User Profile Card */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <div className="md:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <div className="flex flex-col items-center text-center">
                                {session.user?.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt="Profile"
                                        width={80}
                                        height={80}
                                        className="rounded-full border-4 border-purple-500/50 mb-4"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
                                        <span className="text-white text-2xl font-bold">
                                            {session.user?.name?.[0] || "U"}
                                        </span>
                                    </div>
                                )}
                                <h3 className="text-xl font-semibold text-white mb-1">
                                    {session.user?.name || "User"}
                                </h3>
                                <p className="text-white/60 text-sm">{session.user?.email}</p>
                                <div className="mt-4 px-4 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
                                    <span className="text-green-400 text-sm font-medium">● Active</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-1">0</h3>
                                <p className="text-white/60">Conversations</p>
                            </div>

                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-1">0</h3>
                                <p className="text-white/60">Tasks Completed</p>
                            </div>

                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-1">0h</h3>
                                <p className="text-white/60">Time Saved</p>
                            </div>

                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-4 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-1">—</h3>
                                <p className="text-white/60">Productivity Score</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <button className="group p-6 rounded-xl bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/30 hover:border-violet-500/60 transition-all text-left">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-1">New Chat</h3>
                                <p className="text-white/60 text-sm">Start a conversation with AI</p>
                            </button>

                            <button className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all text-left">
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-1">View History</h3>
                                <p className="text-white/60 text-sm">Browse past conversations</p>
                            </button>

                            <button className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all text-left">
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-1">Settings</h3>
                                <p className="text-white/60 text-sm">Customize your experience</p>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

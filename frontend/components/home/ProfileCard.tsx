"use client";

/**
 * Profile Card Component
 * Displays user profile summary with skills and interests
 */

import Image from "next/image";
import { motion } from "framer-motion";

interface ProfileCardProps {
    username: string;
    primaryLanguage: string;
    experienceLevel: string;
    interests: string[];
    userImage?: string | null;
}

export default function ProfileCard({
    username,
    primaryLanguage,
    experienceLevel,
    interests,
    userImage
}: ProfileCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all"
        >
            <div className="flex flex-wrap items-center gap-5">
                {/* Avatar */}
                {userImage && (
                    <div className="relative">
                        <Image
                            src={userImage}
                            alt="Profile"
                            width={72}
                            height={72}
                            className="rounded-2xl border-2 border-emerald-500/50 shadow-xl"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Info */}
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        @{username}
                        <span className="text-emerald-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </span>
                    </h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {/* Primary Language */}
                        <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm font-medium flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            {primaryLanguage}
                        </span>

                        {/* Experience Level */}
                        <span className="px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-xl text-violet-300 text-sm font-medium capitalize flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            {experienceLevel}
                        </span>

                        {/* Interests */}
                        {interests.slice(0, 2).map((interest) => (
                            <span
                                key={interest}
                                className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-white/70 text-sm"
                            >
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

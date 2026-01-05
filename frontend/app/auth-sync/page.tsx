"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function AuthSyncPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const processed = useRef(false);

    useEffect(() => {
        const syncWithBackend = async () => {
            if (status === "authenticated" && session && !processed.current) {
                processed.current = true;

                try {
                    // Send auth data to FastAPI backend
                    const response = await fetch("http://localhost:8000/auth/github", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            id: session.user?.id || "",
                            name: session.user?.name,
                            email: session.user?.email,
                            image: session.user?.image,
                            accessToken: session.accessToken,
                        }),
                    });

                    if (response.ok) {
                        console.log("Auth sync successful");
                    } else {
                        console.error("Auth sync failed");
                    }
                } catch (error) {
                    console.error("Error syncing auth:", error);
                } finally {
                    // Always redirect to home after sync attempt
                    router.replace("/home");
                }
            } else if (status === "unauthenticated") {
                router.replace("/login");
            }
        };

        syncWithBackend();
    }, [session, status, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/60 font-medium">Syncing your profile...</p>
            </div>
        </div>
    );
}

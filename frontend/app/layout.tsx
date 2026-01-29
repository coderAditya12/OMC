import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OpenSource Compass - Find Your First Open Source Contribution",
    template: "%s | OpenSource Compass"
  },
  description: "AI-powered platform that helps developers find beginner-friendly open source issues matching their skills. Get personalized recommendations and chat with AI to understand any issue.",
  keywords: [
    "open source",
    "first contribution",
    "good first issue",
    "beginner friendly",
    "github issues",
    "open source contribution",
    "developer tools",
    "AI assistant",
    "code contribution",
    "hacktoberfest",
    "Gsoc",
    "Google summer of Code",
    "how to contribute in the open source",
    "AI agent for open source"
  ],
  authors: [{ name: "Aditya" }],
  creator: "Aditya",
  publisher: "OpenSource Compass",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://opensource-compass.vercel.app",
    siteName: "OpenSource Compass",
    title: "OpenSource Compass - Find Your First Open Source Contribution",
    description: "AI-powered platform that matches developers with beginner-friendly open source issues based on their GitHub profile and skills.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OpenSource Compass - AI-Powered Open Source Discovery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenSource Compass - Find Your First Open Source Contribution",
    description: "AI-powered platform that matches developers with beginner-friendly open source issues.",
    images: ["/og-image.png"],
    creator: "https://x.com/AdityaG2043097",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://opensource-compass.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

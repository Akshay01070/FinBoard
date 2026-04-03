import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import ThemeInitializer from "@/components/ThemeInitializer";
import UserStoreSync from "@/components/UserStoreSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "FinBoard | Unified Financial Control — Real-time Dashboard",
  description: "Build your personalized financial command center with drag-and-drop widgets and real-time data from 4+ major providers. Track stocks, crypto, forex, and economic indicators.",
  keywords: ["finance", "dashboard", "stocks", "cryptocurrency", "real-time", "widgets", "finboard", "trading"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <ClerkProvider
          afterSignOutUrl="/"
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
        >
          <ThemeInitializer />
          <UserStoreSync />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}

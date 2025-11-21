import type { Metadata } from "next";
import { Cormorant_Garamond, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { UserMenu } from "@/components/auth/user-menu";
import Link from "next/link";
import "./globals.css";

// Art Deco font - elegant, delicate serif (Didot/Bodoni style)
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Monospace for codes/technical text
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Secret Game",
  description: "A card-based secret sharing game for small friend groups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorantGaramond.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {/* Fixed navigation header */}
          <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="text-xl font-serif font-semibold hover:opacity-80 transition-opacity">
                The Secret Game
              </Link>
              <UserMenu />
            </div>
          </nav>

          {/* Main content with padding for fixed header */}
          <div className="pt-16">
            {children}
          </div>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}

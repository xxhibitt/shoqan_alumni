import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { House, Calendar, Bookmark, User, LogIn } from "lucide-react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shoqan Alumni",
  description: "A premium networking and portfolio platform for Shoqan alumni and students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="flex min-h-screen font-sans bg-shoqan-light text-zinc-900 dark:bg-shoqan-dark dark:text-shoqan-light transition-colors duration-300">
        <ThemeProvider>
          {/* Left Sidebar Layout */}
          <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-shoqan-primary/10 bg-white/40 backdrop-blur-xl dark:border-shoqan-primary/20 dark:bg-black/20">
            {/* Logo */}
            <div className="flex h-20 items-center px-6">
              <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shoqan-primary text-white shadow-sm dark:bg-shoqan-primary dark:text-shoqan-dark">
                  <span className="font-bold tracking-tighter">S</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-shoqan-dark dark:text-shoqan-light">
                  Shoqan Alumni
                </span>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
              <Link href="/" className="flex items-center gap-4 rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-shoqan-primary/10 dark:hover:bg-shoqan-primary/20">
                <House className="h-6 w-6" />
                <span>Home</span>
              </Link>
              <Link href="#" className="flex items-center gap-4 rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-shoqan-primary/10 dark:hover:bg-shoqan-primary/20">
                <Calendar className="h-6 w-6" />
                <span>Explore</span>
              </Link>
              <Link href="#" className="flex items-center gap-4 rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-shoqan-primary/10 dark:hover:bg-shoqan-primary/20">
                <Bookmark className="h-6 w-6" />
                <span>Saved</span>
              </Link>
              <Link href="#" className="flex items-center gap-4 rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-shoqan-primary/10 dark:hover:bg-shoqan-primary/20">
                <User className="h-6 w-6" />
                <span>Profile</span>
              </Link>
            </nav>

            {/* Bottom Actions */}
            <div className="border-t border-shoqan-primary/10 px-4 py-6 dark:border-shoqan-primary/20 flex flex-col gap-4">
              <Link href="/login" className="flex items-center gap-4 rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-shoqan-primary/10 dark:hover:bg-shoqan-primary/20">
                <LogIn className="h-6 w-6" />
                <span>Sign In</span>
              </Link>
              <div className="px-3 flex items-center justify-between">
                <span className="text-sm font-medium text-shoqan-dark/60 dark:text-shoqan-light/60">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="ml-64 flex-1 min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

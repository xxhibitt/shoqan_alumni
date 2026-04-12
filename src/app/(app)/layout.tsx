import { House, Calendar, Bookmark, User, LogIn } from "lucide-react";
import Link from "next/link";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar Layout */}
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex h-20 items-center px-6">
          <Link href="/feed" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shoqan-primary text-[#0a110e] shadow-sm">
              <span className="font-bold tracking-tighter">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Shoqan Alumni
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-1 flex-col gap-2 px-4 py-6 text-white">
          <Link href="/feed" className="flex items-center gap-4 rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-white/10">
            <House className="h-6 w-6" />
            <span>Feed</span>
          </Link>
          <Link href="#" className="flex items-center gap-4 rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-white/10">
            <Calendar className="h-6 w-6" />
            <span>Explore</span>
          </Link>
          <Link href="#" className="flex items-center gap-4 rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-white/10">
            <Bookmark className="h-6 w-6" />
            <span>Saved</span>
          </Link>
          <Link href="#" className="flex items-center gap-4 rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-white/10">
            <User className="h-6 w-6" />
            <span>Profile</span>
          </Link>
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-white/10 px-4 py-6 flex flex-col gap-4 text-white">
          <Link href="/api/auth/signout" className="flex items-center gap-4 rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-white/10">
            <LogIn className="h-6 w-6" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}

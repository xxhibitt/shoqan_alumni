"use client";

import { House, Telescope, Bookmark, Settings, Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/components/providers/DashboardProvider";
import { useSession } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();
  const { openSettings, setIsCreatePostOpen, isSearchOpen, setIsSearchOpen } = useDashboard();
  const { data: session } = useSession();

  // Actual admin state
  // @ts-ignore
  const isAdmin = session?.user?.role === "ADMIN";

  const links = [
    { href: "/feed", label: "Feed", icon: House },
    { href: "/explore", label: "Explore", icon: Telescope },
    { href: "/saved", label: "Saved", icon: Bookmark },
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[72px] flex-col items-center bg-[#0a110e] border-r border-white/5 py-4 z-40">
      {/* Logo */}
      <Link href="/feed" className="mb-6 group relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-[#0a110e] shadow-sm transition-all hover:rounded-xl">
          <span className="font-bold tracking-tighter text-lg">S</span>
        </div>
        {/* Tooltip */}
        <div className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 rounded-md bg-[#1e1f22] px-3 py-1.5 text-sm font-semibold text-white shadow-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap">
          Shoqan Alumni
          {/* Arrow */}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#1e1f22]"></div>
        </div>
      </Link>

      {/* Separator */}
      <div className="w-8 h-[2px] bg-white/5 rounded-full mb-4" />

      {/* Navigation Links */}
      <nav className="flex flex-col gap-3 w-full px-3">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group relative w-full flex justify-center"
            >
              <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-full transition-all duration-300 ${isActive ? 'h-10' : 'h-0 group-hover:h-5'}" style={{ height: isActive ? '40px' : '' }} />
              
              <div
                className={`flex h-12 w-12 items-center justify-center transition-all duration-300 ${
                  isActive
                    ? "rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "rounded-[24px] bg-white/5 text-emerald-500/70 hover:rounded-2xl hover:bg-emerald-500 hover:text-white"
                }`}
              >
                <link.icon className="h-6 w-6" />
              </div>

              {/* Tooltip */}
              <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 rounded-md bg-[#1e1f22] px-3 py-1.5 text-sm font-semibold text-white shadow-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap">
                {link.label}
                {/* Arrow */}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#1e1f22]"></div>
              </div>
            </Link>
          );
        })}

        {/* Search Drawer Toggle */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="group relative w-full flex justify-center mt-2"
        >
          <div
            className={`flex h-12 w-12 items-center justify-center transition-all duration-300 ${
              isSearchOpen
                ? "rounded-2xl bg-emerald-500/20 text-emerald-500 shadow-inner"
                : "rounded-[24px] bg-white/5 text-emerald-500/70 hover:rounded-2xl hover:bg-emerald-500 hover:text-white"
            }`}
          >
            <Search className="h-6 w-6" />
          </div>
          {/* Tooltip */}
          <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 rounded-md bg-[#1e1f22] px-3 py-1.5 text-sm font-semibold text-white shadow-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap">
            Search
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#1e1f22]"></div>
          </div>
        </button>

        {/* Admin Create Post Button */}
        {isAdmin && (
          <>
            <div className="w-8 h-[2px] bg-white/5 rounded-full mx-auto my-2" />
            <button
              onClick={() => setIsCreatePostOpen(true)}
              className="group relative w-full flex justify-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[24px] bg-emerald-500/10 text-emerald-500 transition-all hover:rounded-2xl hover:bg-emerald-500 hover:text-white border border-emerald-500/20 hover:border-transparent">
                <Plus className="h-6 w-6" />
              </div>
              {/* Tooltip */}
              <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 rounded-md bg-[#1e1f22] px-3 py-1.5 text-sm font-semibold text-white shadow-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap">
                Create Admin Post
                {/* Arrow */}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#1e1f22]"></div>
              </div>
            </button>
          </>
        )}
      </nav>

      {/* Bottom Profile Pill */}
      <div className="mt-auto pb-4 w-full px-3 flex justify-center group relative">
        <button
          onClick={() => openSettings()}
          className="flex h-12 w-12 items-center justify-center rounded-[24px] bg-emerald-600/20 text-emerald-500 transition-all hover:rounded-2xl hover:bg-emerald-600 hover:text-white border border-emerald-500/30 overflow-hidden relative"
        >
          <span className="text-lg font-bold">U</span>
          
          {/* Hover overlay gear icon */}
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Settings className="h-5 w-5 text-white" />
          </div>
        </button>
        
        {/* Tooltip */}
        <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 rounded-md bg-[#1e1f22] px-3 py-1.5 text-sm font-semibold text-white shadow-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap">
          User Settings
          {/* Arrow */}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#1e1f22]"></div>
        </div>
      </div>
    </aside>
  );
}

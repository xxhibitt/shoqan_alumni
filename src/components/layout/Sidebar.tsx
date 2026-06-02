"use client";

import { House, Telescope, Bookmark, Settings, Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/components/providers/DashboardProvider";
import { useSession } from "next-auth/react";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function Sidebar() {
  const pathname = usePathname();
  const { openSettings, setIsCreatePostOpen, isSearchOpen, setIsSearchOpen } = useDashboard();
  const { data: session } = useSession();

  // @ts-ignore
  const isAdmin = session?.user?.role === "ADMIN";

  const links = [
    { href: "/feed", label: "Feed", icon: House },
    { href: "/explore", label: "Explore", icon: Telescope },
    { href: "/saved", label: "Saved", icon: Bookmark },
  ];

  return (
    <aside className="fixed bottom-0 left-0 w-full h-[72px] md:top-0 md:h-screen md:w-[72px] flex flex-row md:flex-col items-center justify-around md:justify-start bg-white/95 dark:bg-[#0a110e]/95 backdrop-blur-xl border-t md:border-t-0 border-gray-200 dark:border-white/5 md:border-r py-0 md:py-4 z-40">
      {/* Logo */}
      <Link href="/feed" className="hidden md:flex mb-6 group relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm transition-all hover:rounded-xl">
          <span className="font-bold tracking-tighter text-lg">S</span>
        </div>
        {/* Tooltip */}
        <div className="hidden md:block absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 rounded-md bg-slate-900 dark:bg-[#1e1f22] px-3 py-1.5 text-sm font-semibold text-white shadow-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap">
          Shoqan Alumni
          {/* Arrow */}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900 dark:border-r-[#1e1f22]"></div>
        </div>
      </Link>

      {/* Separator */}
      <div className="hidden md:block w-8 h-[2px] bg-gray-200 dark:bg-white/5 rounded-full mb-4" />

      {/* Navigation Links */}
      <nav className="flex flex-row md:flex-col gap-1 md:gap-3 w-full md:px-3 justify-around md:justify-start items-center h-full md:h-auto">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group relative flex justify-center py-2 md:py-0 flex-1 md:flex-none md:w-full h-full md:h-auto items-center"
            >
              <div className="hidden md:block absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 bg-emerald-500 rounded-r-full transition-all duration-300 ${isActive ? 'h-10' : 'h-0 group-hover:h-5'}" style={{ height: isActive ? '40px' : '' }} />
              
              <div
                className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center transition-all duration-300 ${
                  isActive
                    ? "rounded-xl md:rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "rounded-full md:rounded-[24px] bg-gray-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:rounded-xl md:hover:rounded-2xl hover:bg-emerald-500 hover:text-white"
                }`}
              >
                <link.icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>

              {/* Tooltip */}
              <div className="hidden md:block absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 rounded-md bg-slate-900 dark:bg-[#1e1f22] px-3 py-1.5 text-sm font-semibold text-white shadow-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap">
                {link.label}
                {/* Arrow */}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900 dark:border-r-[#1e1f22]"></div>
              </div>
            </Link>
          );
        })}

        {/* Search Drawer Toggle */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="group relative flex justify-center py-2 md:py-0 flex-1 md:flex-none md:w-full h-full md:h-auto items-center md:mt-2"
        >
          <div
            className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center transition-all duration-300 ${
              isSearchOpen
                ? "rounded-xl md:rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 shadow-inner"
                : "rounded-full md:rounded-[24px] bg-gray-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:rounded-xl md:hover:rounded-2xl hover:bg-emerald-500 hover:text-white"
            }`}
          >
            <Search className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          {/* Tooltip */}
          <div className="hidden md:block absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 rounded-md bg-slate-900 dark:bg-[#1e1f22] px-3 py-1.5 text-sm font-semibold text-white shadow-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap">
            Search
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900 dark:border-r-[#1e1f22]"></div>
          </div>
        </button>

        {/* Admin Create Post Button */}
        {isAdmin && (
          <>
            <div className="hidden md:block w-8 h-[2px] bg-gray-200 dark:bg-white/5 rounded-full mx-auto my-2" />
            <button
              onClick={() => setIsCreatePostOpen(true)}
              className="group relative flex justify-center py-2 md:py-0 flex-1 md:flex-none md:w-full h-full md:h-auto items-center"
            >
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full md:rounded-[24px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 transition-all hover:rounded-xl md:hover:rounded-2xl hover:bg-emerald-500 hover:text-white border border-emerald-200 dark:border-emerald-500/20 hover:border-transparent">
                <Plus className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              {/* Tooltip */}
              <div className="hidden md:block absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 rounded-md bg-slate-900 dark:bg-[#1e1f22] px-3 py-1.5 text-sm font-semibold text-white shadow-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap">
                Create Admin Post
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900 dark:border-r-[#1e1f22]"></div>
              </div>
            </button>
          </>
        )}
        
        {/* Profile Settings (Mobile) */}
        <div className="md:hidden flex-1 flex justify-center items-center h-full group relative">
          <button
            onClick={() => openSettings()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-500 transition-all hover:rounded-xl hover:bg-emerald-600 hover:text-white border border-emerald-200 dark:border-emerald-500/30 overflow-hidden relative"
          >
            <span className="text-sm font-bold">U</span>
          </button>
        </div>
      </nav>

      {/* Bottom Controls (Desktop) */}
      <div className="hidden md:flex mt-auto pb-4 w-full px-3 flex-col items-center gap-3">
        <LanguageSwitcher />
        
        <div className="flex justify-center group relative w-full">
          <button
            onClick={() => openSettings()}
            className="flex h-12 w-12 items-center justify-center rounded-[24px] bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-500 transition-all hover:rounded-2xl hover:bg-emerald-600 hover:text-white border border-emerald-200 dark:border-emerald-500/30 overflow-hidden relative"
          >
            <span className="text-lg font-bold">U</span>
            
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
              <Settings className="h-5 w-5 text-white" />
            </div>
          </button>
          
          {/* Tooltip */}
          <div className="hidden md:block absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 rounded-md bg-slate-900 dark:bg-[#1e1f22] px-3 py-1.5 text-sm font-semibold text-white shadow-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap">
            User Settings
            {/* Arrow */}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900 dark:border-r-[#1e1f22]"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}

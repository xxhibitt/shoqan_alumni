"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, User, Briefcase, FileText } from "lucide-react";
import { useDashboard } from "@/components/providers/DashboardProvider";

export function SearchDrawer() {
  const { isSearchOpen, setIsSearchOpen, setSelectedProfile, setSelectedPost } = useDashboard();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ profiles: any[]; posts: any[] }>({ profiles: [], posts: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults({ profiles: [], posts: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults({ profiles: data.profiles || [], posts: data.posts || [] });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-[72px] bottom-0 w-[400px] bg-[#0f1915] border-r border-white/10 z-30 shadow-2xl flex flex-col"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Search</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="text"
                autoFocus
                placeholder="Search profiles, posts, tags..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[#0a110e] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-white/50 text-sm">Searching...</span>
              </div>
            ) : query && results.profiles.length === 0 && results.posts.length === 0 ? (
              <div className="text-center py-10 text-white/50 text-sm">
                No results found for "{query}"
              </div>
            ) : (
              <div className="space-y-6">
                {results.profiles.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3 px-2">Profiles</h3>
                    <div className="space-y-2">
                      {results.profiles.map(p => (
                        <div
                          key={p.id}
                          onClick={() => { setSelectedProfile(p); setIsSearchOpen(false); }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                            {p.avatarUrl ? (
                              <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <User className="h-4 w-4 text-emerald-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{p.firstName} {p.lastName}</h4>
                            <p className="text-xs text-white/50 truncate flex items-center gap-1">
                              <Briefcase className="h-3 w-3 shrink-0" />
                              {p.alumniData?.jobTitle || p.academicData?.intendedMajor || "Alumnus"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.posts.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3 px-2">Posts</h3>
                    <div className="space-y-2">
                      {results.posts.map(post => (
                        <div
                          key={post.id}
                          onClick={() => { setSelectedPost(post); setIsSearchOpen(false); }}
                          className="p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                            <h4 className="text-sm font-bold text-white truncate">{post.title}</h4>
                          </div>
                          <p className="text-xs text-white/50 line-clamp-2 pl-6">{post.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { Briefcase, Calendar, Bookmark } from "lucide-react";
import { useState } from "react";
import { useDashboard } from "@/components/providers/DashboardProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useRouter } from "next/navigation";

export function ExploreFeed({ posts, isAdmin }: { posts: any[], isAdmin?: boolean }) {
  const { t } = useLanguage();
  const { setSelectedPost } = useDashboard();
  const router = useRouter();
  const [savedStates, setSavedStates] = useState<Record<string, boolean>>({});

  const handleSavePost = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const isSaved = savedStates[postId] || false;
    setSavedStates(prev => ({ ...prev, [postId]: !isSaved }));
    try {
      const res = await fetch("/api/save/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId })
      });
      if (res.ok) {
        const data = await res.json();
        setSavedStates(prev => ({ ...prev, [postId]: data.saved }));
      } else {
        setSavedStates(prev => ({ ...prev, [postId]: isSaved }));
      }
    } catch (err) {
      setSavedStates(prev => ({ ...prev, [postId]: isSaved }));
    }
  };



  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="h-6 w-6 text-emerald-500" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("explore.hotOffers")}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div 
            key={post.id} 
            onClick={() => setSelectedPost(post)}
            className="group bg-[#0f1915] border border-white/5 hover:border-emerald-500/30 rounded-2xl p-0 transition-all cursor-pointer flex flex-col overflow-hidden hover:shadow-lg hover:shadow-emerald-900/10"
          >
            {post.imageUrl && (
              <div className="h-32 w-full overflow-hidden">
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            )}
            <div className="p-5 flex-1 flex flex-col">
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                  {post.author?.profile?.avatarUrl ? (
                    <img src={post.author.profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-emerald-500 text-sm">
                      {post.author?.profile?.firstName?.[0] || "A"}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-white text-sm truncate">
                    {post.author?.profile?.firstName ? `${post.author.profile.firstName} ${post.author.profile.lastName}` : "Unknown User"}
                  </h4>
                  <p className="text-xs text-white/50 truncate">
                    {post.author?.profile?.university?.name || "Admin"}
                  </p>
                </div>

                <button
                  onClick={(e) => handleSavePost(e, post.id)}
                  className="p-2 rounded-full text-white/30 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                >
                  <Bookmark className={`h-4 w-4 ${savedStates[post.id] ? "fill-emerald-500 text-emerald-500" : ""}`} />
                </button>
              </div>

              {/* Content */}
              <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2 w-max">
                {post.type}
              </span>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-2 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-white/60 mb-4 line-clamp-3">
                {post.content}
              </p>

              {/* Footer */}
              <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex gap-2">
                  {post.tags?.slice(0, 2).map((tag: any) => (
                    <span key={tag.id} className="text-xs text-white/40">#{tag.name}</span>
                  ))}
                </div>
                <span className="text-xs text-white/30 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.createdAt).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

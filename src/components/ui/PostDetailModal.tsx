"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, Calendar, Bookmark } from "lucide-react";
import { useDashboard } from "@/components/providers/DashboardProvider";

export function PostDetailModal() {
  const { selectedPost, setSelectedPost } = useDashboard();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleSavePost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedPost) return;
    const isSaved = isBookmarked;
    setIsBookmarked(!isSaved);
    try {
      const res = await fetch("/api/save/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: selectedPost.id })
      });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.saved);
      } else {
        setIsBookmarked(isSaved);
      }
    } catch (err) {
      setIsBookmarked(isSaved);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPost(null);
    };
    if (selectedPost) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset"; // Just in case, SettingsModal or CreatePostModal handle their own
    };
  }, [selectedPost, setSelectedPost]);

  return (
    <AnimatePresence>
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedPost(null)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#0f1915] shadow-2xl border border-white/10 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Author Info */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0a110e] shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                  {selectedPost.author?.profile?.avatarUrl ? (
                    <img src={selectedPost.author.profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-bold text-emerald-500">
                      {selectedPost.author?.profile?.firstName ? selectedPost.author.profile.firstName[0] : "A"}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {selectedPost.author?.profile ? `${selectedPost.author.profile.firstName} ${selectedPost.author.profile.lastName}` : "Alumni Admin"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {selectedPost.author?.profile?.alumniData?.jobTitle || selectedPost.author?.profile?.academicData?.intendedMajor || "Administrator"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {selectedPost.createdAt ? new Date(selectedPost.createdAt).toLocaleDateString('en-US', { timeZone: 'UTC' }) : "2 days ago"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSavePost}
                  className="p-2 rounded-full text-white/50 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                >
                  <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-emerald-500 text-emerald-500" : ""}`} />
                </button>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8 overflow-y-auto">
              <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-md mb-4">
                {selectedPost.type || "Announcement"}
              </span>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                {selectedPost.title || "Summer Software Engineering Intern"}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {(selectedPost.tags || ["#Tech", "#Almaty"]).map((tag: any, i: number) => (
                  <span key={i} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-sm font-medium text-white/70">
                    {typeof tag === 'string' ? tag : tag.name}
                  </span>
                ))}
              </div>

              <div className="prose prose-invert max-w-none prose-p:text-white/80 prose-p:leading-relaxed prose-headings:text-white">
                {selectedPost.content ? (
                  <p className="whitespace-pre-wrap">{selectedPost.content}</p>
                ) : (
                  <p>
                    Join our dynamic team in Almaty to build scalable microservices using Go and React. Mentorship provided by senior alumni.
                    We are looking for enthusiastic developers ready to tackle difficult problems at scale. 
                    <br/><br/>
                    Requirements:<br/>
                    - Proficiency in React.js and Go.<br/>
                    - Passion for building great products.<br/>
                    - Currently enrolled in a related degree.
                  </p>
                )}
              </div>

              {/* Optional Image */}
              {selectedPost.imageUrl && (
                <div className="mt-8 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                  <img src={selectedPost.imageUrl} alt="Post Cover" className="w-full h-auto object-cover max-h-[400px]" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

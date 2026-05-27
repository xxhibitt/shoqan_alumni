"use client";

import { useState } from "react";
import { User, FileText, Bookmark } from "lucide-react";
import { useDashboard } from "@/components/providers/DashboardProvider";

export function SavedClient({ savedProfiles, savedPosts }: { savedProfiles: any[], savedPosts: any[] }) {
  const [activeTab, setActiveTab] = useState<"profiles" | "posts">("profiles");
  const { setSelectedProfile, setSelectedPost, showToast } = useDashboard();

  const [localProfiles, setLocalProfiles] = useState(savedProfiles);
  const [localPosts, setLocalPosts] = useState(savedPosts);

  const handleUnsaveProfile = async (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    setLocalProfiles(prev => prev.filter(p => p.id !== profileId));
    showToast("Profile removed from saved");
    await fetch("/api/save/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileId }) });
  };

  const handleUnsavePost = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    setLocalPosts(prev => prev.filter(p => p.id !== postId));
    showToast("Post removed from saved");
    await fetch("/api/save/post", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId }) });
  };

  return (
    <div className="flex-1 p-8 flex flex-col h-full overflow-hidden">
      <header className="mb-8 shrink-0">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-emerald-500" />
          Saved
        </h1>
        <p className="text-white/50">Manage your bookmarked profiles and posts.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-white/10 pb-px shrink-0">
        <button
          onClick={() => setActiveTab("profiles")}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "profiles"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          <User className="h-4 w-4" />
          Saved Profiles
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "posts"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          <FileText className="h-4 w-4" />
          Saved Posts
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-4">
        {activeTab === "profiles" ? (
          localProfiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <User className="h-12 w-12 text-white/20 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Saved Profiles</h3>
              <p className="text-white/50">You haven't bookmarked any profiles yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
              {localProfiles.map((p) => (
                <div key={p.id} onClick={() => setSelectedProfile(p)} className="bg-[#0f1915] border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center overflow-hidden">
                      {p.avatarUrl ? (
                        <img src={p.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-emerald-500">{p.firstName?.[0] || "U"}</span>
                      )}
                    </div>
                    <button className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-colors" onClick={(e) => handleUnsaveProfile(e, p.id)}>
                      <Bookmark className="h-4 w-4 fill-emerald-500" />
                    </button>
                  </div>
                  <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{p.firstName} {p.lastName}</h3>
                  <p className="text-sm text-white/50 mb-4">Class of {p.gradYear || "N/A"}</p>
                  <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors">
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          localPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-white/20 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Saved Posts</h3>
              <p className="text-white/50">You haven't bookmarked any posts yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-8">
              {localPosts.map((post) => (
                <div key={post.id} className="bg-[#0f1915] border border-white/5 rounded-2xl p-6 flex flex-col cursor-pointer hover:border-emerald-500/30 transition-colors group" onClick={() => setSelectedPost(post)}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider rounded-md">
                      {post.type}
                    </span>
                    <button className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-colors" onClick={(e) => handleUnsavePost(e, post.id)}>
                      <Bookmark className="h-4 w-4 fill-emerald-500" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
                  <p className="text-sm text-white/60 mb-6 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="mt-auto text-xs text-white/30">Saved</div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { Search, MapPin, GraduationCap, Bookmark } from "lucide-react";
import { useDashboard } from "@/components/providers/DashboardProvider";
import Link from "next/link";

export function FeedGrid({ profiles, recommendedUnis = [] }: { profiles: any[], recommendedUnis?: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { setSelectedProfile } = useDashboard();

  const filteredProfiles = useMemo(() => {
    if (!searchQuery) return profiles;
    const query = searchQuery.toLowerCase();
    return profiles.filter((p) => {
      const nameMatch = `${p.firstName} ${p.lastName}`.toLowerCase().includes(query);
      const uniMatch = p.university?.name?.toLowerCase().includes(query);
      const tagsMatch = p.tags?.some((t: any) => t.name.toLowerCase().includes(query));
      const majorMatch = (p.academicData?.intendedMajor || p.alumniData?.jobTitle || "").toLowerCase().includes(query);
      return nameMatch || uniMatch || tagsMatch || majorMatch;
    });
  }, [profiles, searchQuery]);

  return (
    <>
      {/* Top Section: Profiles Similar to You */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Profiles Similar to You</h2>
          <Link href="/explore" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">View All</Link>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {profiles.slice(0, 5).map((p, i) => (
            <div key={p.id} onClick={() => setSelectedProfile(p)} className="w-[280px] bg-[#0f1915] border border-white/10 rounded-2xl overflow-hidden shrink-0 snap-start hover:border-emerald-500/30 transition-colors cursor-pointer group">
              {/* Banner Area */}
              <div className={`h-16 w-full ${i % 2 === 0 ? "bg-gradient-to-r from-emerald-900 to-emerald-700" : "bg-white/5"} relative`}>
                <BannerImage url={p.bannerUrl} className="w-full h-full object-cover" />
              </div>
              
              <div className="p-5 pt-0 relative">
                {/* Avatar overlapping banner */}
                <div className="absolute -top-6 left-5 h-12 w-12 rounded-full flex items-center justify-center border-2 border-[#0f1915] overflow-hidden bg-[#0f1915]">
                  <AvatarImage url={p.avatarUrl} name={p.firstName} className="w-full h-full object-cover" />
                </div>

                <div className="pt-10 pb-4 flex flex-col gap-1">
                  <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate whitespace-nowrap overflow-hidden block max-w-full">
                    {p.firstName && p.firstName !== "Unknown" ? `${p.firstName} ${p.lastName}` : "Alumnus"}
                  </h3>
                  <p className="text-xs text-white/50 truncate">Class of {p.gradYear || "N/A"}</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <GraduationCap className="h-4 w-4 shrink-0 opacity-50" />
                    <span className="truncate">{p.university?.name || "University"}</span>
                  </div>
                  {p.university?.country && (
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <MapPin className="h-4 w-4 shrink-0 opacity-50" />
                      <span className="truncate">{p.university.country}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.tags?.slice(0, 2).map((t: any) => (
                    <span key={t.id} className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-medium text-white/60">#{t.name}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* University Discovery */}
      {recommendedUnis.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Suggested Universities</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {recommendedUnis.map((uni, i) => (
              <div key={uni.id} className="w-[220px] p-5 bg-[#0f1915] border border-white/10 rounded-2xl shrink-0 snap-start hover:border-emerald-500/30 transition-colors">
                <GraduationCap className="h-8 w-8 text-emerald-500 mb-3" />
                <h3 className="font-bold text-white line-clamp-2 mb-1">{uni.name}</h3>
                {uni.country && <p className="text-xs text-white/50">{uni.country}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom Section: Based on Your Searches/Interests */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">All Alumni Directory</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by university, tag, name..." 
              className="bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 w-[250px] md:w-[300px]"
            />
          </div>
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-20 text-white/50">
            No profiles found matching "{searchQuery}"
          </div>
        )}

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredProfiles.map((p, i) => (
            <div key={p.id} onClick={() => setSelectedProfile(p)} className="flex flex-col h-full break-inside-avoid bg-[#0f1915] border border-white/5 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-colors cursor-pointer group">
              {/* Banner Area */}
              <div className={`h-24 w-full ${i % 2 !== 0 ? "bg-white/5" : "bg-gradient-to-r from-blue-900/40 to-emerald-900/40"} relative`}>
                <BannerImage url={p.bannerUrl} className="w-full h-full object-cover opacity-60" />
              </div>

              <div className="p-5 pt-0 relative flex flex-col flex-1">
                {/* Avatar */}
                <div className="absolute -top-8 left-5 h-16 w-16 rounded-full border-4 border-[#0f1915] flex items-center justify-center overflow-hidden bg-[#0f1915]">
                  <AvatarImage url={p.avatarUrl} name={p.firstName} className="w-full h-full object-cover" />
                </div>
                
                <div className="pt-12 mb-4 overflow-hidden flex flex-col gap-1">
                  <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors truncate whitespace-nowrap overflow-hidden block max-w-full">
                    {p.firstName && p.firstName !== "Unknown" ? `${p.firstName} ${p.lastName}` : "Alumnus"}
                  </h3>
                  <p className="text-xs text-white/40 truncate">{p.alumniData?.jobTitle || p.academicData?.intendedMajor || "Alumnus"}</p>
                  {p.alumniData?.isMentoring && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      Open to Mentoring
                    </span>
                  )}
                </div>
                
                {p.bio && (
                  <p className="text-sm text-white/70 mb-4 line-clamp-2">
                    {p.bio}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mt-auto">
                  {p.tags?.slice(0, 2).map((t: any) => (
                    <span key={t.id} className="px-2 py-1 bg-white/5 text-white/60 rounded-md text-[10px] font-medium">#{t.name}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function AvatarImage({ url, name, className }: { url?: string | null; name?: string; className?: string }) {
  const [error, setError] = useState(false);
  if (url && !error) {
    return <img src={url} alt="avatar" onError={() => setError(true)} className={className} />;
  }
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-blue-500/20 text-emerald-500 font-bold ${className}`}>
      {name?.[0]?.toUpperCase() || "U"}
    </div>
  );
}

export function BannerImage({ url, className }: { url?: string | null; className?: string }) {
  const [error, setError] = useState(false);
  if (url && !error) {
    return <img src={url} alt="banner" onError={() => setError(true)} className={className} />;
  }
  return null;
}

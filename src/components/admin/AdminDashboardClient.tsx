"use client";

import React, { useState } from "react";
import { approveUser, rejectUser } from "@/app/admin/actions";
import { Search, Calendar, ChevronRight, CheckCircle2, Archive } from "lucide-react";
import { HighlightedText } from "@/components/ui/highlighted-text";

type UserProfile = {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  } | null;
};

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  type: string;
  isArchived: boolean;
};

interface AdminDashboardClientProps {
  pendingUsers: UserProfile[];
  announcements: Post[];
  adminUser: {
    name?: string | null;
    email?: string | null;
  };
}

const STATUS_FILTERS = ["Live", "Archived", "All"] as const;
type StatusFilterType = typeof STATUS_FILTERS[number];
const DATE_PILLS = ["Today", "Last 7 Days", "Last 30 Days", "This Year"];

export function AdminDashboardClient({ pendingUsers, announcements, adminUser }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"moderation" | "announcements">("moderation");

  // Announcements Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("All");
  const [activeDateFilter, setActiveDateFilter] = useState<string>("This Year");

  // Format real data to fit the UI mock
  const formattedAnnouncements = announcements.map((post) => ({
    id: post.id,
    title: post.title,
    body: post.content,
    status: post.isArchived ? "Archived" : "Live",
    date: post.createdAt,
    isArchived: post.isArchived,
  }));

  const filteredAnnouncements = formattedAnnouncements.filter((announcement) => {
    if (statusFilter === "Live" && announcement.isArchived) {
      return false;
    }
    if (statusFilter === "Archived" && !announcement.isArchived) {
      return false;
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !announcement.title.toLowerCase().includes(q) &&
        !announcement.body.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f4f7f5] dark:bg-[#0f1915] text-slate-900 dark:text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-2">
            Logged in as: <span className="font-medium text-slate-300">{adminUser?.name || "Admin"}</span> ({adminUser?.email})
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-6 border-b border-slate-200 dark:border-white/10 mb-8">
          <button
            onClick={() => setActiveTab("moderation")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === "moderation"
                ? "text-emerald-500"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Moderation Queue
            {activeTab === "moderation" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("announcements")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === "announcements"
                ? "text-emerald-500"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            All Announcements
            {activeTab === "announcements" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full" />
            )}
          </button>
        </div>

        {/* Tab 1: Moderation Queue */}
        {activeTab === "moderation" && (
          <div>
            {pendingUsers.length === 0 ? (
              <div className="text-center p-12 bg-white dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10">
                <p className="text-slate-500 dark:text-slate-400">No pending users in the moderation queue.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => {
                  const profile = user.profile;
                  const fullName = profile 
                    ? `${profile.firstName} ${profile.lastName}`
                    : "Profile Incomplete";

                  return (
                    <div 
                      key={user.id} 
                      className="bg-white dark:bg-black/40 rounded-xl p-5 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        {/* Left Side */}
                        <div>
                          <h2 className="text-lg font-semibold">{fullName}</h2>
                          <a 
                            href={`mailto:${user.email}`}
                            className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                          >
                            {user.email}
                          </a>
                        </div>

                        {/* Right Side (Action Buttons) */}
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => rejectUser(user.id)}
                            className="px-4 py-2 text-sm font-medium rounded-lg border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            Reject
                          </button>

                          <button 
                            onClick={() => approveUser(user.id)}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Announcements */}
        {activeTab === "announcements" && (
          <div className="space-y-8">
            {/* Top Filter Section */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                {/* Search Input */}
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-500"
                  />
                </div>

                {/* Segmented Control */}
                <div className="flex items-center bg-black/40 border border-white/10 p-1 rounded-lg shrink-0">
                  {STATUS_FILTERS.map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        statusFilter === status
                          ? "bg-[#1a2c24] text-emerald-400 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Presets (Pills) */}
              <div className="flex flex-wrap items-center gap-2">
                {DATE_PILLS.map((pill) => (
                  <button
                    key={pill}
                    onClick={() => setActiveDateFilter(pill)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                      activeDateFilter === pill
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : "border-white/10 bg-black/20 text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                  >
                    {pill}
                  </button>
                ))}
                
                <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block"></div>
                
                <button className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-white/10 bg-black/20 text-slate-400 hover:border-white/20 hover:text-slate-200 transition-colors">
                  <Calendar className="w-3 h-3" />
                  Custom Range
                </button>
              </div>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
              {filteredAnnouncements.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                  <p className="text-slate-500 text-sm">No announcements match your criteria.</p>
                </div>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="group bg-black/20 border border-white/5 hover:border-emerald-500/30 rounded-xl p-5 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-lg text-slate-100">
                        <HighlightedText text={announcement.title} highlight={searchQuery} />
                      </h3>
                      <span
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                          announcement.status === "Live"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {announcement.status === "Live" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Archive className="w-3 h-3" />
                        )}
                        {announcement.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">
                      <HighlightedText text={announcement.body} highlight={searchQuery} />
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium mt-auto">
                      <span>{new Date(announcement.date).toLocaleDateString()}</span>
                      <span className="flex items-center text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details <ChevronRight className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

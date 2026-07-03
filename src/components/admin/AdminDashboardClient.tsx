"use client";

import React, { useState, useMemo, useTransition } from "react";
import { approveUser, rejectUser, deleteAnnouncement } from "@/app/admin/actions";
import { Search, Calendar, ChevronRight, CheckCircle2, Archive, Trash2 } from "lucide-react";
import { HighlightedText } from "@/components/ui/highlighted-text";

type UserProfile = {
  id: string;
  email: string;
  profile: any;
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

const DATE_PILLS = [
  { label: "All Time", value: "ALL" },
  { label: "Today", value: "TODAY" },
  { label: "Last 7 Days", value: "7DAYS" },
  { label: "Last 30 Days", value: "30DAYS" },
  { label: "This Year", value: "YEAR" },
];

export function AdminDashboardClient({ pendingUsers, announcements, adminUser }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"moderation" | "announcements">("moderation");
  const [isPending, startTransition] = useTransition();
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Announcements Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("ALL");

  // Format real data to fit the UI mock
  const formattedAnnouncements = announcements.map((post) => ({
    id: post.id,
    title: post.title,
    body: post.content,
    date: post.createdAt,
  }));

  const filteredAnnouncements = useMemo(() => {
    return formattedAnnouncements.filter((announcement) => {
      // Date Filter
      const postDate = new Date(announcement.date).getTime();
      if (dateFilter === "TODAY" && postDate < new Date().setHours(0, 0, 0, 0)) return false;
      if (dateFilter === "7DAYS" && postDate < Date.now() - 7 * 24 * 60 * 60 * 1000) return false;
      if (dateFilter === "30DAYS" && postDate < Date.now() - 30 * 24 * 60 * 60 * 1000) return false;
      if (dateFilter === "YEAR" && postDate < new Date(new Date().getFullYear(), 0, 1).getTime()) return false;
      
      // Search Query Filter
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
  }, [formattedAnnouncements, dateFilter, searchQuery]);

  const handleReject = async (userId: string) => {
    const reason = window.prompt("Please enter the reason for rejection (this will be sent to the user):");
    if (!reason) return; // Cancel if the admin clicks cancel or leaves it blank

    await rejectUser(userId, reason);
  };

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
                            onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                          >
                            {expandedUserId === user.id ? "Hide Details" : "Review Details"}
                          </button>
                          
                          <button 
                            onClick={() => handleReject(user.id)}
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

                      {/* Expandable Review Panel */}
                      {expandedUserId === user.id && profile && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-black/20 p-4 rounded-lg">
                          <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Academics</h3>
                            <p className="text-sm"><span className="text-slate-400">University:</span> {profile.university?.name || "N/A"}</p>
                            <p className="text-sm"><span className="text-slate-400">Major:</span> {profile.academicData?.intendedMajor || profile.alumniData?.jobTitle || "N/A"}</p>
                            <p className="text-sm"><span className="text-slate-400">Grad Year:</span> {profile.gradYear || "N/A"}</p>
                            <p className="text-sm"><span className="text-slate-400">GPA:</span> {profile.academicData?.gpa || "N/A"}</p>
                            <p className="text-sm"><span className="text-slate-400">SAT:</span> {profile.academicData?.satScore || "N/A"}</p>
                            <p className="text-sm"><span className="text-slate-400">IELTS:</span> {profile.academicData?.ieltsScore || "N/A"}</p>
                          </div>
                          <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Network & Experience</h3>
                            <p className="text-sm"><span className="text-slate-400">Extracurriculars:</span> {profile.extracurriculars || "N/A"}</p>
                            <p className="text-sm"><span className="text-slate-400">Awards:</span> {profile.awards || "N/A"}</p>
                            <p className="text-sm flex items-center gap-1">
                              <span className="text-slate-400">LinkedIn:</span>
                              {profile.linkedin ? <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">{profile.linkedin}</a> : "N/A"}
                            </p>
                            <p className="text-sm"><span className="text-slate-400">Telegram:</span> {profile.telegram ? `@${profile.telegram.replace('@', '')}` : "N/A"}</p>
                          </div>
                        </div>
                      )}
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
              </div>

              {/* Date Presets (Pills) */}
              <div className="flex flex-wrap items-center gap-2">
                {DATE_PILLS.map((pill) => (
                  <button
                    key={pill.value}
                    onClick={() => setDateFilter(pill.value)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                      dateFilter === pill.value
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : "border-white/10 bg-black/20 text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
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
                      <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startTransition(() => {
                                deleteAnnouncement(announcement.id);
                              });
                            }}
                            disabled={isPending}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Announcement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
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

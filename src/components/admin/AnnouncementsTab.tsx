"use client";

import React, { useState } from "react";
import { Search, Calendar, ChevronRight, CheckCircle2, Archive } from "lucide-react";
import { HighlightedText } from "@/components/ui/highlighted-text";

// Mock Data
const MOCK_ANNOUNCEMENTS = [
  {
    id: "1",
    title: "Platform Maintenance Scheduled",
    body: "We will be performing routine maintenance on the platform servers this Sunday at 2 AM EST. Expect a downtime of approximately 2 hours.",
    status: "Live",
    date: "2026-06-18",
  },
  {
    id: "2",
    title: "New Mentorship Program Launching Soon",
    body: "We are excited to announce our new alumni-to-student mentorship initiative. Keep an eye out for sign-ups starting next week!",
    status: "Archived",
    date: "2026-06-10",
  },
  {
    id: "3",
    title: "Welcome to the Shoqan Alumni Network",
    body: "Please make sure your profile is fully complete so we can verify your status faster. Reach out if you have any questions regarding the onboarding process.",
    status: "Live",
    date: "2026-05-20",
  },
];

const STATUS_FILTERS = ["Live", "Archived", "All"] as const;
type StatusFilterType = typeof STATUS_FILTERS[number];

const DATE_PILLS = ["Today", "Last 7 Days", "Last 30 Days", "This Year"];

export function AnnouncementsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("All");
  const [activeDateFilter, setActiveDateFilter] = useState<string>("This Year");

  // Filter logic (mock implementation)
  const filteredAnnouncements = MOCK_ANNOUNCEMENTS.filter((announcement) => {
    // 1. Status Filter
    if (statusFilter !== "All" && announcement.status !== statusFilter) {
      return false;
    }
    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !announcement.title.toLowerCase().includes(q) &&
        !announcement.body.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    // 3. Date Pill Filter (Mock logic - for demonstration purposes just returns true)
    return true; 
  });

  return (
    <div className="bg-[#0f1915] text-white p-6 rounded-2xl border border-white/10 space-y-8">
      {/* Top Filter Section */}
      <div className="flex flex-col gap-6">
        {/* Search Bar & Status Segmented Control */}
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
  );
}

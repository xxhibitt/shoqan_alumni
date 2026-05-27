"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ProfileCard } from "./ProfileCard";
import Fuse from "fuse.js";
import { Search, Globe, HandHeart, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedGridProps = {
  alumni: any[];
};

export function FeedGrid({ alumni }: FeedGridProps) {
  // Search & Boolean State
  const [searchQuery, setSearchQuery] = useState("");
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [showMentorsOnly, setShowMentorsOnly] = useState(false);

  // Threshold State
  const [minGpa, setMinGpa] = useState<number | "">("");
  const [minSat, setMinSat] = useState<number | "">("");
  const [minIelts, setMinIelts] = useState<number | "">("");

  // Categorical State
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [aidStatus, setAidStatus] = useState<string>("");

  // Sorting State
  const [sortBy, setSortBy] = useState<string>("Newest Graduates");

  // Dynamic Country Extraction
  const uniqueCountries = useMemo(() => {
    const set = new Set<string>();
    alumni.forEach(a => {
      if (a.countryOfStudy) set.add(a.countryOfStudy);
    });
    return Array.from(set).sort();
  }, [alumni]);

  // Initialize Fuse index
  const fuse = useMemo(() => {
    return new Fuse(alumni, {
      keys: [
        "firstName",
        "lastName",
        "major",
        "university",
        "countryOfStudy",
        "bio",
        "activities",
        "achievements"
      ],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [alumni]);

  // Compute final filtered & sorted array
  const filteredAlumni = useMemo(() => {
    let result = alumni;

    // 1. Text Search
    if (searchQuery.trim() !== "") {
      const searchResults = fuse.search(searchQuery);
      result = searchResults.map((r) => r.item);
    }

    // 2. Boolean Filters
    if (showSocialLinks) {
      result = result.filter(
        (p) =>
          p.socialLinks &&
          Object.keys(p.socialLinks).length > 0 &&
          Object.values(p.socialLinks).some((v) => v !== "" && v !== null)
      );
    }
    if (showMentorsOnly) {
      result = result.filter((p) => p.openToMentoring === true);
    }

    // 3. Numerical Thresholds
    if (minGpa !== "") {
      result = result.filter((p) => p.gpa && p.gpa >= minGpa);
    }
    if (minSat !== "") {
      result = result.filter((p) => p.satScore && p.satScore >= minSat);
    }
    if (minIelts !== "") {
      result = result.filter((p) => p.ieltsScore && p.ieltsScore >= minIelts);
    }

    // 4. Categorical Filters
    if (selectedCountry !== "") {
      result = result.filter((p) => p.countryOfStudy === selectedCountry);
    }
    if (aidStatus !== "") {
      if (aidStatus === "None") {
        result = result.filter((p) => !p.financialAidStatus || p.financialAidStatus.toLowerCase() === "none");
      } else {
        result = result.filter((p) => p.financialAidStatus && p.financialAidStatus.toLowerCase().includes(aidStatus.toLowerCase()));
      }
    }

    // 5. Sorting Engine
    result = [...result].sort((a, b) => {
      if (sortBy === "Newest Graduates") {
        const yearA = a.gradYear || 0;
        const yearB = b.gradYear || 0;
        return yearB - yearA;
      }
      if (sortBy === "Highest GPA") {
        const gpaA = a.gpa || 0;
        const gpaB = b.gpa || 0;
        return gpaB - gpaA;
      }
      if (sortBy === "Highest SAT") {
        const satA = a.satScore || 0;
        const satB = b.satScore || 0;
        return satB - satA;
      }
      return 0;
    });

    return result;
  }, [
    alumni, searchQuery, showSocialLinks, showMentorsOnly,
    minGpa, minSat, minIelts, selectedCountry, aidStatus, sortBy, fuse
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Upper Search Bar & Boolean Pills */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search universities, majors, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-6 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all backdrop-blur-xl"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowSocialLinks(!showSocialLinks)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors cursor-pointer",
              showSocialLinks
                ? "bg-shoqan-primary/20 border-shoqan-primary text-shoqan-primary hover:bg-shoqan-primary/30"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Globe className="h-4 w-4" />
            Has Social Links
          </button>
          <button
            onClick={() => setShowMentorsOnly(!showMentorsOnly)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors cursor-pointer",
              showMentorsOnly
                ? "bg-shoqan-primary/20 border-shoqan-primary text-shoqan-primary hover:bg-shoqan-primary/30"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <HandHeart className="h-4 w-4" />
            Open to Mentoring
          </button>
        </div>
      </div>

      {/* Advanced Filter UI Row */}
      <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-white/5">

        {/* GPA */}
        <div className="relative">
          <select
            value={minGpa}
            onChange={(e) => setMinGpa(e.target.value ? Number(e.target.value) : "")}
            className="appearance-none bg-white/5 border border-white/10 text-white/70 hover:text-white rounded-full pl-4 pr-9 py-2 cursor-pointer focus:outline-none focus:border-white/30 text-sm transition-colors"
          >
            <option className="bg-[#0a110e]" value="">Min GPA</option>
            <option className="bg-[#0a110e]" value="3.0">3.0+</option>
            <option className="bg-[#0a110e]" value="3.5">3.5+</option>
            <option className="bg-[#0a110e]" value="3.8">3.8+</option>
            <option className="bg-[#0a110e]" value="4.0">4.0</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
        </div>

        {/* SAT */}
        <div className="relative">
          <select
            value={minSat}
            onChange={(e) => setMinSat(e.target.value ? Number(e.target.value) : "")}
            className="appearance-none bg-white/5 border border-white/10 text-white/70 hover:text-white rounded-full pl-4 pr-9 py-2 cursor-pointer focus:outline-none focus:border-white/30 text-sm transition-colors"
          >
            <option className="bg-[#0a110e]" value="">Min SAT</option>
            <option className="bg-[#0a110e]" value="1200">1200+</option>
            <option className="bg-[#0a110e]" value="1300">1300+</option>
            <option className="bg-[#0a110e]" value="1400">1400+</option>
            <option className="bg-[#0a110e]" value="1500">1500+</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
        </div>

        {/* IELTS */}
        <div className="relative">
          <select
            value={minIelts}
            onChange={(e) => setMinIelts(e.target.value ? Number(e.target.value) : "")}
            className="appearance-none bg-white/5 border border-white/10 text-white/70 hover:text-white rounded-full pl-4 pr-9 py-2 cursor-pointer focus:outline-none focus:border-white/30 text-sm transition-colors"
          >
            <option className="bg-[#0a110e]" value="">Min IELTS</option>
            <option className="bg-[#0a110e]" value="6.0">6.0+</option>
            <option className="bg-[#0a110e]" value="6.5">6.5+</option>
            <option className="bg-[#0a110e]" value="7.0">7.0+</option>
            <option className="bg-[#0a110e]" value="7.5">7.5+</option>
            <option className="bg-[#0a110e]" value="8.0">8.0+</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
        </div>

        {/* Country */}
        <div className="relative">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="appearance-none bg-white/5 border border-white/10 text-white/70 hover:text-white rounded-full pl-4 pr-9 py-2 cursor-pointer focus:outline-none focus:border-white/30 text-sm transition-colors"
          >
            <option className="bg-[#0a110e]" value="">All Countries</option>
            {uniqueCountries.map(country => (
              <option key={country} className="bg-[#0a110e]" value={country}>{country}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
        </div>

        {/* Financial Aid Filter */}
        <div className="relative">
          <select
            value={aidStatus}
            onChange={(e) => setAidStatus(e.target.value)}
            className="appearance-none bg-white/5 border border-white/10 text-white/70 hover:text-white rounded-full pl-4 pr-9 py-2 cursor-pointer focus:outline-none focus:border-white/30 text-sm transition-colors"
          >
            <option className="bg-[#0a110e]" value="">Any Financial Aid</option>
            <option className="bg-[#0a110e]" value="Full Ride">Full Ride</option>
            <option className="bg-[#0a110e]" value="Partial">Partial</option>
            <option className="bg-[#0a110e]" value="None">None</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
        </div>

        {/* Sort Configuration */}
        <div className="relative ml-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-shoqan-primary/10 border border-shoqan-primary/30 text-emerald-400 rounded-full pl-5 pr-10 py-2 cursor-pointer focus:outline-none focus:border-shoqan-primary/50 text-sm font-semibold transition-colors"
          >
            <option className="bg-[#0a110e] text-white" value="Newest Graduates">Sort: Newest</option>
            <option className="bg-[#0a110e] text-white" value="Highest GPA">Highest GPA</option>
            <option className="bg-[#0a110e] text-white" value="Highest SAT">Highest SAT</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400 pointer-events-none" />
        </div>
      </div>

      {/* Results Grid Display */}
      {filteredAlumni.length === 0 ? (
        <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
          <p className="text-white/50">No verified alumni found matching your filter constraints.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredAlumni.map((profile, index) => (
            <ProfileCard key={profile.userId} profile={profile} index={index} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

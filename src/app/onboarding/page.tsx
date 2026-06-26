"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Image as ImageIcon, CheckCircle2, BookOpen, GraduationCap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { submitOnboardingData } from "./actions";

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "ALUMNUS">("STUDENT");
  const [isMentoring, setIsMentoring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    major: "",
    gradYear: "",
    financialAidStatus: "",
    gpa: "",
    satScore: "",
    ieltsScore: "",
    extracurriculars: "",
    awards: "",
    linkedin: "",
    telegram: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Autocomplete State
  const [universityQuery, setUniversityQuery] = useState("");
  const [universityResults, setUniversityResults] = useState<string[]>([]);
  const [isSearchingUni, setIsSearchingUni] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Hipo Labs API Integration
  useEffect(() => {
    if (!universityQuery.trim()) {
      setUniversityResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      setIsSearchingUni(true);
      try {
        const res = await fetch(`http://universities.hipolabs.com/search?name=${encodeURIComponent(universityQuery)}`);
        if (res.ok) {
          const data = await res.json();
          // Filter duplicates
          const uniqueNames = Array.from(new Set(data.map((uni: any) => uni.name))) as string[];
          setUniversityResults(uniqueNames.slice(0, 10)); // Limit to top 10 matches
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Failed to fetch universities", error);
      } finally {
        setIsSearchingUni(false);
      }
    }, 300);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [universityQuery]);

  const selectUniversity = (name: string) => {
    setUniversityQuery(name);
    setShowDropdown(false);
  };

  // Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...formData,
      role,
      isMentoring,
      universityName: universityQuery, // Add the selected university
    };

    const res = await submitOnboardingData(payload);

    if (res.success) {
      router.push("/feed");
      router.refresh();
    } else {
      console.error(res.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1915] text-slate-100 flex justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-3">Complete Your Profile</h1>
          <p className="text-slate-400">Join the premium network of Shoqan Alumni and unlock exclusive opportunities.</p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          
          {/* SECTION 1: IDENTITY */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-sm">1</span>
              Identity & Role
            </h2>

            {/* Role Selector */}
            <div className="flex p-1 bg-black/40 border border-white/10 rounded-xl mb-8">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  role === "STUDENT"
                    ? "bg-[#1a2c24] text-emerald-400 shadow-sm border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Current Student
              </button>
              <button
                type="button"
                onClick={() => setRole("ALUMNUS")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  role === "ALUMNUS"
                    ? "bg-[#1a2c24] text-emerald-400 shadow-sm border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <GraduationCap className="w-5 h-5" />
                Alumnus
              </button>
            </div>

            {/* Banner Placeholder */}
            <div className="relative h-32 sm:h-48 rounded-xl bg-[#14221c] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500/30 hover:bg-[#1a2c24] transition-colors cursor-pointer group mb-16 overflow-visible">
              <ImageIcon className="w-8 h-8 mb-2 group-hover:text-emerald-400 transition-colors" />
              <span className="text-sm font-medium">Upload Cover Photo</span>
              
              {/* Avatar Placeholder */}
              <div className="absolute -bottom-10 left-6 sm:left-10">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#0f1915] border-4 border-[#0f1915] flex items-center justify-center relative group/avatar cursor-pointer">
                  <div className="absolute inset-0 rounded-full bg-[#1a2c24] border-2 border-dashed border-white/20 flex flex-col items-center justify-center hover:border-emerald-500/50 transition-colors">
                    <Camera className="w-6 h-6 text-slate-400 group-hover/avatar:text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Ivan"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Ivanov"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-300">Short Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us a little about yourself and your aspirations..."
                  rows={3}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: ACADEMICS */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-sm">2</span>
              Academic Background
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Autocomplete University Field */}
              <div className="space-y-2 relative sm:col-span-2">
                <label className="text-sm font-medium text-slate-300">
                  {role === "STUDENT" ? "Target/Current University" : "Current/Graduated University"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={universityQuery}
                    onChange={(e) => {
                      setUniversityQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => {
                      if (universityResults.length > 0) setShowDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // delay hiding to allow clicks
                    placeholder="e.g. Harvard University"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  />
                  {isSearchingUni && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-spin" />
                  )}
                </div>

                {/* Dropdown */}
                {showDropdown && universityResults.length > 0 && (
                  <ul className="absolute z-20 w-full mt-2 bg-[#1a2c24] border border-emerald-500/30 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {universityResults.map((uni, idx) => (
                      <li
                        key={idx}
                        onClick={() => selectUniversity(uni)}
                        className="px-4 py-3 hover:bg-emerald-500/20 cursor-pointer text-sm text-slate-300 transition-colors border-b border-white/5 last:border-0"
                      >
                        {uni}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">{role === "STUDENT" ? "Intended Major" : "Major"}</label>
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">{role === "STUDENT" ? "Expected Graduation" : "Graduation Year"}</label>
                <input
                  type="text"
                  name="gradYear"
                  value={formData.gradYear}
                  onChange={handleChange}
                  placeholder="e.g. 2024"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              {role === "ALUMNUS" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Financial Aid Status</label>
                  <select
                    name="financialAidStatus"
                    value={formData.financialAidStatus}
                    onChange={handleChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                  >
                    <option value="">Select status</option>
                    <option value="FULL_RIDE">Full Ride</option>
                    <option value="PARTIAL">Partial Scholarship</option>
                    <option value="SELF_FUNDED">Self Funded</option>
                  </select>
                </div>
              )}

              {/* Universal Academic Inputs */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">GPA</label>
                <select
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                >
                  <option value="">Select GPA range</option>
                  <option value="4.0">4.0</option>
                  <option value="3.5-3.9">3.5 - 3.9</option>
                  <option value="3.0-3.4">3.0 - 3.4</option>
                  <option value="<3.0">Below 3.0</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">SAT Score</label>
                <input
                  type="number"
                  name="satScore"
                  value={formData.satScore}
                  onChange={handleChange}
                  placeholder="e.g. 1550"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">IELTS Score</label>
                <input
                  type="number"
                  step="0.5"
                  name="ieltsScore"
                  value={formData.ieltsScore}
                  onChange={handleChange}
                  placeholder="e.g. 8.0"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              {/* Alumnus Only: Mentoring Switch */}
              {role === "ALUMNUS" && (
                <div className="sm:col-span-2 pt-4 flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <div>
                    <h4 className="text-emerald-400 font-medium">Open to Mentoring</h4>
                    <p className="text-sm text-slate-400">Help guide the next generation of students.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMentoring(!isMentoring)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      isMentoring ? "bg-emerald-500" : "bg-slate-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isMentoring ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: EXPERIENCE & NETWORK */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-sm">3</span>
              Experience & Network
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-300">Extracurriculars</label>
                <input
                  type="text"
                  name="extracurriculars"
                  value={formData.extracurriculars}
                  onChange={handleChange}
                  placeholder="e.g. Debate Club, Varsity Soccer, Volunteering (comma separated)"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-300">Awards & Honors</label>
                <input
                  type="text"
                  name="awards"
                  value={formData.awards}
                  onChange={handleChange}
                  placeholder="e.g. National Math Olympiad Gold, Dean's List (comma separated)"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Telegram Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">@</span>
                  <input
                    type="text"
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleChange}
                    placeholder="username"
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="sticky bottom-4 pt-4 pb-2 z-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  Complete Profile
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

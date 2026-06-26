"use client";

import React, { useState } from "react";
import { Camera, Image as ImageIcon, CheckCircle2, ChevronRight, BookOpen, GraduationCap } from "lucide-react";

export default function OnboardingPage() {
  const [role, setRole] = useState<"STUDENT" | "ALUMNUS">("STUDENT");
  const [isMentoring, setIsMentoring] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f1915] text-slate-100 flex justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-3">Complete Your Profile</h1>
          <p className="text-slate-400">Join the premium network of Shoqan Alumni and unlock exclusive opportunities.</p>
        </div>

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          
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
                  placeholder="Shoqan"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Last Name</label>
                <input
                  type="text"
                  placeholder="Valikhanov"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-300">Short Bio</label>
                <textarea
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
              {role === "STUDENT" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Target Universities</label>
                    <input
                      type="text"
                      placeholder="e.g. MIT, Stanford, NUS"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Intended Major</label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Expected Graduation</label>
                    <input
                      type="text"
                      placeholder="e.g. 2028"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Current/Graduated University</label>
                    <input
                      type="text"
                      placeholder="e.g. Harvard University"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Major</label>
                    <input
                      type="text"
                      placeholder="e.g. Economics"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Graduation Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2024"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Financial Aid Status</label>
                    <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none">
                      <option value="">Select status</option>
                      <option value="FULL_RIDE">Full Ride</option>
                      <option value="PARTIAL">Partial Scholarship</option>
                      <option value="SELF_FUNDED">Self Funded</option>
                    </select>
                  </div>
                </>
              )}

              {/* Universal Academic Inputs */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Country of Studying</label>
                <input
                  type="text"
                  placeholder="e.g. USA, UK, Singapore"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">GPA</label>
                <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none">
                  <option value="">Select GPA range</option>
                  <option value="4.0">4.0</option>
                  <option value="3.5-3.9">3.5 - 3.9</option>
                  <option value="3.0-3.4">3.0 - 3.4</option>
                  <option value="<3.0">Below 3.0</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Language Proficiency</label>
                <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none">
                  <option value="">Select English Level</option>
                  <option value="NATIVE">Native / Bilingual</option>
                  <option value="C2">C2 (Proficient)</option>
                  <option value="C1">C1 (Advanced)</option>
                  <option value="B2">B2 (Upper Intermediate)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Standardized Tests (SAT/IELTS)</label>
                <input
                  type="text"
                  placeholder="e.g. SAT: 1550, IELTS: 8.0"
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
                  placeholder="e.g. Debate Club, Varsity Soccer, Volunteering (comma separated)"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-300">Awards & Honors</label>
                <input
                  type="text"
                  placeholder="e.g. National Math Olympiad Gold, Dean's List (comma separated)"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">LinkedIn URL</label>
                <input
                  type="url"
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
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
            >
              Complete Profile
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

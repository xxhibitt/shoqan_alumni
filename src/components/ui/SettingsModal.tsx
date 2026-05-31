"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Shield, Palette, CheckCircle2, AlertTriangle, LogOut, Briefcase, Upload, GraduationCap } from "lucide-react";
import { useDashboard } from "@/components/providers/DashboardProvider";
import { ImageCropper } from "@/components/ui/ImageCropper";
import { signOut } from "next-auth/react";

export function SettingsModal() {
  const { isSettingsOpen, closeSettings, activeSettingsTab, setActiveSettingsTab, showToast } = useDashboard();

  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("");
  const [university, setUniversity] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRoleContext, setUserRoleContext] = useState("STUDENT");
  const [isSaving, setIsSaving] = useState(false);

  const [tgToken, setTgToken] = useState<string | null>(null);
  const [isGeneratingTgToken, setIsGeneratingTgToken] = useState(false);

  // Crop State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [cropAspect, setCropAspect] = useState(1);
  const [cropTarget, setCropTarget] = useState<"avatar" | "banner" | null>(null);

  const [activities, setActivities] = useState("");
  const [awards, setAwards] = useState("");
  const [offers, setOffers] = useState("");
  const [isMentoring, setIsMentoring] = useState(false);
  const [satScore, setSatScore] = useState("");
  const [ieltsScore, setIeltsScore] = useState("");

  const fileInputRefAvatar = React.useRef<HTMLInputElement>(null);
  const fileInputRefBanner = React.useRef<HTMLInputElement>(null);

  // Fetch profile when modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      const fetchProfile = async () => {
        try {
          const res = await fetch("/api/profile/me");
          if (res.ok) {
            const data = await res.json();
            const { user } = data;
            if (user) {
              setUserEmail(user.email || "");
              setUserRoleContext(user.role || "STUDENT");
              if (user.profile) {
                setDisplayName(`${user.profile.firstName} ${user.profile.lastName}`);
                setAvatarUrl(user.profile.avatarUrl || "");
                setBannerUrl(user.profile.bannerUrl || "");
                setUniversity(user.profile.university?.name || "");
                setRole(user.profile.alumniData?.jobTitle || user.profile.academicData?.intendedMajor || "");
                setActivities(user.profile.tags?.map((t: any) => t.name).join(", ") || "");
                setAwards(user.profile.awards?.join(", ") || "");
                setOffers(user.profile.offers?.join(", ") || "");
                setSatScore(user.profile.academicData?.satScore?.toString() || "");
                setIeltsScore(user.profile.academicData?.ieltsScore?.toString() || "");
                setIsMentoring(user.profile.alumniData?.isMentoring || false);
                setBio(user.profile.bio || "");
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch profile", error);
        }
      };
      fetchProfile();
    }
  }, [isSettingsOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    const names = displayName.split(" ");
    const firstName = names[0] || "Unknown";
    const lastName = names.slice(1).join(" ") || "";

    try {
      const res = await fetch("/api/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          avatarUrl,
          bannerUrl,
          university,
          major: role, // Saving 'role' as major
          satScore: satScore ? parseInt(satScore) : null,
          ieltsScore: ieltsScore ? parseFloat(ieltsScore) : null,
          activities: activities.split(",").map(a => a.trim()).filter(Boolean),
          awards: awards.split(",").map(a => a.trim()).filter(Boolean),
          offers: offers.split(",").map(a => a.trim()).filter(Boolean),
          bio,
          isMentoring
        }),
      });
      if (res.ok) {
        showToast("Profile updated successfully!");
        closeSettings();
      }
    } catch (error) {
      console.error("Failed to save profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLinkTelegram = async () => {
    // 1. Open blank window synchronously to bypass popup blockers
    const newWindow = window.open('about:blank', '_blank');
    setIsGeneratingTgToken(true);
    try {
      const res = await fetch("/api/telegram/generate-token", { method: "POST" });
      const data = await res.json();
      if (data.token) {
        // 2. Safely redirect the already opened tab
        if (newWindow) newWindow.location.href = `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?start=${data.token}`;
      } else {
        if (newWindow) newWindow.close();
      }
    } catch (e) {
      console.error("Failed to generate token", e);
      if (newWindow) newWindow.close();
    } finally {
      setIsGeneratingTgToken(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: "avatar" | "banner") => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.toLowerCase().endsWith(".heic")) {
        showToast("HEIC format is not supported. Please upload a JPG or PNG.");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCropImageSrc(reader.result?.toString() || "");
        setCropTarget(target);
        setCropAspect(target === "avatar" ? 1 : 3);
        setCropModalOpen(true);
      });
      reader.readAsDataURL(file);
      // reset input
      e.target.value = "";
    }
  };

  const handleCropDone = async (croppedBlob: Blob) => {
    setCropModalOpen(false);
    
    // Upload the blob immediately
    const formData = new FormData();
    formData.append("file", croppedBlob, `${cropTarget}.jpg`);
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (cropTarget === "avatar") {
          setAvatarUrl(data.url);
          // Auto-save just the avatar to persist
          fetch("/api/profile/me", { method: "PUT", body: JSON.stringify({ avatarUrl: data.url }) });
        }
        if (cropTarget === "banner") {
          setBannerUrl(data.url);
          // Auto-save just the banner to persist
          fetch("/api/profile/me", { method: "PUT", body: JSON.stringify({ bannerUrl: data.url }) });
        }
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSettings();
    };
    if (isSettingsOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen, closeSettings]);

  const tabs = [
    { id: "account", label: "My Account", icon: Shield },
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];


  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <div key="settings-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeSettings}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            className="relative flex h-[85vh] w-[90vw] max-w-[1100px] overflow-hidden rounded-2xl bg-[#0f1915] shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Sidebar */}
            <div className="w-64 bg-[#0a110e] border-r border-white/5 flex flex-col shrink-0">
              <div className="p-6 pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">User Settings</h2>
                <nav className="flex flex-col gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSettingsTab(tab.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeSettingsTab === tab.id
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="mt-auto p-4 border-t border-white/5">
                <button 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            </div>

            {/* Modal Content Pane */}
            <div className="flex-1 flex flex-col relative bg-[#0f1915] overflow-y-auto">
              {/* Close Button */}
              <div className="absolute right-6 top-6 z-10">
                <button
                  onClick={closeSettings}
                  className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors bg-black/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-10 max-w-4xl mx-auto w-full">
                {activeSettingsTab === "profile" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* Left Column: Form Fields */}
                      <div className="space-y-6">
                        {/* Avatar & Banner URLs */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                            Avatar
                          </label>
                          <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" ref={fileInputRefAvatar} className="hidden" onChange={(e) => handleFileChange(e, "avatar")} />
                          <div className="flex items-center gap-3">
                            <button onClick={() => fileInputRefAvatar.current?.click()} className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white hover:bg-white/5 transition flex items-center gap-2">
                              <Upload className="h-4 w-4" /> Upload Avatar
                            </button>
                            {avatarUrl && <span className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Uploaded</span>}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                            Banner
                          </label>
                          <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" ref={fileInputRefBanner} className="hidden" onChange={(e) => handleFileChange(e, "banner")} />
                          <div className="flex items-center gap-3">
                            <button onClick={() => fileInputRefBanner.current?.click()} className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white hover:bg-white/5 transition flex items-center gap-2">
                              <Upload className="h-4 w-4" /> Upload Banner
                            </button>
                            {bannerUrl && <span className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Uploaded</span>}
                          </div>
                        </div>

                        {/* Name Section */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                            Display Name
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                          </div>
                        </div>

                        {/* Bio Section */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                            About Me / Bio
                          </label>
                          <textarea
                            rows={3}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="A short bio about yourself..."
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                          />
                        </div>

                        {/* Title / Role Section */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                            {userRoleContext === "ALUMNI" ? "Job Title" : "Intended Major"}
                          </label>
                          <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          />
                        </div>

                        {/* University */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                            {userRoleContext === "ALUMNI" ? "Attended University" : "Target University"}
                          </label>
                          <input
                            type="text"
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                            placeholder="e.g. Nazarbayev University"
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          />
                        </div>

                        {/* Extracurriculars */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                            Extracurriculars / Tags (comma separated)
                          </label>
                          <input
                            type="text"
                            value={activities}
                            onChange={(e) => setActivities(e.target.value)}
                            placeholder="e.g. Model UN, Debate Club, Tech Team"
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          />
                        </div>

                        {/* Academic Achievements */}
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                              National/International Awards (comma separated)
                            </label>
                            <input
                              type="text"
                              value={awards}
                              onChange={(e) => setAwards(e.target.value)}
                              placeholder="e.g. IMO Gold, Google HashCode Finalist"
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                          </div>
                          {userRoleContext === "ALUMNI" && (
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                                University Offers (comma separated)
                              </label>
                              <input
                                type="text"
                                value={offers}
                                onChange={(e) => setOffers(e.target.value)}
                                placeholder="e.g. MIT, Stanford, NUS"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                              />
                            </div>
                          )}
                        </div>

                        {/* Scores */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                              SAT Score
                            </label>
                            <input
                              type="number"
                              value={satScore}
                              onChange={(e) => setSatScore(e.target.value)}
                              placeholder="e.g. 1500"
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                              IELTS Score
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              value={ieltsScore}
                              onChange={(e) => setIeltsScore(e.target.value)}
                              placeholder="e.g. 7.5"
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={handleSave}
                          disabled={isSaving}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
                        >
                          {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>

                      {/* Right Column: Live Preview */}
                      <div className="flex flex-col">
                        <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-4">
                          Live Preview
                        </label>
                        <div className="w-full rounded-2xl border border-white/10 bg-[#0a110e] overflow-hidden sticky top-0 shadow-2xl">
                          {/* Banner Area */}
                          <div className="h-32 w-full relative bg-gradient-to-tr from-emerald-900/40 to-[#0a110e]">
                            {bannerUrl ? (
                              <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 bg-white/5" /> /* Fallback */
                            )}
                          </div>

                          {/* Profile Details Area */}
                          <div className="px-6 pb-6 relative">
                            {/* Avatar */}
                            <div className="absolute -top-10 left-6 h-20 w-20 rounded-full border-4 border-[#0a110e] bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 flex items-center justify-center overflow-hidden">
                              {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-2xl font-bold text-emerald-500">
                                  {displayName ? displayName[0] : "A"}
                                </span>
                              )}
                            </div>

                            {/* Info */}
                            <div className="pt-12">
                              {isMentoring && userRoleContext === "ALUMNI" && (
                                <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3">
                                  Open to Mentoring
                                </span>
                              )}
                              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                {displayName || "Your Name"}
                              </h3>
                              <p className="text-sm text-white/60 mb-3 flex items-center gap-1.5 mt-1">
                                <Briefcase className="h-3.5 w-3.5" />
                                {role || "Your Role"}
                              </p>
                              {university && (
                                <p className="text-sm text-white/60 mb-3 flex items-center gap-1.5 mt-1">
                                  <GraduationCap className="h-3.5 w-3.5" />
                                  {university}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-4">
                                {activities.split(",").filter(a => a.trim()).slice(0, 3).map((act, i) => (
                                  <span key={i} className="px-2 py-1 bg-white/5 rounded-md text-xs font-medium text-white/60">#{act.trim()}</span>
                                ))}
                                {activities.split(",").filter(a => a.trim()).length === 0 && (
                                  <>
                                    <span className="px-2 py-1 bg-white/5 rounded-md text-xs font-medium text-white/60">#Mentorship</span>
                                    <span className="px-2 py-1 bg-white/5 rounded-md text-xs font-medium text-white/60">#Tech</span>
                                  </>
                                )}
                              </div>
                              {(satScore || ieltsScore) && (
                                <div className="mt-4 pt-4 border-t border-white/10 flex gap-4">
                                  {satScore && (
                                    <div className="flex flex-col">
                                      <span className="text-[10px] uppercase text-emerald-500 font-bold tracking-wider">SAT</span>
                                      <span className="text-sm font-bold text-white">{satScore}</span>
                                    </div>
                                  )}
                                  {ieltsScore && (
                                    <div className="flex flex-col">
                                      <span className="text-[10px] uppercase text-emerald-500 font-bold tracking-wider">IELTS</span>
                                      <span className="text-sm font-bold text-white">{ieltsScore}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {userRoleContext === "ALUMNI" && (
                          <div>
                            <label className="flex items-center gap-3 p-4 border border-white/10 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors mt-6">
                              <input type="checkbox" checked={isMentoring} onChange={(e) => setIsMentoring(e.target.checked)} className="h-5 w-5 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0" />
                              <div>
                                <p className="text-sm font-bold text-white">Open to Mentoring</p>
                                <p className="text-xs text-white/50">Allow students to reach out to you for guidance</p>
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSettingsTab === "account" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-6">My Account</h2>
                    <div className="space-y-6 max-w-xl">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={userEmail}
                          disabled
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white/50 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <button className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition-colors border border-white/5">
                          Change Password
                        </button>
                      </div>

                      <div className="pt-8 mt-8 border-t border-white/10">
                        <h3 className="text-lg font-bold text-white mb-2">Notifications & Security</h3>
                        <p className="text-sm text-white/50 mb-4">Link your Telegram account to receive instant notifications for connection requests and OTPs.</p>
                        
                        {tgToken ? (
                          <a
                            href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?start=${tgToken}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold rounded-lg transition-colors shadow-lg shadow-[#0088cc]/25"
                          >
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                            Open Telegram to Link
                          </a>
                        ) : (
                          <button 
                            onClick={handleLinkTelegram}
                            disabled={isGeneratingTgToken}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 text-[#0088cc] font-medium rounded-lg transition-colors disabled:opacity-50"
                          >
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                            {isGeneratingTgToken ? "Generating Link..." : "Link Telegram"}
                          </button>
                        )}
                      </div>

                      <div className="pt-8 mt-8 border-t border-white/10">
                        <h3 className="text-lg font-bold text-white mb-2">Danger Zone</h3>
                        <p className="text-sm text-white/50 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                        <button className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium rounded-lg transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSettingsTab === "appearance" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-6">Appearance</h2>
                    <div className="space-y-6 max-w-xl">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-4">
                          Theme
                        </label>
                        <div className="flex gap-4">
                          <button className="flex-1 p-4 rounded-xl border-2 border-emerald-500 bg-[#0a110e] text-left relative overflow-hidden">
                            <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                              <CheckCircle2 className="h-3 w-3 text-[#0a110e]" />
                            </div>
                            <span className="font-semibold text-white block mt-8">Dark Mode</span>
                            <span className="text-xs text-white/50">Strictly enforced for premium feel</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {cropModalOpen && cropImageSrc && (
        <div key="crop-modal">
          <ImageCropper
            imageSrc={cropImageSrc}
            aspectRatio={cropAspect}
            onCropDone={handleCropDone}
            onCancel={() => setCropModalOpen(false)}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

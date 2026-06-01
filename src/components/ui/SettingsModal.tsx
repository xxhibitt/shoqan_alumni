"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Shield, Palette, CheckCircle2, AlertTriangle, LogOut, Briefcase, Upload, GraduationCap } from "lucide-react";
import { useDashboard } from "@/components/providers/DashboardProvider";
import { ImageCropper } from "@/components/ui/ImageCropper";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

export function SettingsModal() {
  const { isSettingsOpen, closeSettings, activeSettingsTab, setActiveSettingsTab, showToast } = useDashboard();
  const { theme, setTheme } = useTheme();

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
          major: role,
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
    const newWindow = window.open('about:blank', '_blank');
    setIsGeneratingTgToken(true);
    try {
      const res = await fetch("/api/telegram/generate-token", { method: "POST" });
      const data = await res.json();
      if (data.token) {
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
      e.target.value = "";
    }
  };

  const handleCropDone = async (croppedBlob: Blob) => {
    setCropModalOpen(false);
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
          fetch("/api/profile/me", { method: "PUT", body: JSON.stringify({ avatarUrl: data.url }) });
        }
        if (cropTarget === "banner") {
          setBannerUrl(data.url);
          fetch("/api/profile/me", { method: "PUT", body: JSON.stringify({ bannerUrl: data.url }) });
        }
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

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

  const renderSidebar = () => (
    <div className="w-full md:w-64 bg-gray-50 dark:bg-[#0a110e] border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/5 flex flex-col shrink-0">
      <div className="p-4 md:p-6 pb-2">
        <h2 className="hidden md:block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/40 mb-2">User Settings</h2>
        <nav className="flex flex-row md:flex-col gap-2 md:gap-1 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSettingsTab(tab.id)}
              className={`flex items-center gap-2 md:gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeSettingsTab === tab.id
                  ? "bg-gray-200 dark:bg-white/10 text-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="hidden md:block mt-auto p-4 border-t border-gray-200 dark:border-white/5">
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 hover:text-red-600 dark:hover:text-red-300 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
      <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6">Profile Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60 mb-2">Avatar</label>
            <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" ref={fileInputRefAvatar} className="hidden" onChange={(e) => handleFileChange(e, "avatar")} />
            <div className="flex items-center gap-3">
              <button onClick={() => fileInputRefAvatar.current?.click()} className="px-4 py-2 bg-slate-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition flex items-center gap-2 text-sm md:text-base">
                <Upload className="h-4 w-4" /> Upload Avatar
              </button>
              {avatarUrl && <span className="text-xs text-emerald-600 dark:text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Uploaded</span>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60 mb-2">Banner</label>
            <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" ref={fileInputRefBanner} className="hidden" onChange={(e) => handleFileChange(e, "banner")} />
            <div className="flex items-center gap-3">
              <button onClick={() => fileInputRefBanner.current?.click()} className="px-4 py-2 bg-slate-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition flex items-center gap-2 text-sm md:text-base">
                <Upload className="h-4 w-4" /> Upload Banner
              </button>
              {bannerUrl && <span className="text-xs text-emerald-600 dark:text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Uploaded</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60 mb-2">Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-slate-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60 mb-2">About Me / Bio</label>
            <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short bio about yourself..." className="w-full bg-slate-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60 mb-2">{userRoleContext === "ALUMNI" ? "Job Title" : "Intended Major"}</label>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-slate-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60 mb-2">{userRoleContext === "ALUMNI" ? "Attended University" : "Target University"}</label>
            <input type="text" value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="e.g. Nazarbayev University" className="w-full bg-slate-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60 mb-2">Extracurriculars / Tags (comma separated)</label>
            <input type="text" value={activities} onChange={(e) => setActivities(e.target.value)} placeholder="e.g. Model UN, Debate Club, Tech Team" className="w-full bg-slate-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60 mb-2">National/International Awards (comma separated)</label>
              <input type="text" value={awards} onChange={(e) => setAwards(e.target.value)} placeholder="e.g. IMO Gold, Google HashCode Finalist" className="w-full bg-slate-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
            </div>
            {userRoleContext === "ALUMNI" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60 mb-2">University Offers (comma separated)</label>
                <input type="text" value={offers} onChange={(e) => setOffers(e.target.value)} placeholder="e.g. MIT, Stanford, NUS" className="w-full bg-slate-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60 mb-2">SAT Score</label>
              <input type="number" value={satScore} onChange={(e) => setSatScore(e.target.value)} placeholder="e.g. 1500" className="w-full bg-slate-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60 mb-2">IELTS Score</label>
              <input type="number" step="0.5" value={ieltsScore} onChange={(e) => setIeltsScore(e.target.value)} placeholder="e.g. 7.5" className="w-full bg-slate-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
            </div>
          </div>

          <button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors shadow-lg shadow-emerald-900/20">
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="flex flex-col pt-6 lg:pt-0">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60 mb-4">Live Preview</label>
          <div className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0a110e] overflow-hidden sticky top-0 shadow-xl dark:shadow-2xl">
            <div className="h-24 md:h-32 w-full relative bg-gradient-to-tr from-emerald-100 dark:from-emerald-900/40 to-gray-50 dark:to-[#0a110e]">
              {bannerUrl ? <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" /> : <div className="absolute inset-0 bg-black/5 dark:bg-white/5" />}
            </div>
            <div className="px-6 pb-6 relative">
              <div className="absolute -top-8 md:-top-10 left-6 h-16 w-16 md:h-20 md:w-20 rounded-full border-4 border-white dark:border-[#0a110e] bg-gradient-to-tr from-emerald-100 dark:from-emerald-500/20 to-blue-100 dark:to-blue-500/20 flex items-center justify-center overflow-hidden">
                {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-500">{displayName ? displayName[0] : "A"}</span>}
              </div>
              <div className="pt-10 md:pt-12">
                {isMentoring && userRoleContext === "ALUMNI" && (
                  <span className="inline-block px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3">Open to Mentoring</span>
                )}
                <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg flex items-center gap-2">{displayName || "Your Name"}</h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-white/60 mb-3 flex items-center gap-1.5 mt-1"><Briefcase className="h-3.5 w-3.5" /> {role || "Your Role"}</p>
                {university && <p className="text-xs md:text-sm text-slate-600 dark:text-white/60 mb-3 flex items-center gap-1.5 mt-1"><GraduationCap className="h-3.5 w-3.5" /> {university}</p>}
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {activities.split(",").filter(a => a.trim()).slice(0, 3).map((act, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-200 dark:bg-white/5 rounded-md text-[10px] md:text-xs font-medium text-slate-700 dark:text-white/60">#{act.trim()}</span>
                  ))}
                </div>
                {(satScore || ieltsScore) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 flex gap-4">
                    {satScore && <div className="flex flex-col"><span className="text-[10px] uppercase text-emerald-600 dark:text-emerald-500 font-bold tracking-wider">SAT</span><span className="text-sm font-bold text-slate-900 dark:text-white">{satScore}</span></div>}
                    {ieltsScore && <div className="flex flex-col"><span className="text-[10px] uppercase text-emerald-600 dark:text-emerald-500 font-bold tracking-wider">IELTS</span><span className="text-sm font-bold text-slate-900 dark:text-white">{ieltsScore}</span></div>}
                  </div>
                )}
              </div>
            </div>
          </div>
          {userRoleContext === "ALUMNI" && (
            <div>
              <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors mt-6">
                <input type="checkbox" checked={isMentoring} onChange={(e) => setIsMentoring(e.target.checked)} className="h-5 w-5 rounded border-gray-300 dark:border-white/20 bg-white dark:bg-black/40 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Open to Mentoring</p>
                  <p className="text-xs text-slate-600 dark:text-white/50">Allow students to reach out to you for guidance</p>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderAccountTab = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
      <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6">My Account</h2>
      <div className="space-y-6 max-w-xl">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white/60 mb-2">Email Address</label>
          <input type="email" value={userEmail} disabled className="w-full bg-slate-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-500 dark:text-white/50 cursor-not-allowed" />
        </div>
        <div className="pt-8 mt-8 border-t border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Notifications & Security</h3>
          <p className="text-sm text-slate-600 dark:text-white/50 mb-4">Link your Telegram account to receive instant notifications for connection requests and OTPs.</p>
          {tgToken ? (
            <a href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?start=${tgToken}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold rounded-lg transition-colors shadow-lg shadow-[#0088cc]/25 w-full md:w-auto">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
              Open Telegram to Link
            </a>
          ) : (
            <button onClick={handleLinkTelegram} disabled={isGeneratingTgToken} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 text-[#0088cc] font-medium rounded-lg transition-colors disabled:opacity-50 w-full md:w-auto">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
              {isGeneratingTgToken ? "Generating Link..." : "Link Telegram"}
            </button>
          )}
        </div>
        <div className="pt-8 mt-8 border-t border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Danger Zone</h3>
          <p className="text-sm text-slate-600 dark:text-white/50 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="px-5 py-2.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 font-medium rounded-lg transition-colors w-full md:w-auto">
            Delete Account
          </button>
        </div>
        
        <div className="md:hidden pt-8 mt-8 border-t border-gray-200 dark:border-white/10">
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center gap-3 px-3 py-2 w-full rounded-md font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderAppearanceTab = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
      <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-foreground mb-6">Appearance</h2>
      <div className="space-y-6 max-w-xl">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-muted mb-4">Theme</label>
          <div className="flex gap-4 flex-col sm:flex-row">
            <button 
              onClick={() => setTheme("dark")}
              className={`flex-1 p-4 rounded-xl border-2 text-left relative overflow-hidden transition-all duration-200 ${
                theme === 'dark' 
                  ? 'border-emerald-500 bg-white dark:bg-card shadow-lg shadow-emerald-500/10' 
                  : 'border-gray-200 dark:border-card-border bg-gray-50 dark:bg-card hover:border-emerald-500/50'
              }`}
            >
              {theme === 'dark' && (
                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}
              <div className="h-12 w-full rounded-md bg-[#0f1915] border border-white/10 mb-4 flex items-center p-2 gap-2 shadow-sm">
                 <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
                 <div className="h-2 w-12 bg-white/20 rounded-full"></div>
              </div>
              <span className={`font-bold block text-sm md:text-base ${theme === 'dark' ? 'text-slate-900 dark:text-foreground' : 'text-slate-600 dark:text-foreground/70'}`}>Dark Mode</span>
              <span className="text-[10px] md:text-xs text-slate-500 dark:text-muted block mt-1">Sleek and easy on the eyes</span>
            </button>
            
            <button 
              onClick={() => setTheme("light")}
              className={`flex-1 p-4 rounded-xl border-2 text-left relative overflow-hidden transition-all duration-200 ${
                theme === 'light' 
                  ? 'border-emerald-500 bg-white dark:bg-card shadow-lg shadow-emerald-500/10' 
                  : 'border-gray-200 dark:border-card-border bg-gray-50 dark:bg-card hover:border-emerald-500/50'
              }`}
            >
              {theme === 'light' && (
                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}
              <div className="h-12 w-full rounded-md bg-[#f8faf9] border border-black/10 mb-4 flex items-center p-2 gap-2 shadow-sm">
                 <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
                 <div className="h-2 w-12 bg-black/20 rounded-full"></div>
              </div>
              <span className={`font-bold block text-sm md:text-base ${theme === 'light' ? 'text-slate-900 dark:text-foreground' : 'text-slate-600 dark:text-foreground/70'}`}>Light Mode</span>
              <span className="text-[10px] md:text-xs text-slate-500 dark:text-muted block mt-1">Clean and professional</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <div key="settings-modal" className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 pb-0 md:pb-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={closeSettings}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            className="relative flex flex-col md:flex-row h-[90vh] md:h-[85vh] w-full md:w-[90vw] max-w-[1100px] overflow-hidden rounded-t-3xl md:rounded-2xl bg-white dark:bg-[#0f1915] shadow-2xl border-t md:border border-gray-200 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebar()}
            
            {/* Modal Content Pane */}
            <div className="flex-1 flex flex-col relative bg-white dark:bg-[#0f1915] overflow-y-auto w-full">
              {/* Close Button */}
              <div className="absolute right-4 md:right-6 top-4 md:top-6 z-10">
                <button
                  onClick={closeSettings}
                  className="p-2 rounded-full text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors bg-gray-100 dark:bg-black/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
                {activeSettingsTab === "profile" && renderProfileTab()}
                {activeSettingsTab === "account" && renderAccountTab()}
                {activeSettingsTab === "appearance" && renderAppearanceTab()}
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

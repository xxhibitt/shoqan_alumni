"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bookmark, GraduationCap, MapPin, Briefcase, Star, Link as LinkIcon, Edit3, UserPlus, Check, Clock } from "lucide-react";
import { useDashboard } from "@/components/providers/DashboardProvider";
import { AvatarImage, BannerImage } from "@/components/ui/FeedGrid";

export function PublicProfileModal() {
  const { selectedProfile, setSelectedProfile, showToast } = useDashboard();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoadingSaveStatus, setIsLoadingSaveStatus] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isGeneratingTgToken, setIsGeneratingTgToken] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch("/api/profile/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.role === "ADMIN") setIsAdmin(true);
        }
      } catch (e) {
        console.error("Failed to fetch role", e);
      }
    };

    const fetchConnectionStatus = async () => {
      if (!selectedProfile) return;
      setIsLoadingStatus(true);
      setConnectionStatus(null);
      try {
        const res = await fetch(`/api/connections/status?receiverId=${selectedProfile.userId}`);
        if (res.ok) {
          const data = await res.json();
          setConnectionStatus(data.status);
        }
      } catch (e) {
        console.error("Failed to fetch connection status", e);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    const fetchSaveStatus = async () => {
      if (!selectedProfile) return;
      setIsLoadingSaveStatus(true);
      try {
        const res = await fetch(`/api/save/status?targetId=${selectedProfile.id}`);
        if (res.ok) {
          const data = await res.json();
          setIsBookmarked(data.isSaved);
        }
      } catch (e) {
        console.error("Failed to fetch save status", e);
      } finally {
        setIsLoadingSaveStatus(false);
      }
    };

    checkRole();
    if (selectedProfile) {
      fetchConnectionStatus();
      fetchSaveStatus();
    }
  }, [selectedProfile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedProfile(null);
    };
    if (selectedProfile) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedProfile, setSelectedProfile]);

  const handleSave = async () => {
    if (!selectedProfile) return;
    try {
      setIsBookmarked(!isBookmarked);
      const res = await fetch("/api/save/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: selectedProfile.id })
      });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.saved);
      } else {
        setIsBookmarked(!isBookmarked);
      }
    } catch (e) {
      console.error(e);
      setIsBookmarked(!isBookmarked);
    }
  };

  const handleEdit = () => {
    console.log("Admin Edit triggered for: ", selectedProfile?.id);
  };

  const handleConnect = async () => {
    if (!selectedProfile) return;
    setIsConnecting(true);
    try {
      const res = await fetch("/api/connections/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: selectedProfile.userId })
      });
      if (res.ok) {
        setConnectionStatus("PENDING");
        showToast("Request sent!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!selectedProfile) return null;

  const jobOrMajor = selectedProfile.alumniData?.jobTitle || selectedProfile.academicData?.intendedMajor || "Alumnus";
  const uniName = selectedProfile.university?.name || "University";
  const uniCountry = selectedProfile.university?.country || "";
  const isMentoring = selectedProfile.alumniData?.isMentoring || false;
  const tagsList = Array.isArray(selectedProfile.tags) ? selectedProfile.tags.map((t: any) => t.name || t) : [];

  const gpa = selectedProfile.academicData?.gpa;
  const satScore = selectedProfile.academicData?.satScore;
  const ieltsScore = selectedProfile.academicData?.ieltsScore;

  const socialLinks = (selectedProfile.socialLinks as Record<string, string>) || {};
  let telegramUsername = socialLinks.telegram || socialLinks.tg || socialLinks.Telegram || "";
  if (telegramUsername.includes("t.me/")) {
    telegramUsername = telegramUsername.split("t.me/")[1].split("?")[0].replace("/", "");
    if (telegramUsername.startsWith("@")) {
      telegramUsername = telegramUsername.substring(1);
    }
  }

  const isAlumnus = !!selectedProfile.alumniData || (selectedProfile.gradYear && selectedProfile.gradYear < new Date().getFullYear());

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

  const renderConnectionAction = () => {
    if (isLoadingStatus) {
      return (
        <button disabled className="w-full flex justify-center items-center gap-2 px-5 py-3.5 bg-white/5 text-white/50 font-bold rounded-xl cursor-not-allowed">
          <div className="h-5 w-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></div>
          Checking Status...
        </button>
      );
    }

    if (connectionStatus === "APPROVED") {
      return (
        <div className="space-y-3">
          <button disabled className="w-full flex justify-center items-center gap-2 px-5 py-3.5 bg-emerald-500/20 text-emerald-500 font-bold rounded-xl cursor-default">
            <Check className="h-5 w-5" /> Connected
          </button>
          <button
            onClick={handleLinkTelegram}
            disabled={isGeneratingTgToken}
            className="w-full flex justify-center items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
            {isGeneratingTgToken ? "Generating link..." : "Link Telegram Account"}
          </button>
        </div>
      );
    }

    if (connectionStatus === "PENDING") {
      return (
        <button disabled className="w-full flex justify-center items-center gap-2 px-5 py-3.5 bg-white/5 text-white/50 font-bold rounded-xl cursor-not-allowed">
          <Clock className="h-5 w-5" /> Request Sent (Pending)
        </button>
      );
    }

    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full flex justify-center items-center gap-2 px-5 py-3.5 bg-white text-black hover:bg-white/90 disabled:opacity-50 font-bold rounded-xl transition-colors"
      >
        {isConnecting ? (
          <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <UserPlus className="h-5 w-5" />
        )}
        {isConnecting ? "Requesting..." : "Request to Connect"}
      </button>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedProfile(null)}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0 }}
          className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl bg-[#0f1915] shadow-2xl border border-white/10 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2 z-50">
            {isAdmin && (
              <button
                onClick={handleEdit}
                className="p-2 rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-blue-500/20 hover:text-blue-400 transition backdrop-blur-md"
              >
                <Edit3 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isLoadingSaveStatus}
              className={`p-2 rounded-full bg-black/40 text-white/70 hover:text-white transition backdrop-blur-md ${isLoadingSaveStatus ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-500/20 hover:text-emerald-400'}`}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-emerald-500 text-emerald-500" : ""}`} />
            </button>
            <button
              onClick={() => setSelectedProfile(null)}
              className="p-2 rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-white/10 transition backdrop-blur-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-y-auto w-full h-full pb-4">
            {/* Banner */}
            <div className="h-40 w-full relative bg-gradient-to-tr from-emerald-900/40 to-[#0a110e] shrink-0">
              <BannerImage url={selectedProfile.bannerUrl} className="w-full h-full object-cover" />
            </div>

            <div className="px-8 pb-8 relative -top-12">
              <div className="flex justify-between items-end mb-6">
                <div className="h-24 w-24 rounded-full border-4 border-[#0f1915] bg-[#0f1915] flex items-center justify-center overflow-hidden shrink-0">
                  <AvatarImage url={selectedProfile.avatarUrl} name={selectedProfile.firstName} className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      {selectedProfile.firstName} {selectedProfile.lastName}
                    </h2>
                    <p className="text-white/60 flex items-center gap-1.5 mt-1">
                      <Briefcase className="h-4 w-4" /> {jobOrMajor}
                    </p>
                  </div>

                  {selectedProfile.bio && (
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-shoqan-light/50 uppercase mb-3">About</h3>
                      <p className="text-white/80 leading-relaxed text-base">
                        {selectedProfile.bio}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {isMentoring && (
                      <span className="bg-shoqan-primary/10 text-shoqan-primary border border-shoqan-primary/20 px-3 py-1 rounded-full text-sm font-medium">
                        Open to Mentoring
                      </span>
                    )}
                    {tagsList.map((tag: string, i: number) => (
                      <span key={i} className="bg-shoqan-primary/10 text-shoqan-primary border border-shoqan-primary/20 px-3 py-1 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {connectionStatus === "APPROVED" && selectedProfile.socialLinks && Object.keys(selectedProfile.socialLinks).length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-shoqan-light/50 uppercase mb-3">Connect</h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedProfile.socialLinks).filter(([platform]) => !['tg', 'telegram'].includes(platform.toLowerCase())).map(([platform, link]) => (
                          <a key={platform} href={link as string} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition text-sm text-white/80">
                            <LinkIcon className="h-4 w-4" /> <span className="capitalize">{platform}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Smart Icebreaker / Connection Area */}
              <div className="pt-8 border-t border-white/10 mt-6">
                {renderConnectionAction()}
              </div>

              <div className="space-y-6 mt-6">
                <div>
                  <h3 className="text-xs font-bold tracking-widest text-shoqan-light/50 uppercase mb-3">Education</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm text-white/80">
                      <GraduationCap className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                      <div>
                        <div className="font-medium">{uniName}</div>
                        <div className="text-white/40 text-xs">
                          {isAlumnus ? "Attended" : "Target University"} • Class of {selectedProfile.gradYear}
                        </div>
                      </div>
                    </div>
                    {uniCountry && (
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{uniCountry}</span>
                      </div>
                    )}
                    {Array.isArray(selectedProfile.awards) && selectedProfile.awards.length > 0 && (
                      <div className="flex items-start gap-2 text-sm text-white/80 mt-4">
                        <span className="text-lg mt-0.5">🏆</span>
                        <div>
                          <div className="font-medium text-emerald-400">Awards</div>
                          <div className="text-white/60 text-xs mt-1 leading-relaxed">
                            {selectedProfile.awards.join(", ")}
                          </div>
                        </div>
                      </div>
                    )}
                    {isAlumnus && Array.isArray(selectedProfile.offers) && selectedProfile.offers.length > 0 && (
                      <div className="flex items-start gap-2 text-sm text-white/80 mt-4">
                        <span className="text-lg mt-0.5">🎓</span>
                        <div>
                          <div className="font-medium text-emerald-400">University Offers</div>
                          <div className="text-white/60 text-xs mt-1 leading-relaxed">
                            {selectedProfile.offers.join(", ")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {(gpa || satScore || ieltsScore) && (
                  <div>
                    <h3 className="text-xs font-bold tracking-widest text-shoqan-light/50 uppercase mb-3">Stats</h3>
                    <div className="flex flex-wrap gap-3">
                      {gpa && (
                        <div className="flex flex-col items-center justify-center p-3 px-5 bg-white/5 border border-white/10 rounded-xl shadow-sm">
                          <span className="text-[10px] uppercase text-amber-500 font-bold tracking-wider flex items-center gap-1 mb-1"><Star className="h-3 w-3" /> GPA</span>
                          <span className="text-lg font-bold text-white">{gpa}</span>
                        </div>
                      )}
                      {satScore && (
                        <div className="flex flex-col items-center justify-center p-3 px-5 bg-white/5 border border-white/10 rounded-xl shadow-sm">
                          <span className="text-[10px] uppercase text-emerald-500 font-bold tracking-wider mb-1">SAT</span>
                          <span className="text-lg font-bold text-white">{satScore}</span>
                        </div>
                      )}
                      {ieltsScore && (
                        <div className="flex flex-col items-center justify-center p-3 px-5 bg-white/5 border border-white/10 rounded-xl shadow-sm">
                          <span className="text-[10px] uppercase text-emerald-500 font-bold tracking-wider mb-1">IELTS</span>
                          <span className="text-lg font-bold text-white">{ieltsScore}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
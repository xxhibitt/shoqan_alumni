"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, X, Briefcase, GraduationCap } from "lucide-react";
import { useSession } from "next-auth/react";

function ConnectionRequestContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestId = searchParams.get("requestId");

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<"accept" | "decline" | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.href);
      return;
    }
    
    if (status === "loading") {
      return;
    }

    if (!requestId) {
      setError("No request ID provided in the URL.");
      setLoading(false);
      return;
    }

    const fetchRequest = async () => {
      try {
        const res = await fetch(`/api/connections/${requestId}`);
        if (!res.ok) {
          throw new Error("Request not found or unauthorized.");
        }
        const data = await res.json();
        setRequest(data.request);
      } catch (err: any) {
        setError(err.message || "Failed to fetch request.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [status, requestId]);

  const handleAction = async (action: "accept" | "decline") => {
    setActionLoading(action);
    try {
      const res = await fetch(`/api/connections/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (!res.ok) {
        throw new Error(`Failed to ${action} request`);
      }
      setSuccessStatus(action === "accept" ? "APPROVED" : "REJECTED");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const renderLoading = () => (
    <div className="flex w-full min-h-screen justify-center items-center bg-[#0a110e]">
      <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const renderError = () => (
    <div className="flex w-full min-h-screen justify-center items-center bg-[#0a110e]">
      <div className="p-8 max-w-md bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
        <p className="text-red-400 font-medium mb-4">{error}</p>
        <button onClick={() => router.push("/feed")} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
          Go to Feed
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex w-full min-h-screen justify-center items-center bg-[#0a110e] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#0f1915]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
          {successStatus === "APPROVED" ? <Check className="h-8 w-8 text-emerald-500" /> : <X className="h-8 w-8 text-red-500" />}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {successStatus === "APPROVED" ? "Request Accepted" : "Request Declined"}
        </h2>
        <p className="text-white/60 mb-8">
          {successStatus === "APPROVED" 
            ? "You can now communicate via Telegram! We have notified the sender."
            : "The connection request has been declined."}
        </p>
        <button 
          onClick={() => router.push("/feed")}
          className="w-full px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
        >
          Go back to Feed
        </button>
      </motion.div>
    </div>
  );

  const renderProfileCard = () => {
    const sender = request?.sender;
    if (!sender) return null;

    const senderName = sender.profile ? `${sender.profile.firstName} ${sender.profile.lastName}` : "User";
    const avatarUrl = sender.profile?.avatarUrl;
    const jobOrMajor = sender.profile?.alumniData?.jobTitle || sender.profile?.academicData?.intendedMajor || "Alumnus";
    const uniName = sender.profile?.university?.name || "University";
    const fallbackAvatarUrl = `https://ui-avatars.com/api/?name=${sender.profile?.firstName || 'User'}+${sender.profile?.lastName || ''}&background=10b981&color=fff&rounded=true&bold=true`;

    return (
      <div className="flex w-full min-h-screen justify-center items-center bg-[#0a110e] p-4 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-900/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#0f1915]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative z-10"
        >
          <h2 className="text-xl font-bold text-white/90 mb-8">New Connection Request</h2>
          
          <div className="mb-8">
            <div className="mx-auto h-28 w-28 rounded-full border-4 border-[#0a110e] bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 flex items-center justify-center overflow-hidden mb-4 shadow-xl">
              <img src={avatarUrl || fallbackAvatarUrl} alt={senderName} className="w-full h-full object-cover" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">{senderName}</h3>
            
            <div className="flex flex-col items-center gap-2 text-white/60">
              <span className="flex items-center gap-1.5 text-sm"><Briefcase className="h-4 w-4" /> {jobOrMajor}</span>
              <span className="flex items-center gap-1.5 text-sm"><GraduationCap className="h-4 w-4" /> {uniName}</span>
            </div>
          </div>

          <p className="text-white/80 leading-relaxed mb-8">
            <strong>{senderName}</strong> would like to join your network on Shoqan Alumni.
          </p>

          <div className="flex gap-4">
            <button 
              onClick={() => handleAction("decline")}
              disabled={actionLoading !== null}
              className="flex-1 px-5 py-3.5 bg-white/5 hover:bg-red-500/10 text-white/70 hover:text-red-400 border border-white/10 hover:border-red-500/30 font-medium rounded-xl transition-all disabled:opacity-50"
            >
              {actionLoading === "decline" ? "Declining..." : "Decline"}
            </button>
            <button 
              onClick={() => handleAction("accept")}
              disabled={actionLoading !== null}
              className="flex-1 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
            >
              {actionLoading === "accept" ? "Accepting..." : "Accept"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  if (status === "loading" || loading) return renderLoading();
  if (error) return renderError();
  if (successStatus) return renderSuccess();
  return renderProfileCard();
}

export default function ConnectionPage() {
  return (
    <Suspense fallback={
      <div className="flex w-full min-h-screen justify-center items-center bg-[#0a110e]">
        <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ConnectionRequestContent />
    </Suspense>
  );
}

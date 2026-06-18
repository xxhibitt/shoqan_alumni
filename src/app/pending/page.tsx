import { Shield } from "lucide-react";
import Link from "next/link";

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1915] text-white p-4">
      <div className="max-w-md w-full bg-black/40 border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center shadow-xl backdrop-blur-sm">
        <div className="w-16 h-16 bg-[#1a2c24] rounded-full flex items-center justify-center mb-6 border border-[#2d4a3e]">
          <Shield className="w-8 h-8 text-emerald-400" />
        </div>
        
        <h1 className="text-2xl font-semibold mb-3 tracking-tight">
          Under Moderation
        </h1>
        
        <p className="text-slate-400 leading-relaxed mb-8">
          Your profile is under moderation. We are verifying your credentials to ensure the safety of the Shoqan Alumni network.
        </p>

        <Link 
          href="/login" 
          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
}

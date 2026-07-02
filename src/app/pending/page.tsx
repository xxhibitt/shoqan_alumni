import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PendingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect("/login");
  }

  const isRejected = user.status === "REJECTED";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a110e] text-white p-4">
      <div className="max-w-md w-full bg-[#111c18] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
        {isRejected ? (
          <>
            <div className="mx-auto w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Profile Rejected</h1>
            <p className="text-slate-400 mb-6">Your profile submission requires revisions before it can be approved.</p>
            {user.rejectionReason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 text-left">
                <p className="text-sm font-bold text-red-400 mb-1">Moderator Notes:</p>
                <p className="text-sm text-red-200">{user.rejectionReason}</p>
              </div>
            )}
            <Link href="/onboarding" className="inline-block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-colors">
              Fix Profile & Resubmit
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Under Review</h1>
            <p className="text-slate-400 mb-6">Your profile has been submitted and is currently pending approval by a moderator. We will notify you once you've been granted access.</p>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-1/3 animate-pulse rounded-full"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

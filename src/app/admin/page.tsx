import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { approveUser, rejectUser } from "./actions";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // Check admin privileges
  // @ts-ignore - role is added in the session callback
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const pendingUsers = await prisma.user.findMany({
    where: { status: "PENDING" },
    include: { profile: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#f4f7f5] dark:bg-[#0f1915] text-slate-900 dark:text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 tracking-tight">Moderation Dashboard</h1>
        
        {pendingUsers.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10">
            <p className="text-slate-500 dark:text-slate-400">No pending users in the moderation queue.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => {
              const profile = user.profile;
              const fullName = profile 
                ? `${profile.firstName} ${profile.lastName}`
                : "Profile Incomplete";

              return (
                <div 
                  key={user.id} 
                  className="bg-white dark:bg-black/40 rounded-xl p-5 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Left Side */}
                    <div>
                      <h2 className="text-lg font-semibold">{fullName}</h2>
                      <a 
                        href={`mailto:${user.email}`}
                        className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        {user.email}
                      </a>
                    </div>

                    {/* Right Side (Action Buttons) */}
                    <div className="flex items-center gap-3">
                      <form action={async () => {
                        "use server";
                        await rejectUser(user.id);
                      }}>
                        <button 
                          type="submit"
                          className="px-4 py-2 text-sm font-medium rounded-lg border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          Reject
                        </button>
                      </form>

                      <form action={async () => {
                        "use server";
                        await approveUser(user.id);
                      }}>
                        <button 
                          type="submit"
                          className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                        >
                          Approve
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { DashboardProvider } from "@/components/providers/DashboardProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { SettingsModal } from "@/components/ui/SettingsModal";
import { CreatePostModal } from "@/components/ui/CreatePostModal";
import { PostDetailModal } from "@/components/ui/PostDetailModal";
import { PublicProfileModal } from "@/components/ui/PublicProfileModal";
import { SearchDrawer } from "@/components/ui/SearchDrawer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { status: true },
  });

  if (user?.status === "PENDING") {
    redirect("/pending");
  }

  return (
    <DashboardProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-[#f4f7f5] dark:bg-[#0f1915] text-slate-900 dark:text-white">
        {/* Left Sidebar (Desktop) / Bottom Nav (Mobile) */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="md:ml-[72px] flex-1 min-h-screen flex flex-col relative overflow-hidden pb-[72px] md:pb-0 w-full">
          {children}
        </main>

        {/* Modals & Drawers */}
        <SearchDrawer />
        <SettingsModal />
        <CreatePostModal />
        <PostDetailModal />
        <PublicProfileModal />
      </div>
    </DashboardProvider>
  );
}

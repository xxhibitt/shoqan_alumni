import { DashboardProvider } from "@/components/providers/DashboardProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { SettingsModal } from "@/components/ui/SettingsModal";
import { CreatePostModal } from "@/components/ui/CreatePostModal";
import { PostDetailModal } from "@/components/ui/PostDetailModal";
import { PublicProfileModal } from "@/components/ui/PublicProfileModal";
import { SearchDrawer } from "@/components/ui/SearchDrawer";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardProvider>
      <div className="flex min-h-screen bg-[#0a110e]">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="ml-[72px] flex-1 min-h-screen flex flex-col relative overflow-hidden">
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

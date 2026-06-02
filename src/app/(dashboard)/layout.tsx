import { DashboardProvider } from "@/components/providers/DashboardProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { SettingsModal } from "@/components/ui/SettingsModal";
import { CreatePostModal } from "@/components/ui/CreatePostModal";
import { PostDetailModal } from "@/components/ui/PostDetailModal";
import { PublicProfileModal } from "@/components/ui/PublicProfileModal";
import { SearchDrawer } from "@/components/ui/SearchDrawer";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-[#f4f7f5] dark:bg-[#0f1915] text-slate-900 dark:text-white">
        {/* Left Sidebar (Desktop) / Bottom Nav (Mobile) */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="md:ml-[72px] flex-1 min-h-screen flex flex-col relative overflow-hidden pb-[72px] md:pb-0 w-full">
          {/* Top Right Controls */}
          <div className="w-full flex justify-end p-4 md:pt-8 md:pr-8">
            <LanguageSwitcher />
          </div>
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

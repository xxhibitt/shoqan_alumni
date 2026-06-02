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
          <div className="absolute top-4 right-4 z-50 md:top-8 md:right-8 hidden md:block">
            <LanguageSwitcher />
          </div>
          <div className="md:hidden flex justify-end p-4 pt-6 pb-0">
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

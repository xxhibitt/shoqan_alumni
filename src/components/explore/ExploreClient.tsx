"use client";

import dynamic from "next/dynamic";

// Блокируем SSR для дочерних компонентов, где используется LanguageProvider
const ExploreHeader = dynamic(
  () => import("@/components/ui/ExploreHeader").then((mod) => mod.ExploreHeader),
  { ssr: false }
);

const ExploreFeed = dynamic(
  () => import("@/components/ui/ExploreFeed").then((mod) => mod.ExploreFeed),
  { ssr: false }
);

interface ExploreClientProps {
  announcements: any[];
  isAdmin?: boolean;
  currentUserId?: string;
}

export function ExploreClient({ announcements, isAdmin, currentUserId }: ExploreClientProps) {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <ExploreHeader />
      <ExploreFeed posts={announcements} isAdmin={isAdmin} currentUserId={currentUserId} />
    </div>
  );
}
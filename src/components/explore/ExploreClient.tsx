"use client";

import { ExploreHeader } from "@/components/ui/ExploreHeader";
import { ExploreFeed } from "@/components/ui/ExploreFeed";

interface ExploreClientProps {
  announcements: any[];
  isAdmin?: boolean;
}

export function ExploreClient({ announcements, isAdmin }: ExploreClientProps) {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <ExploreHeader />
      <ExploreFeed posts={announcements} isAdmin={isAdmin} />
    </div>
  );
}
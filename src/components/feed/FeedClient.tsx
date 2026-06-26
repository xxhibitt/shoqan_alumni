"use client";

import dynamic from "next/dynamic";

// Блокируем SSR для дочерних компонентов, где используется LanguageProvider
const FeedHeader = dynamic(
  () => import("@/components/ui/FeedHeader").then((mod) => mod.FeedHeader),
  { ssr: false }
);

const FeedGrid = dynamic(
  () => import("@/components/ui/FeedGrid").then((mod) => mod.FeedGrid),
  { ssr: false }
);

interface FeedClientProps {
  profiles: any[];
  recommendedUnis: any[];
}

export function FeedClient({ profiles, recommendedUnis }: FeedClientProps) {
  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
      <FeedHeader />
      <FeedGrid profiles={profiles} recommendedUnis={recommendedUnis} />
    </div>
  );
}

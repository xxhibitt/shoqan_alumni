"use client";

import { useState, useEffect } from "react";
import { ExploreHeader } from "@/components/ui/ExploreHeader";
import { ExploreFeed } from "@/components/ui/ExploreFeed";

interface ExploreClientProps {
  announcements: any[];
  isAdmin?: boolean;
}

export function ExploreClient({ announcements, isAdmin }: ExploreClientProps) {
  // 1. Create a mounting state
  const [isMounted, setIsMounted] = useState(false);

  // 2. This only runs in the browser, never on the server
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 3. Return a blank placeholder during Server-Side Rendering
  if (!isMounted) {
    return <div className="flex-1 p-8 min-h-screen bg-background"></div>;
  }

  // 4. Render the real UI with translations ONLY once safely in the browser
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <ExploreHeader />
      <ExploreFeed posts={announcements} isAdmin={isAdmin} />
    </div>
  );
}
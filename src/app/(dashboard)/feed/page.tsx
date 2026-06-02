import { prisma } from "@/lib/prisma";
import { FeedGrid } from "@/components/ui/FeedGrid";
import { FeedHeader } from "@/components/ui/FeedHeader";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { recommendProfiles, recommendUniversities } from "@/lib/recommendations";

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const allProfiles = await prisma.profile.findMany({
    include: {
      user: { select: { role: true } },
      university: true,
      academicData: true,
      alumniData: true,
      tags: true,
    }
  });

  let recommendedProfiles = allProfiles;
  let recommendedUnis = [];

  if (userId) {
    const currentUserProfile = allProfiles.find(p => p.userId === userId);
    if (currentUserProfile) {
      recommendedProfiles = recommendProfiles(currentUserProfile, allProfiles);
      recommendedUnis = recommendUniversities(currentUserProfile, allProfiles);
    }
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
      <FeedHeader />
      
      <FeedGrid profiles={recommendedProfiles} recommendedUnis={recommendedUnis} />
    </div>
  );
}

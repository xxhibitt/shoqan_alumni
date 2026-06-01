import { prisma } from "@/lib/prisma";
import { FeedGrid } from "@/components/ui/FeedGrid";
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
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">For You</h1>
        <p className="text-slate-600 dark:text-white/50">Discover alumni matching your interests and goals.</p>
      </header>
      
      <FeedGrid profiles={recommendedProfiles} recommendedUnis={recommendedUnis} />
    </div>
  );
}

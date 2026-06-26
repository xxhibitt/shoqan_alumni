import { prisma } from "@/lib/prisma";
import { FeedClient } from "@/components/feed/FeedClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { recommendProfiles, recommendUniversities } from "@/lib/recommendations";

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;

  const allProfiles = await prisma.profile.findMany({
    where: userRole === 'ADMIN' ? undefined : {
      OR: [
        { user: { status: 'APPROVED' } },
        { userId: userId } // Allow users to always see their own profile
      ]
    },
    include: {
      user: { select: { role: true, status: true } },
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

  return <FeedClient profiles={recommendedProfiles} recommendedUnis={recommendedUnis} />;
}

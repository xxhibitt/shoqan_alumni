import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { SavedClient } from "@/components/ui/SavedClient";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function SavedPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  // @ts-ignore
  const userId = session.user.id;

  const savedProfilesRecords = await prisma.savedProfile.findMany({
    where: { userId },
    include: {
      profile: {
        include: {
          university: true,
          tags: true,
          academicData: true,
          alumniData: true,
        }
      }
    },
  });

  const savedPostsRecords = await prisma.savedPost.findMany({
    where: { userId },
    include: {
      post: {
        include: {
          tags: true,
          author: {
            include: {
              profile: true
            }
          }
        }
      }
    },
  });

  const savedProfiles = savedProfilesRecords.map((r) => r.profile).filter(Boolean);
  const savedPosts = savedPostsRecords.map((r) => r.post).filter(Boolean);

  return <SavedClient savedProfiles={savedProfiles} savedPosts={savedPosts} />;
}

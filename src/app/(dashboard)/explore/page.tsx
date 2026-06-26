import { prisma } from "@/lib/prisma";
import { ExploreFeed } from "@/components/ui/ExploreFeed";
import { ExploreHeader } from "@/components/ui/ExploreHeader";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { recommendPosts } from "@/lib/recommendations";

// Make the route dynamic so it fetches fresh data on every request
export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id;

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tags: true,
      author: {
        include: {
          profile: true,
        },
      },
    },
  });

  let recommendedPosts = posts;

  if (userId) {
    const currentUserProfile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        academicData: true,
        alumniData: true,
        tags: true,
      }
    });

    if (currentUserProfile) {
      recommendedPosts = recommendPosts(currentUserProfile, posts);
    }
  }

  // Serialize dates for Client Components
  const serializedPosts = recommendedPosts.map(post => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }));

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <ExploreHeader />

      <ExploreFeed posts={serializedPosts} isAdmin={isAdmin} />
    </div>
  );
}

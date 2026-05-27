import { prisma } from "@/lib/prisma";
import { ExploreFeed } from "@/components/ui/ExploreFeed";
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
      <header className="mb-10 pl-[72px] md:pl-0">
        <h1 className="text-3xl font-bold text-white mb-2">Explore</h1>
        <p className="text-white/50">Top performers, exclusive offers, and announcements.</p>
      </header>

      <ExploreFeed posts={serializedPosts} isAdmin={isAdmin} />
    </div>
  );
}

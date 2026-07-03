import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExploreClient } from "@/components/explore/ExploreClient";

export default async function ExplorePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const announcements = await prisma.post.findMany({
    where: {
      type: "ANNOUNCEMENT",
      isArchived: false,
      isHidden: false,
      author: { status: "APPROVED" }
    },
    include: {
      author: {
        include: {
          profile: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // @ts-ignore
  const currentUserId = session.user?.id;
  // @ts-ignore
  const isAdmin = session.user?.role === "ADMIN";

  return <ExploreClient announcements={announcements} isAdmin={isAdmin} currentUserId={currentUserId} />;
}
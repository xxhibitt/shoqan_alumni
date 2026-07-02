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
      author: { status: "APPROVED" }
    },
    orderBy: { createdAt: "desc" }
  });

  return <ExploreClient announcements={announcements} />;
}
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // Check admin privileges
  // @ts-ignore - role is added in the session callback
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [pendingUsers, announcements, hiddenPosts] = await Promise.all([
    prisma.user.findMany({
      where: { status: "PENDING" },
      include: { 
        profile: {
          include: {
            university: true,
            academicData: true,
            alumniData: true,
          }
        } 
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.post.findMany({
      where: { type: "ANNOUNCEMENT", isHidden: false }, // Don't show hidden posts in standard announcements list
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.findMany({
      where: { isHidden: true },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          include: {
            profile: true
          }
        }
      }
    }),
  ]);

  return (
    <AdminDashboardClient 
      pendingUsers={pendingUsers} 
      announcements={announcements} 
      hiddenPosts={hiddenPosts}
      adminUser={session.user}
    />
  );
}

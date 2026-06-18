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

  const [pendingUsers, announcements] = await Promise.all([
    prisma.user.findMany({
      where: { status: "PENDING" },
      include: { profile: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.post.findMany({
      where: { type: "ANNOUNCEMENT" }, // Capitalized as requested
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <AdminDashboardClient 
      pendingUsers={pendingUsers} 
      announcements={announcements} 
      adminUser={session.user}
    />
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClientShell } from "@/components/layout/DashboardClientShell";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { status: true },
  });

  // Bulletproof checks for NEW or null status
  if (!user?.status || user.status === "NEW") {
    redirect("/onboarding");
  }

  // If they are anything other than APPROVED (or ADMIN), lock them out of the dashboard
  if (user.status === "PENDING" || user.status === "REJECTED") {
    redirect("/pending");
  }

  return (
    <DashboardClientShell>
      {children}
    </DashboardClientShell>
  );
}

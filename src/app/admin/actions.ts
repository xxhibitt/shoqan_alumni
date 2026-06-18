"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function approveUser(userId: string) {
  const session = await getServerSession(authOptions);
  
  // Extra security check for the server action
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: "APPROVED" },
  });

  revalidatePath("/admin");
}

export async function rejectUser(userId: string) {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: "REJECTED" },
  });

  revalidatePath("/admin");
}

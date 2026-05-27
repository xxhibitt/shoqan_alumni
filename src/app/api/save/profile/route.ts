import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    const userId = session.user.id;
    const body = await req.json();
    const { profileId } = body;

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID required" }, { status: 400 });
    }

    // Check if already saved
    const existing = await prisma.savedProfile.findUnique({
      where: {
        userId_savedProfileId: {
          userId,
          savedProfileId: profileId,
        },
      },
    });

    if (existing) {
      // Unsave
      await prisma.savedProfile.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, saved: false });
    } else {
      // Save
      await prisma.savedProfile.create({
        data: {
          userId,
          savedProfileId: profileId,
        },
      });
      return NextResponse.json({ success: true, saved: true });
    }
  } catch (error) {
    console.error("Save profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

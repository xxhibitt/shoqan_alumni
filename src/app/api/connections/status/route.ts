import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
    }

    // Get the target user ID from the profile ID
    const targetProfile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { userId: true }
    });

    if (!targetProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const targetUserId = targetProfile.userId;
    // @ts-ignore
    const currentUserId = session.user.id;

    if (targetUserId === currentUserId) {
      return NextResponse.json({ status: "APPROVED" }); // Can always see own links
    }

    const connection = await prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: currentUserId }
        ]
      }
    });

    return NextResponse.json({ status: connection ? connection.status : null });
  } catch (error) {
    console.error("Connection status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

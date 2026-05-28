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
    const targetId = searchParams.get("targetId");

    if (!targetId) {
      return NextResponse.json({ error: "Missing targetId" }, { status: 400 });
    }

    // @ts-ignore
    const currentUserId = session.user.id;

    const savedProfile = await prisma.savedProfile.findUnique({
      where: {
        userId_savedProfileId: {
          userId: currentUserId,
          savedProfileId: targetId,
        }
      }
    });

    return NextResponse.json({ isSaved: !!savedProfile });
  } catch (error) {
    console.error("Save status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

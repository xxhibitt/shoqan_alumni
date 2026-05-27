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
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 });
    }

    // Check if already saved
    const existing = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existing) {
      // Unsave
      await prisma.savedPost.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, saved: false });
    } else {
      // Save
      await prisma.savedPost.create({
        data: {
          userId,
          postId,
        },
      });
      return NextResponse.json({ success: true, saved: true });
    }
  } catch (error) {
    console.error("Save post error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

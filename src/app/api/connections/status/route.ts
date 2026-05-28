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
    const receiverId = searchParams.get("receiverId");

    if (!receiverId) {
      return NextResponse.json({ error: "Missing receiverId" }, { status: 400 });
    }

    // @ts-ignore
    const currentUserId = session.user.id;

    if (receiverId === currentUserId) {
      return NextResponse.json({ status: "APPROVED" });
    }

    const connection = await prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: receiverId },
          { senderId: receiverId, receiverId: currentUserId }
        ]
      }
    });

    if (!connection) {
      return NextResponse.json({ status: "NONE" }, { status: 200 });
    }

    return NextResponse.json({ status: connection.status });
  } catch (error) {
    console.error("Connection status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

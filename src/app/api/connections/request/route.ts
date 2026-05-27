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

    const body = await req.json();
    const { receiverId } = body;

    if (!receiverId) {
      return NextResponse.json({ error: "Missing receiverId" }, { status: 400 });
    }

    // @ts-ignore
    const currentUserId = session.user.id;

    const existingConnection = await prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: receiverId },
          { senderId: receiverId, receiverId: currentUserId }
        ]
      }
    });

    if (existingConnection) {
      return NextResponse.json({ error: "Connection request already exists" }, { status: 400 });
    }

    const request = await prisma.connectionRequest.create({
      data: {
        senderId: currentUserId,
        receiverId,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error("Connection request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const request = await prisma.connectionRequest.findUnique({
      where: { id },
      include: {
        sender: { include: { profile: true } },
        receiver: true
      }
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // @ts-ignore
    if (request.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized access to request" }, { status: 403 });
    }

    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error("Fetch connection request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();
    const { action } = body; // "accept" or "decline"

    const request = await prisma.connectionRequest.findUnique({
      where: { id }
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // @ts-ignore
    if (request.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized access to request" }, { status: 403 });
    }

    if (action === "accept") {
      await prisma.connectionRequest.update({
        where: { id },
        data: { status: "APPROVED" }
      });
    } else if (action === "decline") {
      await prisma.connectionRequest.update({
        where: { id },
        data: { status: "REJECTED" }
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, status: action === "accept" ? "APPROVED" : "REJECTED" });
  } catch (error) {
    console.error("Update connection request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

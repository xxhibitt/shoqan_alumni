import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
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

    if (request.receiver.email !== session.user.email) {
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
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();
    const { action } = body; // "accept" or "decline"

    const request = await prisma.connectionRequest.findUnique({
      where: { id },
      include: { 
        receiver: { include: { profile: true } },
        sender: { include: { profile: true } }
      }
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.receiver.email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized access to request" }, { status: 403 });
    }

    if (action === "accept") {
      await prisma.connectionRequest.update({
        where: { id },
        data: { status: "APPROVED" }
      });

      // Notification Logic
      try {
        const receiverName = request.receiver.profile ? `${request.receiver.profile.firstName} ${request.receiver.profile.lastName}` : "Someone";
        const receiverTg = request.receiver.telegramUsername ? `@${request.receiver.telegramUsername}` : "They have not linked Telegram yet.";
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shoqan-alumni.vercel.app";

        if (request.sender.telegramChatId) {
          await sendTelegramMessage(
            request.sender.telegramChatId,
            `✅ ${receiverName} accepted your connection request! Their Telegram: ${receiverTg}`
          );
        }

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        });

        const htmlContent = `
  <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="color: #333;">Connection Request Accepted!</h2>
    <p>Good news! <strong>${receiverName}</strong> has accepted your connection request on Shoqan Alumni.</p>
    <div style="margin: 20px 0; padding: 15px; background-color: #f9fafb; border-radius: 6px;">
      <p style="margin: 0;">Their Telegram: <strong>${receiverTg}</strong></p>
    </div>
    <div style="text-align: center;">
      <a href="${appUrl}/feed" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Feed</a>
    </div>
  </div>
        `;

        await transporter.sendMail({
          from: `"Shoqan Alumni" <${process.env.EMAIL_SERVER_USER}>`,
          to: request.sender.email,
          subject: "Your connection request was accepted!",
          html: htmlContent,
        });
      } catch (err) {
        console.error("Failed to send acceptance notification", err);
      }
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

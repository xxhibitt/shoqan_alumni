import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { sendTelegramMessage } from "@/lib/telegram";

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

    // Fetch sender and receiver for notifications
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      include: { profile: true }
    });
    const sender = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: { profile: true }
    });

    if (receiver && sender) {
      const senderName = sender.profile ? `${sender.profile.firstName} ${sender.profile.lastName}` : "Someone";
      
      // Email Logic
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: `"Shoqan Alumni" <${process.env.EMAIL_SERVER_USER}>`,
          to: receiver.email,
          subject: "New Connection Request",
          html: `<p>User <strong>${senderName}</strong> wants to connect with you. Please <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login">log in</a> to accept or decline.</p>`,
        });
      } catch (err) {
        console.error("Failed to send connection email", err);
      }

      // Telegram Logic
      if (receiver.telegramChatId) {
        await sendTelegramMessage(
          receiver.telegramChatId,
          `🤝 *New Connection Request!*\n\n${senderName} wants to connect with you on Shoqan Alumni.\nLog in to your account to accept or decline.`
        );
      }
    }

    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error("Connection request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

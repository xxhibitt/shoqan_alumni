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

        const avatarUrl = sender.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${sender.profile?.firstName || 'User'}+${sender.profile?.lastName || ''}&background=10b981&color=fff&rounded=true&bold=true`;
        const senderFullName = sender.profile ? `${sender.profile.firstName} ${sender.profile.lastName}` : "Someone";
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shoqan-alumni.vercel.app";

        const htmlContent = `
  <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="color: #333;">New Connection Request</h2>
    <p>${senderFullName} would like to join your network on Shoqan Alumni.</p>
    <div style="text-align: center; margin: 20px 0;">
      <img src="${avatarUrl}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;" alt="Avatar" />
      <h3 style="margin: 10px 0 5px 0;">${senderFullName}</h3>
    </div>
    <div style="text-align: center;">
      <a href="${appUrl}/connection?requestId=${request.id}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Request</a>
    </div>
  </div>
        `;

        await transporter.sendMail({
          from: `"Shoqan Alumni" <${process.env.EMAIL_SERVER_USER}>`,
          to: receiver.email,
          subject: "New Connection Request",
          html: htmlContent,
        });
      } catch (err) {
        console.error("Failed to send connection email", err);
      }

      // Telegram Logic
      if (receiver.telegramChatId) {
        await sendTelegramMessage(
          receiver.telegramChatId,
          `🤝 *New Connection Request!*\n\n${senderName} wants to connect with you on Shoqan Alumni.\nLog in to your account to accept or decline.`,
          {
            inline_keyboard: [
              [
                { text: "✅ Accept", callback_data: `acc_${request.id}` },
                { text: "❌ Decline", callback_data: `dec_${request.id}` }
              ]
            ]
          }
        );
      }
    }

    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error("Connection request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

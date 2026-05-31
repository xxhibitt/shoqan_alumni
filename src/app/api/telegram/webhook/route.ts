import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { editTelegramMessage, sendTelegramMessage } from "@/lib/telegram";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // Handle standard messages (e.g., /start)
    if (body.message?.text) {
      const text = body.message.text as string;
      const tgUsername = body.message.chat.username || null;

      if (text.startsWith("/start ")) {
        const token = text.split(" ")[1];

        if (token) {
          const user = await prisma.user.findFirst({
            where: { telegramAuthToken: token },
          });

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                telegramChatId: body.message.chat.id.toString(),
                telegramUsername: tgUsername,
                telegramAuthToken: null,
              },
            });

            if (botToken) {
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: body.message.chat.id,
                  text: "✅ Your account has been successfully linked!\n\nYou can now return to the website.\nThis bot will send you:\n- Connection requests from other users\n- OTP codes for secure login (auto-deleted after use for security).",
                }),
              });
            }
          }
        }
      }
    }

    // Handle inline button callbacks
    if (body.callback_query) {
      const data = body.callback_query.data;
      const messageId = body.callback_query.message.message_id;
      const chatId = body.callback_query.message.chat.id.toString();

      if (data && (data.startsWith("acc_") || data.startsWith("dec_"))) {
        const action = data.substring(0, 4); // "acc_" or "dec_"
        const connectionId = data.substring(4);

        const connection = await prisma.connectionRequest.findUnique({
          where: { id: connectionId },
          include: {
            sender: { include: { profile: true } },
            receiver: { include: { profile: true } }
          }
        });

        if (connection && connection.status === "PENDING") {
          const senderName = connection.sender.profile ? `${connection.sender.profile.firstName} ${connection.sender.profile.lastName}` : "User";
          const receiverName = connection.receiver.profile ? `${connection.receiver.profile.firstName} ${connection.receiver.profile.lastName}` : "User";
          
          const senderTg = connection.sender.telegramUsername ? `@${connection.sender.telegramUsername}` : 'User has not linked Telegram';
          const receiverTg = connection.receiver.telegramUsername ? `@${connection.receiver.telegramUsername}` : 'User has not linked Telegram';

          if (action === "acc_") {
            // Accept Connection
            await prisma.connectionRequest.update({
              where: { id: connectionId },
              data: { status: "APPROVED" }
            });

            await editTelegramMessage(
              chatId,
              messageId,
              `✅ You accepted the connection request from ${senderName}. Their Telegram: ${senderTg}`
            );

            if (connection.sender.telegramChatId) {
              await sendTelegramMessage(
                connection.sender.telegramChatId,
                `✅ ${receiverName} accepted your connection request! Their Telegram: ${receiverTg}`
              );
            }

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
                to: connection.sender.email,
                subject: "Connection Request Accepted",
                html: `<p>Good news! <strong>${receiverName}</strong> accepted your connection request. You can contact them on Telegram: ${receiverTg}</p>`,
              });

              await transporter.sendMail({
                from: `"Shoqan Alumni" <${process.env.EMAIL_SERVER_USER}>`,
                to: connection.receiver.email,
                subject: "Connection Request Accepted",
                html: `<p>You accepted <strong>${senderName}</strong>'s connection request. Their Telegram is: ${senderTg}</p>`,
              });
            } catch (err) {
              console.error("Failed to send acceptance emails", err);
            }
          } else if (action === "dec_") {
            // Decline Connection
            await prisma.connectionRequest.update({
              where: { id: connectionId },
              data: { status: "REJECTED" }
            });

            await editTelegramMessage(
              chatId,
              messageId,
              `❌ You declined the connection request from ${senderName}.`
            );
          }
        }
      }

      // Answer callback query to stop loading spinner
      if (botToken) {
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery?callback_query_id=${body.callback_query.id}`);
      }
    }

    // Always return 200 OK so Telegram stops retrying
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

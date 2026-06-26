import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body?.message?.text) {
      const text = body.message.text;
      const chatId = body.message.chat.id.toString();

      if (text.startsWith("/start ")) {
        const userId = text.replace("/start ", "").trim();

        if (userId) {
          const user = await prisma.user.findUnique({ where: { id: userId } });

          if (user && user.role === "ADMIN") {
            await prisma.user.update({
              where: { id: userId },
              data: { moderatorChatId: chatId },
            });

            await fetch(`https://api.telegram.org/bot${process.env.ADMIN_TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: "Moderator alerts connected successfully.",
              }),
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram Admin Webhook error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

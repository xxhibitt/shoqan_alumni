import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.message?.text) {
      const text = body.message.text as string;

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
                telegramAuthToken: null,
              },
            });

            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            if (botToken) {
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: body.message.chat.id,
                  text: "✅ Your account has been successfully linked! You will now receive notifications here.",
                }),
              });
            }
          }
        }
      }
    }

    // Always return 200 OK so Telegram stops retrying
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

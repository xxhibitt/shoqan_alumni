export async function sendTelegramMessage(chatId: string, text: string) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn("TELEGRAM_BOT_TOKEN is not defined");
      return;
    }

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });

    if (!res.ok) {
      console.error("Failed to send Telegram message", await res.text());
    }
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
}

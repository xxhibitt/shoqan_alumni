export async function sendTelegramMessage(chatId: string, text: string, replyMarkup?: any) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn("TELEGRAM_BOT_TOKEN is not defined");
      return;
    }

    const payload: any = { chat_id: chatId, text, parse_mode: "Markdown" };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Failed to send Telegram message", await res.text());
    }
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
}

export async function editTelegramMessage(chatId: string, messageId: number, text: string, replyMarkup?: any) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn("TELEGRAM_BOT_TOKEN is not defined");
      return;
    }

    const payload: any = { chat_id: chatId, message_id: messageId, text, parse_mode: "Markdown" };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Failed to edit Telegram message", await res.text());
    }
  } catch (error) {
    console.error("Error editing Telegram message:", error);
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    console.log("Login Attempt for:", email);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("User found in DB:", !!user);

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    console.log("Starting bcrypt compare...");
    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log("Bcrypt compare result:", isValid);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate 6-digit OTP
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    
    // Expires in 10 minutes
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode,
        otpExpires,
      },
    });

    // Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Send the email
    try {
      await transporter.sendMail({
        from: `"Shoqan Alumni" <${process.env.EMAIL_SERVER_USER}>`,
        to: email,
        subject: "Your Shoqan Alumni Verification Code",
        text: `Your login code is: ${otpCode}. It expires in 10 minutes.`,
      });
      console.log(`[Email Sent] OTP successfully delivered to ${email}.`);
    } catch (emailError: any) {
      console.error("Failed to send OTP email:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    // Telegram Logic
    if (user.telegramChatId) {
      await sendTelegramMessage(
        user.telegramChatId,
        `🔐 *Your Shoqan Alumni Login Code*\n\nYour OTP is: *${otpCode}*.\nIt expires in 10 minutes.`
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("OTP generation error:", error);
    return NextResponse.json(
      { error: "Server Error", details: error.message || String(error) }, 
      { status: 500 }
    );
  }
}

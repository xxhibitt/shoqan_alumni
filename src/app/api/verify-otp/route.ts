import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
    console.log("\n=========================================");
    console.log("🔥 ТВОЙ КОД ДЛЯ ВХОДА:", otpCode);
    console.log("=========================================\n");
    // Expires in 10 minutes
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode,
        otpExpires,
      },
    });

    // DEV MODE simulation (in real life, send via email service like Resend)
    console.log(`\n\n[DEV MODE 2FA OTP for ${email}]: ${otpCode}\n\n`);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("OTP generation error:", error);
    return NextResponse.json(
      { error: "Server Error", details: error.message || String(error) }, 
      { status: 500 }
    );
  }
}

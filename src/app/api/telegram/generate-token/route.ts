import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized or no email" }, { status: 401 });
    }

    // Generate a secure random token
    const token = crypto.randomUUID();

    // Update the user with the new token using email
    await prisma.user.update({
      where: { email: session.user.email },
      data: { telegramAuthToken: token },
    });

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

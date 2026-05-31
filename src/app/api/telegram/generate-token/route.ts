import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a secure random token
    const token = crypto.randomUUID();

    // @ts-ignore
    const userId = session.user.id;

    // Update the user with the new token
    await prisma.user.update({
      where: { id: userId },
      data: { telegramAuthToken: token },
    });

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

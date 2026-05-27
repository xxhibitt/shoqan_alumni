import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, imageUrl, tags, type } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const tagsArray = Array.isArray(tags) ? tags : [];

    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        type: "ANNOUNCEMENT",
        authorId: session.user.id as string,
        tags: {
          connectOrCreate: tagsArray.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag }
          }))
        },
      },
    });

    return NextResponse.json({ success: true, post });

  } catch (error) {
    console.error("EXACT PRISMA POST CREATION ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}

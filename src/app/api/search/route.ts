import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (!q) {
      return NextResponse.json({ profiles: [], posts: [] });
    }

    const profiles = await prisma.profile.findMany({
      where: {
        AND: [
          { user: { status: 'APPROVED' } },
          {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } },
              { bio: { contains: q, mode: 'insensitive' } },
              { tags: { some: { name: { contains: q, mode: 'insensitive' } } } },
              { university: { name: { contains: q, mode: 'insensitive' } } }
            ]
          }
        ]
      },
      take: 5,
      include: {
        academicData: true,
        alumniData: true,
      }
    });

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 5,
      include: {
        author: {
          include: { profile: true }
        }
      }
    });

    return NextResponse.json({ profiles, posts });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

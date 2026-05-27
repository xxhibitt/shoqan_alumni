import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params; // profile id
    const body = await req.json();

    const {
      firstName,
      lastName,
      bio,
      openToMentoring,
      gradYear,
      university,
      major,
    } = body;

    let universityId = undefined;
    if (university) {
      const uniRecord = await prisma.university.upsert({
        where: { name: university },
        update: {},
        create: { name: university },
      });
      universityId = uniRecord.id;
    }

    const updatedProfile = await prisma.profile.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(bio !== undefined && { bio }),
        ...(gradYear !== undefined && { gradYear }),
        ...(universityId && { university: { connect: { id: universityId } } }),
        ...(openToMentoring !== undefined && {
          alumniData: {
            upsert: {
              create: { isMentoring: openToMentoring },
              update: { isMentoring: openToMentoring }
            }
          }
        }),
        ...(major !== undefined && {
          academicData: {
            upsert: {
              create: { intendedMajor: major },
              update: { intendedMajor: major }
            }
          }
        })
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("Admin edit profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

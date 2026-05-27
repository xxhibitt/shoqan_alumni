import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            university: true,
            academicData: true,
            alumniData: true,
            tags: true,
          }
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    const userId = session.user.id;
    // @ts-ignore
    const userRole = session.user.role;
    const body = await req.json();

    const {
      firstName,
      lastName,
      avatarUrl,
      bannerUrl,
      bio,
      socialLinks,
      university,
      major,
      satScore,
      ieltsScore,
      activities,
      isMentoring
    } = body;

    // Handle University
    let universityId = null;
    if (university && typeof university === 'string') {
      const uniRecord = await prisma.university.upsert({
        where: { name: university },
        update: {},
        create: { name: university },
      });
      universityId = uniRecord.id;
    }

    // Handle Tags
    let tagConnectOrCreate: { where: { name: string }; create: { name: string } }[] = [];
    if (activities && Array.isArray(activities)) {
      tagConnectOrCreate = activities.map((tag: string) => ({
        where: { name: tag },
        create: { name: tag },
      }));
    }

    // Find profile
    let profile = await prisma.profile.findUnique({ where: { userId } });
    
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId,
          firstName: firstName || "Unknown",
          lastName: lastName || "User",
        }
      });
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
        ...(bio !== undefined && { bio }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(universityId !== undefined && { university: universityId ? { connect: { id: universityId } } : { disconnect: true } }),
        tags: {
          set: [], // Clear old tags
          connectOrCreate: tagConnectOrCreate
        }
      },
    });

    // Handle Academic Data
    if (userRole === "STUDENT" || userRole === "ADMIN") {
      if (satScore !== undefined || ieltsScore !== undefined || major !== undefined) {
        await prisma.academicData.upsert({
          where: { profileId: profile.id },
          update: {
            ...(satScore !== undefined && { satScore }),
            ...(ieltsScore !== undefined && { ieltsScore }),
            ...(major !== undefined && { intendedMajor: major }),
          },
          create: {
            profileId: profile.id,
            satScore,
            ieltsScore,
            intendedMajor: major,
          }
        });
      }
    }

    // Handle Alumni Data (jobTitle mapped to major for now)
    if (userRole === "ALUMNI") {
      if (major !== undefined || isMentoring !== undefined) {
         await prisma.alumniData.upsert({
           where: { profileId: profile.id },
           update: { 
             ...(major !== undefined && { jobTitle: major }),
             ...(isMentoring !== undefined && { isMentoring })
           },
           create: { 
             profileId: profile.id, 
             jobTitle: major || "Alumnus",
             isMentoring: isMentoring || false
           }
         });
      }
    }

    return NextResponse.json({ success: true, profile: updatedProfile });

  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

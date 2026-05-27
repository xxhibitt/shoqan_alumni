import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const verifiedAlumni = await prisma.user.findMany({
      where: {
        role: 'ALUMNI',
        isVerified: true,
      },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            bio: true,
            university: true,
            financialAidStatus: true,
            gradYear: true,
            achievements: true,
            socialLinks: true,
            academicData: true,
            alumniData: true,
            tags: true
          }
        }
      }
    });

    const formattedAlumni = verifiedAlumni.map(user => ({
      userId: user.id,
      email: user.email,
      ...user.profile,
      major: user.profile?.academicData?.intendedMajor || null,
      gpa: user.profile?.academicData?.gpa || null,
      satScore: user.profile?.academicData?.satScore || null,
      ieltsScore: user.profile?.academicData?.ieltsScore || null,
      openToMentoring: user.profile?.alumniData?.isMentoring || false,
      activities: user.profile?.tags?.map(t => t.name) || [],
      countryOfStudy: user.profile?.university?.country || null,
      university: user.profile?.university?.name || null,
    }));

    return NextResponse.json(formattedAlumni, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch verified alumni:", error);
    return NextResponse.json({ error: "Failed to fetch alumni data" }, { status: 500 });
  }
}

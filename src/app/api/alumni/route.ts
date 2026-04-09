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
            major: true,
            countryOfStudy: true,
            gpa: true,
            satScore: true,
            ieltsScore: true,
            financialAidStatus: true,
            gradYear: true,
            activities: true,
            achievements: true,
            socialLinks: true,
            openToMentoring: true
          }
        }
      }
    });

    // We can map it to flatten the profile fields if needed, 
    // but returning exactly as requested is usually best.
    const formattedAlumni = verifiedAlumni.map(user => ({
      userId: user.id,
      email: user.email,
      ...user.profile,
    }));

    return NextResponse.json(formattedAlumni, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch verified alumni:", error);
    return NextResponse.json({ error: "Failed to fetch alumni data" }, { status: 500 });
  }
}

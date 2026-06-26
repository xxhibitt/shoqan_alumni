"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function submitOnboardingData(formData: any) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  const {
    role, // "STUDENT" | "ALUMNUS"
    firstName,
    lastName,
    bio,
    universityName,
    major,
    gradYear,
    financialAidStatus,
    gpa,
    satScore,
    ieltsScore,
    isMentoring,
    extracurriculars,
    awards,
    linkedin,
    telegram,
    avatarUrl,
    bannerUrl,
  } = formData;

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Find or create the university
    let universityId = null;
    if (universityName) {
      let university = await prisma.university.findFirst({
        where: { name: universityName },
      });

      if (!university) {
        university = await prisma.university.create({
          data: { name: universityName },
        });
      }
      universityId = university.id;
    }

    // Process lists and numbers
    const awardsList = awards ? awards.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
    const extraList = extracurriculars ? extracurriculars.split(",").map((s: string) => s.trim()).filter(Boolean) : [];

    const parsedGradYear = gradYear ? parseInt(gradYear, 10) : null;
    const parsedSat = satScore ? parseInt(satScore, 10) : null;
    const parsedIelts = ieltsScore ? parseFloat(ieltsScore) : null;
    const parsedGpa = gpa && gpa !== "Select GPA range" ? parseFloat(gpa.split("-")[0].replace("<", "")) : null;

    // Map role strictly to schema enum
    const dbRole = role === "ALUMNUS" ? "ALUMNI" : "STUDENT";

    // Update User (Role and Telegram)
    // We set status to PENDING so they appear in the Admin moderation queue
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: dbRole,
        telegramUsername: telegram || null,
        status: "PENDING",
      },
    });

    // Upsert Profile
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        firstName,
        lastName,
        bio,
        avatarUrl,
        bannerUrl,
        gradYear: parsedGradYear,
        universityId,
        financialAidStatus,
        awards: awardsList,
        achievements: extraList.length > 0 ? { extracurriculars: extraList } : {},
        socialLinks: linkedin ? { linkedin } : {},
      },
      update: {
        firstName,
        lastName,
        bio,
        avatarUrl,
        bannerUrl,
        gradYear: parsedGradYear,
        universityId,
        financialAidStatus,
        awards: awardsList,
        achievements: extraList.length > 0 ? { extracurriculars: extraList } : {},
        socialLinks: linkedin ? { linkedin } : {},
      },
    });

    // Upsert Academic Data
    await prisma.academicData.upsert({
      where: { profileId: profile.id },
      create: {
        profileId: profile.id,
        intendedMajor: major,
        satScore: parsedSat,
        ieltsScore: parsedIelts,
        gpa: isNaN(parsedGpa as number) ? null : parsedGpa,
      },
      update: {
        intendedMajor: major,
        satScore: parsedSat,
        ieltsScore: parsedIelts,
        gpa: isNaN(parsedGpa as number) ? null : parsedGpa,
      },
    });

    // Upsert Alumni Data if role is ALUMNUS
    if (dbRole === "ALUMNI") {
      await prisma.alumniData.upsert({
        where: { profileId: profile.id },
        create: {
          profileId: profile.id,
          isMentoring: isMentoring || false,
        },
        update: {
          isMentoring: isMentoring || false,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to submit onboarding data:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

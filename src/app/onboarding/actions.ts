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

    console.log("Attempting Prisma Save with data:", { ...formData, parsedGradYear, parsedSat, parsedIelts, parsedGpa });

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
        tags: {
          connectOrCreate: extraList.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
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
        tags: {
          set: [],
          connectOrCreate: extraList.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
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

    // Notification Trigger for Admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN', moderatorChatId: { not: null } }
    });

    if (admins.length > 0) {
      const message = `🚨 New Profile Pending Approval\n\nName: ${firstName} ${lastName}\nRole: ${dbRole}\nUniversity: ${universityName || 'Not specified'}\n\nPlease review in the Admin Dashboard.`;
      
      for (const admin of admins) {
        if (admin.moderatorChatId) {
          try {
            await fetch(`https://api.telegram.org/bot${process.env.ADMIN_TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: admin.moderatorChatId,
                text: message,
              }),
            });
          } catch (e) {
            console.error("Failed to notify admin", e);
          }
        }
      }
    }

    return { success: true, redirectTo: "/pending" };
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return { success: false, error: error.message || "Internal Server Error" };
  }
}

export async function searchUniversities(query: string) {
  try {
    const res = await fetch(`http://universities.hipolabs.com/search?name=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    const uniqueNames = Array.from(new Set(data.map((uni: any) => uni.name))) as string[];
    return uniqueNames.slice(0, 10);
  } catch (error) {
    console.error("Server Action searchUniversities Error:", error);
    return [];
  }
}

export async function getUserProfileData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      profile: {
        include: {
          university: true,
          academicData: true,
          alumniData: true,
        }
      }
    }
  });

  if (!user || !user.profile) return null;

  const p = user.profile;
  const a = p.academicData;
  const al = p.alumniData;

  const achievementsObj = p.achievements as any;
  const extracurricularsArray = achievementsObj?.extracurriculars || [];

  const socialLinksObj = p.socialLinks as any;

  return {
    role: user.role === "ALUMNI" ? "ALUMNUS" : "STUDENT",
    firstName: p.firstName || "",
    lastName: p.lastName || "",
    bio: p.bio || "",
    universityName: p.university?.name || "",
    major: a?.intendedMajor || "",
    gradYear: p.gradYear?.toString() || "",
    financialAidStatus: p.financialAidStatus || "",
    gpa: a?.gpa ? (a.gpa >= 4.0 ? "4.0" : a.gpa >= 3.5 ? "3.5-3.9" : a.gpa >= 3.0 ? "3.0-3.4" : "<3.0") : "",
    satScore: a?.satScore?.toString() || "",
    ieltsScore: a?.ieltsScore?.toString() || "",
    extracurriculars: extracurricularsArray.join(", "),
    awards: p.awards?.join(", ") || "",
    linkedin: socialLinksObj?.linkedin || "",
    telegram: user.telegramUsername || "",
    avatarUrl: p.avatarUrl || "",
    bannerUrl: p.bannerUrl || "",
    isMentoring: al?.isMentoring || false,
  };
}

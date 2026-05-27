import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // ── Auth Guard: Extract session.user.id via NextAuth ───────────────────
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized – you must be signed in." },
        { status: 401 }
      );
    }

    // @ts-ignore – id is injected by our jwt/session callbacks in [...nextauth]
    const userId: string = session.user.id;
    // @ts-ignore
    const userRole: string = session.user.role;

    if (!userId) {
      return NextResponse.json(
        { error: "Session is missing user ID." },
        { status: 401 }
      );
    }

    // ── Parse Body ────────────────────────────────────────────────────────
    const body = await req.json();

    const {
      role,
      firstName,
      lastName,
      bio,
      major,
      gradYear,
      gpa,
      university,
      financialAid,
      languageTest,
      languageScore,
      standardizedTest,
      standardizedScore,
      activities,
      openToMentoring,
      linkedin,
      telegram,
    } = body;

    // ── Parse Scores (strict dropdown values → typed DB fields) ───────────
    let parsedGpa: number | null = null;
    if (gpa && gpa !== "Non-US Scale") {
      parsedGpa = parseFloat(gpa);
      if (isNaN(parsedGpa)) parsedGpa = null;
    }

    let satScore: number | null = null;
    if (standardizedTest === "SAT" && standardizedScore) {
      satScore = parseInt(standardizedScore, 10);
      if (isNaN(satScore)) satScore = null;
    }

    let ieltsScore: number | null = null;
    if (languageTest === "IELTS" && languageScore) {
      ieltsScore = parseFloat(languageScore);
      if (isNaN(ieltsScore)) ieltsScore = null;
    }

    const parsedGradYear = gradYear ? parseInt(gradYear, 10) : null;

    // ── Social Links JSON ─────────────────────────────────────────────────
    const socialLinks: Record<string, string> = {};
    if (linkedin) socialLinks.linkedin = linkedin;
    if (telegram) socialLinks.tg = telegram;

    // ── Update User role ──────────────────────────────────────────────────
    if (role === "ALUMNI" || role === "STUDENT") {
      await prisma.user.update({
        where: { id: userId },
        data: { role },
      });
    }

    // ── Upsert Profile (create if first onboarding, update if re-editing) ─
    
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

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        bio: bio || null,
        gradYear: parsedGradYear,
        financialAidStatus: financialAid || null,
        university: universityId ? { connect: { id: universityId } } : undefined,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        tags: {
          set: [],
          connectOrCreate: tagConnectOrCreate
        }
      },
      create: {
        userId,
        firstName: firstName || "New",
        lastName: lastName || "User",
        bio: bio || null,
        gradYear: parsedGradYear,
        financialAidStatus: financialAid || null,
        universityId: universityId || null,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : {},
        tags: {
          connectOrCreate: tagConnectOrCreate
        }
      },
    });

    const finalRole = role || userRole;

    if (finalRole === "STUDENT" || finalRole === "ADMIN") {
      await prisma.academicData.upsert({
        where: { profileId: profile.id },
        update: {
          satScore,
          ieltsScore,
          gpa: parsedGpa,
          intendedMajor: major || null,
        },
        create: {
          profileId: profile.id,
          satScore,
          ieltsScore,
          gpa: parsedGpa,
          intendedMajor: major || null,
        }
      });
    }

    if (finalRole === "ALUMNI") {
      await prisma.alumniData.upsert({
        where: { profileId: profile.id },
        update: {
          jobTitle: major || null,
          isMentoring: openToMentoring ?? false,
        },
        create: {
          profileId: profile.id,
          jobTitle: major || null,
          isMentoring: openToMentoring ?? false,
        }
      });
    }

    return NextResponse.json(
      { message: "Profile saved successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Onboarding API error:", error);
    return NextResponse.json(
      { error: "Something went wrong.", details: error.message || String(error) },
      { status: 500 }
    );
  }
}

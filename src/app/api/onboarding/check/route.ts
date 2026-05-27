import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/onboarding/check
 * Returns { hasProfile: boolean } indicating whether the current
 * authenticated user has completed their onboarding profile.
 * A profile is considered "complete" if it has a major set.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // @ts-ignore – id injected by JWT callback
    const userId: string = session.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { academicData: { select: { intendedMajor: true } } },
    });

    // Profile is considered complete if major is set (onboarding was finished)
    const hasProfile = !!(profile?.academicData?.intendedMajor);

    return NextResponse.json({ hasProfile });
  } catch (error: any) {
    console.error("Profile check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Fetch the token strictly using the NextAuth secret
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  // Define auth pages (pages that should redirect to dashboard if already logged in)
  const isAuthPage =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/landing");

  // Define protected pages (pages that require a login)
  const isProtectedPage =
    pathname.startsWith("/explore") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/feed") ||
    pathname.startsWith("/saved") ||
    pathname.startsWith("/profile");

  const isOnboardingPage = pathname.startsWith("/onboarding");
  const isPendingPage = pathname.startsWith("/pending");

  // If NO token exists AND the user is trying to access a protected page, bounce to login
  if (!token) {
    if (isProtectedPage || isOnboardingPage || isPendingPage) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // Token exists
  const status = token.status as string;
  const role = token.role as string;

  // If user tries to access auth pages, redirect based on status
  if (isAuthPage) {
    if (status === "NEW") return NextResponse.redirect(new URL("/onboarding", req.url));
    if (status === "PENDING" || status === "REJECTED") return NextResponse.redirect(new URL("/pending", req.url));
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // Strict Status Gating (Admins bypass)
  if (role !== "ADMIN") {
    if (status === "NEW" && !isOnboardingPage) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    if (status === "PENDING" && !isPendingPage) {
      return NextResponse.redirect(new URL("/pending", req.url));
    }
    if (status === "REJECTED" && !isPendingPage && !isOnboardingPage) {
      return NextResponse.redirect(new URL("/pending", req.url));
    }
    if (status === "APPROVED" && (isPendingPage || isOnboardingPage)) {
      return NextResponse.redirect(new URL("/feed", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

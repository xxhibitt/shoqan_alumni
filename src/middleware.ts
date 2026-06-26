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
    pathname.startsWith("/feed");

  // Rule 1: If token exists AND the user is trying to access an auth page, redirect away
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // Rule 2: If NO token exists AND the user is trying to access a protected page, bounce to login
  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

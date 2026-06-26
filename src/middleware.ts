import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/explore", req.url));
      }
      return null;
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const isAuthPage =
          req.nextUrl.pathname.startsWith("/login") ||
          req.nextUrl.pathname.startsWith("/register");
          
        if (isAuthPage) {
          return true;
        }

        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/login",
    "/register",
    "/explore/:path*",
    "/admin/:path*",
    "/feed/:path*",
    "/connection/:path*",
  ],
};

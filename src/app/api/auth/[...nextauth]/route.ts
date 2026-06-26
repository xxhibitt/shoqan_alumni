import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@shoqanalumni.com" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        console.log("OTP Login Attempt for:", credentials?.email);

        if (!credentials?.email || !credentials?.otp) {
          throw new Error("Missing email or OTP");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        console.log("User found in DB for OTP Check:", !!user);
        console.log("Starting OTP validity compare...");

        if (!user || user.otpCode !== credentials.otp) {
          throw new Error("Invalid or missing OTP code");
        }

        if (user.otpExpires && new Date() > user.otpExpires) {
          throw new Error("OTP has expired");
        }

        // Validate and destroy OTP
        await prisma.user.update({
          where: { id: user.id },
          data: { otpCode: null, otpExpires: null }
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.role = token.role;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-override",
  debug: true,


};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

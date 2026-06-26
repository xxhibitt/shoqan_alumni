"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import nodemailer from "nodemailer";

export async function approveUser(userId: string) {
  const session = await getServerSession(authOptions);

  // Extra security check for the server action
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: "APPROVED" },
    include: { profile: true },
  });

  const firstName = updatedUser.profile?.firstName || "Alumnus";
  const email = updatedUser.email;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #10b981;">Profile Approved!</h2>
        <p style="font-size: 16px;">Hello ${firstName},</p>
        <p style="font-size: 16px; line-height: 1.5;">
          Great news! The moderation team has verified your credentials and approved your profile. You can now log in and access the exclusive Shoqan Alumni network.
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
          Welcome aboard!
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Shoqan Alumni" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: "Welcome to Shoqan Alumni – Your Profile is Approved!",
      html: htmlContent,
    });

    console.log(`[Email Sent] Approval email successfully sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send approval email to ${email}:`, error);
  }

  revalidatePath("/admin");
}

export async function rejectUser(userId: string) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: "REJECTED" },
  });

  revalidatePath("/admin");
}

export async function deleteAnnouncement(postId: string) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/admin");
    revalidatePath("/explore");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete announcement:", error);
    return { success: false, error: "Failed to delete announcement" };
  }
}

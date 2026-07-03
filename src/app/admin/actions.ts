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

export async function rejectUser(userId: string, reason: string) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { 
      status: "REJECTED",
      rejectionReason: reason 
    },
    include: { profile: true },
  });

  const firstName = updatedUser.profile?.firstName || "User";
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
        <h2 style="color: #ef4444;">Shoqan Alumni: Action Required</h2>
        <p style="font-size: 16px;">Hello ${firstName},</p>
        <p style="font-size: 16px; line-height: 1.5;">
          Your profile application was reviewed but needs adjustments before it can be approved.
        </p>
        <div style="background-color: #fee2e2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
          <p style="font-size: 15px; margin: 0;"><strong>Moderator Notes:</strong><br/>${reason}</p>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">
          Please log in to update your profile.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Shoqan Alumni" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: "Shoqan Alumni: Action Required",
      html: htmlContent,
    });

    console.log(`[Email Sent] Rejection email successfully sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send rejection email to ${email}:`, error);
  }

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

export async function hidePost(postId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) throw new Error("Post not found");
  
  // @ts-ignore
  if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.post.update({
      where: { id: postId },
      data: { isHidden: true },
    });
    revalidatePath("/explore");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to hide post:", error);
    return { success: false, error: "Failed to hide post" };
  }
}

export async function unhidePost(postId: string) {
  const session = await getServerSession(authOptions);
  
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.post.update({
      where: { id: postId },
      data: { isHidden: false },
    });
    revalidatePath("/explore");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to unhide post:", error);
    return { success: false, error: "Failed to unhide post" };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import crypto from "crypto";
import { Resend } from "resend";
import nodemailer from "nodemailer";

const resend = new Resend(process.env.RESEND_EMAIL_API);

// Configure Gmail SMTP transporter for Admin Alerts
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function submitLead(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const message = formData.get("message") as string;
    const serviceType = (formData.get("serviceType") as string) || "General Inquiry";
    
    // ── ANTI-SPAM HONEYPOT CHECK ──
    // If a bot fills out this hidden field, silently reject the submission but pretend it succeeded.
    const honeypot = formData.get("website_url") as string;
    if (honeypot) {
      console.warn("Spam bot detected via honeypot. Ignoring submission.");
      return { success: true }; 
    }

    if (!name || !email || !phone) {
      return { success: false, error: "নাম, ইমেইল এবং ফোন নম্বর আবশ্যক।" };
    }

    const client = await clerkClient();

    // Check if user exists in our DB
    let dbUser = await prisma.user.findUnique({ where: { email } });

    // Check if user exists in Clerk
    const clerkUsers = await client.users.getUserList({ emailAddress: [email] });
    const hasClerkAccount = clerkUsers.data.length > 0;

    let userCase: "new" | "db_only" | "full" = "new";

    if (!dbUser) {
      // ── CASE 3: Completely new email ──
      userCase = "new";
      const tempId = `lead_${crypto.randomBytes(8).toString("hex")}`;
      dbUser = await prisma.user.create({
        data: {
          id: tempId,
          email,
          name,
          phone,
          role: "user",
          verified: false,
        },
      });

      // Send Clerk invitation
      try {
        await client.invitations.createInvitation({
          emailAddress: email,
          publicMetadata: { firstName: name, phone },
          ignoreExisting: true,
        });
      } catch {
        // Non-critical
      }
    } else if (!hasClerkAccount) {
      // ── CASE 1: Email in DB but no Clerk account yet ──
      userCase = "db_only";
      await prisma.user.update({
        where: { email },
        data: { name, phone },
      });

      // Resend invitation
      try {
        await client.invitations.createInvitation({
          emailAddress: email,
          publicMetadata: { firstName: name, phone },
          ignoreExisting: true,
        });
      } catch {
        // Non-critical
      }
    } else {
      // ── CASE 2: Email exists AND Clerk account is linked ──
      userCase = "full";
      await prisma.user.update({
        where: { email },
        data: { name, phone, verified: true },
      });

      // Send custom email via Resend since Clerk won't send invitations to existing users
      try {
        await resend.emails.send({
          from: "CodeBlend <info@codeblend.co>",
          to: email,
          subject: `নতুন আবেদন: ${serviceType} — CodeBlend`,
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #10b981, #0d9488); display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">C</div>
                <h2 style="margin: 12px 0 4px; color: #0f172a; font-size: 20px;">CodeBlend</h2>
              </div>

              <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                হ্যালো <strong>${name}</strong>,
              </p>
              <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                আপনার একটি নতুন আবেদন সফলভাবে জমা হয়েছে।
              </p>

              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0;">
                <div style="color: #166534; font-size: 13px; font-weight: 600; margin-bottom: 4px;">📋 সার্ভিস</div>
                <div style="color: #0f172a; font-size: 16px; font-weight: 700;">${serviceType}</div>
              </div>

              ${message ? `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
                <div style="color: #64748b; font-size: 13px; font-weight: 600; margin-bottom: 4px;">💬 মেসেজ</div>
                <div style="color: #334155; font-size: 14px; line-height: 1.5;">${message}</div>
              </div>` : ""}

              <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                আবেদন-এর স্ট্যাটাস দেখতে আপনার একাউন্টে লগইন করুন।
              </p>

              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://codeblend.co"}/sign-in" 
                 style="display: block; text-align: center; background: #10b981; color: white; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; margin-top: 24px;">
                🚀 লগইন করুন
              </a>

              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
                © ${new Date().getFullYear()} CodeBlend — Digital Solutions
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send email via Resend:", emailError);
        // Non-critical — request is still saved
      }
    }

    // Always create a new ServiceRequest
    await prisma.serviceRequest.create({
      data: {
        applicantId: dbUser.id,
        serviceType,
        message,
      },
    });

    // ── ADMIN ALERT VIA NODEMAILER ──
    try {
      const alertEmailSetting = await prisma.setting.findUnique({ where: { key: "ADMIN_ALERT_EMAIL" } });
      const alertEmail = alertEmailSetting?.value || "mdshehab204@gmail.com";

      await transporter.sendMail({
        from: '"CodeBlend System" <hello@codeblend.co>', 
        to: alertEmail,
        subject: `🚀 New Request: ${serviceType}`,
        html: `
          <h3>New Request Submitted!</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Service Requested:</strong> ${serviceType}</p>
          <p><strong>Message:</strong> ${message || "N/A"}</p>
          <hr/>
          <p><small>User Type: ${userCase}</small></p>
        `,
      });
    } catch (adminMailError) {
      console.error("Failed to send admin email alert:", adminMailError);
      // Non-critical, do not block the success return
    }

    return { success: true, userCase };
  } catch (error: any) {
    console.error("Error submitting request:", error);
    return { success: false, error: error.message || "আবেদন জমা দিতে সমস্যা হয়েছে।" };
  }
}

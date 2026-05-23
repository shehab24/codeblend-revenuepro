"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_EMAIL_API);

export async function adminUpdateServiceRequest(formData: FormData) {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const totalAmount = parseFloat(formData.get("totalAmount") as string) || 0;
  const paidAmount = parseFloat(formData.get("paidAmount") as string) || 0;
  const deliveryDateString = formData.get("deliveryDate") as string;

  const deliveryDate = deliveryDateString ? new Date(deliveryDateString) : null;

  await prisma.serviceRequest.update({
    where: { id },
    data: {
      status,
      totalAmount,
      paidAmount,
      deliveryDate,
    },
  });

  revalidatePath("/dashboard/admin/requests");
  revalidatePath("/dashboard/user/requests");
}

export async function adminSendEmailToUser({
  requestId,
  recipientEmail,
  recipientName,
  subject,
  body,
}: {
  requestId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
}): Promise<{ success: boolean; error?: string }> {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  if (!recipientEmail || !subject || !body) {
    return { success: false, error: "Missing required fields." };
  }

  // Convert plain-text line breaks to <br> for email HTML
  const htmlBody = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;">
      <div style="text-align:center;margin-bottom:28px;">
        <div style="width:48px;height:48px;line-height:48px;border-radius:12px;background:linear-gradient(135deg,#10b981,#0d9488);display:inline-block;text-align:center;color:white;font-weight:bold;font-size:20px;margin:0 auto;">C</div>
        <h2 style="margin:12px 0 4px;color:#0f172a;font-size:20px;">CodeBlend — RevenuePro</h2>
      </div>
      <p style="color:#334155;font-size:15px;line-height:1.7;white-space:pre-wrap;">${htmlBody}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />
      <p style="color:#94a3b8;font-size:12px;text-align:center;">
        This email was sent by the CodeBlend admin team regarding your service request.<br/>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://codeblend.co"}/dashboard/user/requests" style="color:#10b981;">View your requests</a>
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "CodeBlend <info@codeblend.co>",
      to: recipientEmail,
      subject,
      html,
    });
    return { success: true };
  } catch (err: any) {
    console.error("adminSendEmailToUser error:", err);
    return { success: false, error: err?.message || "Failed to send email." };
  }
}


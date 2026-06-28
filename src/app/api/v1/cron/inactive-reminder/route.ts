import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_EMAIL_API);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    const expectedSecret = process.env.CRON_SECRET || "codeblend-default-cron-secret-123";

    if (secret !== expectedSecret) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch settings
    const [enabledSetting, daysSetting, subjectSetting, bodySetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "INACTIVE_REMINDER_ENABLED" } }),
      prisma.setting.findUnique({ where: { key: "INACTIVE_REMINDER_DAYS" } }),
      prisma.setting.findUnique({ where: { key: "INACTIVE_REMINDER_SUBJECT" } }),
      prisma.setting.findUnique({ where: { key: "INACTIVE_REMINDER_BODY" } }),
    ]);

    const enabled = (enabledSetting?.value || "false") === "true";
    if (!enabled) {
      return NextResponse.json({ success: true, message: "Reminder automation is currently disabled." });
    }

    const days = parseInt(daysSetting?.value || "2") || 2;
    const reminderSubject = subjectSetting?.value || "Verify your RevenuePro plugin settings on {{domain}}";
    const reminderBody = bodySetting?.value || 
      "Hi there,\n\nWe noticed that your RevenuePro plugin is not online or hasn't sync'd any orders recently for {{domain}}.\n\nTo start tracking your Cash-On-Delivery orders and protecting your store against courier frauds, please navigate to your WordPress dashboard settings and verify your license.\n\nIf you need any help, feel free to reply to this email!\n\nBest regards,\nCodeBlend Team";

    const thresholdDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // 2. Find licenses matching inactivity criteria:
    // - Active status
    // - Created at least X days ago
    // - No "success" verification pings in the last X days
    const licenses = await prisma.license.findMany({
      where: {
        status: "active",
        createdAt: {
          lt: thresholdDate,
        },
        NOT: {
          logs: {
            some: {
              status: "success",
              timestamp: {
                gte: thresholdDate,
              },
            },
          },
        },
      },
      include: {
        user: true,
        logs: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    const emailsSent: string[] = [];

    for (const license of licenses) {
      // 3. Ensure a reminder was not sent already within the trigger period
      const lastReminder = license.logs.find(
        (log) => log.status === "reminder_sent" && log.timestamp >= thresholdDate
      );

      if (lastReminder) {
        continue;
      }

      const recipientEmail = license.customerEmail || license.user?.email;
      if (!recipientEmail) {
        continue;
      }

      // Replace placeholders
      const subject = reminderSubject.replace(/\{\{domain\}\}/g, license.domain);
      const bodyText = reminderBody.replace(/\{\{domain\}\}/g, license.domain);

      // Convert line breaks to HTML tags
      const htmlBody = bodyText
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
          <div style="color:#334155;font-size:15px;line-height:1.7;">
            ${htmlBody}
          </div>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
            This is an automated reminder regarding your active RevenuePro subscription.
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

        // 4. Log the sent reminder to prevent immediate duplicate sends
        await prisma.verificationLog.create({
          data: {
            licenseId: license.id,
            status: "reminder_sent",
            ipAddress: "cron-automation",
            userAgent: "System Scheduler",
          },
        });

        emailsSent.push(recipientEmail);
      } catch (err) {
        console.error(`Inactivity reminder error for ${recipientEmail}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Checked ${licenses.length} licenses. Sent ${emailsSent.length} reminders.`,
      emails: emailsSent,
    });
  } catch (error: any) {
    console.error("Cron Inactive Reminder Exception:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

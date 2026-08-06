"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_EMAIL_API);

// Helper to check admin authorization
async function ensureAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const caller = await prisma.user.findUnique({ where: { id: userId } });
  if (caller?.role !== "admin" && caller?.role !== "ADMIN") {
    throw new Error("Unauthorized: Administrative privilege required.");
  }
}

export async function createGuestInvoiceOrQuotation(formData: FormData) {
  await ensureAdmin();

  const type = formData.get("type") as string; // "guest_invoice" | "guest_quotation"
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || "";
  const notes = (formData.get("notes") as string) || "";
  
  // Parse multiple line items
  const itemsJsonStr = formData.get("items") as string;
  let items = [];
  try {
    items = itemsJsonStr ? JSON.parse(itemsJsonStr) : [];
  } catch (err) {
    throw new Error("Invalid line items format.");
  }

  if (!type || !name || items.length === 0) {
    throw new Error("Missing required fields: Document Type, Customer Name, and at least one Line Item are required.");
  }

  // Calculate sum of item amounts
  const totalAmount = items.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0);
  const paid = parseFloat(formData.get("paid") as string) || 0;

  // Use description of first item as fallback title
  const title = items[0]?.description || "Services";

  const invoice = await prisma.invoice.create({
    data: {
      userId: null,
      type,
      title,
      amount: totalAmount,
      paid: type === "guest_quotation" ? 0 : paid,
      notes,
      name,
      email,
      phone,
      items: items, // Save parsed JSON array
    },
  });

  revalidatePath("/dashboard/admin/invoices");
  return { id: invoice.id };
}

export async function updateGuestInvoiceOrQuotation(id: string, formData: FormData) {
  await ensureAdmin();

  const type = formData.get("type") as string;
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || "";
  const notes = (formData.get("notes") as string) || "";

  // Parse multiple line items
  const itemsJsonStr = formData.get("items") as string;
  let items = [];
  try {
    items = itemsJsonStr ? JSON.parse(itemsJsonStr) : [];
  } catch (err) {
    throw new Error("Invalid line items format.");
  }

  if (!type || !name || items.length === 0) {
    throw new Error("Missing required fields: Document Type, Customer Name, and at least one Line Item are required.");
  }

  // Calculate sum of item amounts
  const totalAmount = items.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0);
  const paid = parseFloat(formData.get("paid") as string) || 0;

  // Use description of first item as fallback title
  const title = items[0]?.description || "Services";

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      type,
      title,
      amount: totalAmount,
      paid: type === "guest_quotation" ? 0 : paid,
      notes,
      name,
      email,
      phone,
      items: items, // Save parsed JSON array
    },
  });

  revalidatePath("/dashboard/admin/invoices");
  return { id: invoice.id };
}

export async function deleteGuestInvoiceOrQuotation(id: string) {
  await ensureAdmin();

  await prisma.invoice.delete({
    where: { id },
  });

  revalidatePath("/dashboard/admin/invoices");
  return { success: true };
}

export async function sendInvoiceOrQuotationEmail(id: string, pdfBase64?: string, pdfFilename?: string) {
  await ensureAdmin();

  const invoice = await prisma.invoice.findUnique({
    where: { id },
  });

  if (!invoice) throw new Error("Document not found.");
  if (!invoice.email) throw new Error("Client email is missing.");

  const isQuotation = invoice.type === "guest_quotation";
  const docTypeName = isQuotation ? "Quotation" : "Invoice";
  
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://codeblend.co";
  const viewUrl = `${siteUrl}/share/invoice/${invoice.id}`;
  
  const formattedAmount = `৳${invoice.amount.toFixed(2)}`;
  const balanceDue = `৳${(invoice.amount - invoice.paid).toFixed(2)}`;

  // Parse items if they exist
  let itemsList: any[] = [];
  if (invoice.items && Array.isArray(invoice.items)) {
    itemsList = invoice.items;
  }

  // Build items HTML table rows
  let itemsTableRowsHtml = "";
  if (itemsList.length > 0) {
    itemsList.forEach((item) => {
      itemsTableRowsHtml += `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; text-align: left; font-size: 13px; color: #334155;">
            ${item.description}
          </td>
          <td style="padding: 10px 0; text-align: center; font-size: 13px; color: #64748b;">
            ${item.quantity}
          </td>
          <td style="padding: 10px 0; text-align: right; font-size: 13px; color: #64748b;">
            ৳${(parseFloat(item.rate) || 0).toFixed(2)}
          </td>
          <td style="padding: 10px 0; text-align: right; font-size: 13px; font-weight: bold; color: #0f172a;">
            ৳${(parseFloat(item.amount) || 0).toFixed(2)}
          </td>
        </tr>
      `;
    });
  } else {
    // Fallback for single-item documents
    itemsTableRowsHtml = `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 0; text-align: left; font-size: 13px; color: #334155;" colspan="3">
          ${invoice.title}
        </td>
        <td style="padding: 10px 0; text-align: right; font-size: 13px; font-weight: bold; color: #0f172a;">
          ${formattedAmount}
        </td>
      </tr>
    `;
  }

  const emailHtml = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;">
      <div style="text-align:center;margin-bottom:28px;">
        <div style="width:48px;height:48px;line-height:48px;border-radius:12px;background:linear-gradient(135deg,#10b981,#0d9488);display:inline-block;text-align:center;color:white;font-weight:bold;font-size:20px;margin:0 auto;">C</div>
        <h2 style="margin:12px 0 4px;color:#0f172a;font-size:20px;">CodeBlend — Digital Solutions</h2>
      </div>
      
      <p style="color:#334155;font-size:15px;line-height:1.7;">Hello <strong>${invoice.name || "Valued Customer"}</strong>,</p>
      
      <p style="color:#334155;font-size:15px;line-height:1.7;">
        ${isQuotation 
          ? "Here is your quotation. Please find the estimation details and the attached PDF document for your review." 
          : "Here is your invoice. Please find the billing details and the attached PDF document for your payment/records."}
      </p>

      <!-- Items Table -->
      <table style="width:100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
        <thead>
          <tr style="border-bottom: 2px solid #e2e8f0; color: #94a3b8; font-weight: bold; text-transform: uppercase;">
            <th style="padding: 8px 0; text-align: left;">Item Description</th>
            <th style="padding: 8px 0; text-align: center; width: 60px;">Qty</th>
            <th style="padding: 8px 0; text-align: right; width: 80px;">Rate</th>
            <th style="padding: 8px 0; text-align: right; width: 90px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsTableRowsHtml}
        </tbody>
      </table>

      <!-- Summary -->
      <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:12px;padding:20px;margin:24px 0;">
        <table style="width:100%;font-size:14px;color:#475569;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;font-weight:600;color:#0f172a;">Total Amount:</td>
            <td style="padding:6px 0;text-align: right; font-weight:bold;color:#0f172a;">${formattedAmount}</td>
          </tr>
          ${!isQuotation ? `
          <tr>
            <td style="padding:6px 0;font-weight:600;color:#0f172a;">Amount Paid:</td>
            <td style="padding:6px 0;text-align: right; color:#10b981;font-weight:bold;">৳${invoice.paid.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:600;color:#0f172a;">Balance Due:</td>
            <td style="padding:6px 0;text-align: right; color:#e11d48;font-weight:bold;">${balanceDue}</td>
          </tr>
          ` : ""}
        </table>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${viewUrl}" style="background:#10b981;color:#ffffff;text-decoration:none;padding:12px 28px;font-size:15px;font-weight:bold;border-radius:10px;display:inline-block;box-shadow:0 4px 6px -1px rgba(16,185,129,0.2);">
          View & Download ${docTypeName}
        </a>
      </div>

      ${invoice.notes ? `
        <p style="color:#64748b;font-size:13px;line-height:1.6;font-style:italic;margin-top:20px;">
          Notes: ${invoice.notes}
        </p>
      ` : ""}

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />
      <p style="color:#94a3b8;font-size:12px;text-align:center;line-height:1.6;">
        This email was sent by the CodeBlend administration team.<br/>
        If you have any questions, reply to this email or contact <a href="mailto:contact@codeblend.co" style="color:#10b981;">contact@codeblend.co</a>.
      </p>
    </div>
  `;

  try {
    const payload: any = {
      from: "CodeBlend <info@codeblend.co>",
      to: invoice.email,
      subject: `Official CodeBlend ${docTypeName} — #${invoice.id.slice(-8).toUpperCase()}`,
      html: emailHtml,
    };

    if (pdfBase64 && pdfFilename) {
      payload.attachments = [
        {
          filename: pdfFilename,
          content: Buffer.from(pdfBase64, "base64"),
        }
      ];
    }

    await resend.emails.send(payload);
    return { success: true };
  } catch (err: any) {
    console.error("sendInvoiceOrQuotationEmail error:", err);
    throw new Error(err?.message || "Failed to send email via Resend.");
  }
}

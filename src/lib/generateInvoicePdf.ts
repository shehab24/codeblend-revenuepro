import { jsPDF } from "jspdf";
import { getCurrencySymbol } from "./currency";

export type InvoicePdfData = {
  id: string;
  type: string;
  title: string;
  amount: number;
  paid: number;
  notes?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  currency?: string | null;
  preparedBy?: string | null;
  preparedByEmail?: string | null;
  paymentDetails?: string | null;
  address?: string | null;
  billingMonth?: string | null;
  items?: any;
  createdAt?: Date | string | null;
};

export function generateInvoicePdf(invoice: InvoicePdfData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const isQuotation = invoice.type === "guest_quotation";
  const docTypeName = isQuotation ? "QUOTATION" : "INVOICE";
  const docNumber = `${isQuotation ? "QT" : "INV"}-${invoice.id.slice(-8).toUpperCase()}`;
  const docDate = invoice.createdAt ? new Date(invoice.createdAt) : new Date();
  const dateStr = docDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const sym = getCurrencySymbol(invoice.currency);

  const totalInvoiced = invoice.amount;
  const totalPaid = isQuotation ? 0 : invoice.paid;
  const balanceDue = Math.max(0, totalInvoiced - totalPaid);

  const startX = 15;
  const endX = 195;
  const contentWidth = endX - startX; // 180mm

  let y = 16;

  // ── HEADER ──
  // Logo Box "C" (10x10mm rounded square)
  doc.setFillColor(16, 185, 129); // Emerald 600
  doc.roundedRect(startX, y, 10, 10, 2.5, 2.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("C", startX + 5, y + 7.2, { align: "center" });

  // Company Title
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("CodeBlend", startX + 13, y + 5);

  // Subtitle "Digital Solutions"
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("Digital Solutions", startX + 13, y + 9);

  // Sub-info under logo
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Official Billing & Estimate Statement", startX, y + 16);
  doc.text("contact@codeblend.co | Dhaka, Bangladesh", startX, y + 20.5);

  // Right Header Metadata
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(docTypeName, endX, y + 6, { align: "right" });

  let metaY = y + 11.5;
  doc.setFontSize(8.5);

  // Doc Number
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`${isQuotation ? "Quotation" : "Invoice"} #:`, endX - 38, metaY);
  doc.setFont("courier", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(docNumber, endX, metaY, { align: "right" });
  metaY += 4.5;

  // Date
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Date:", endX - 38, metaY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(dateStr, endX, metaY, { align: "right" });
  metaY += 4.5;

  // Billing Month
  if (invoice.billingMonth) {
    const [year, month] = invoice.billingMonth.split("-");
    const monthLabel = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Billing Month:", endX - 38, metaY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(monthLabel, endX, metaY, { align: "right" });
  }

  y += 26;

  // Divider Line
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.4);
  doc.line(startX, y, endX, y);

  y += 8;

  // ── BILLED TO / BILLED BY CARDS ──
  const cardGap = 8;
  const cardWidth = (contentWidth - cardGap) / 2; // 86mm each
  const cardY = y;

  // Prepare Billed To lines
  const billedToLines: { text: string; isName?: boolean; isEmail?: boolean; isPhone?: boolean }[] = [];
  if (invoice.name) billedToLines.push({ text: invoice.name, isName: true });
  if (invoice.address) {
    const splitAddr = doc.splitTextToSize(invoice.address, cardWidth - 12);
    splitAddr.forEach((line: string) => billedToLines.push({ text: line }));
  }
  if (invoice.email) billedToLines.push({ text: invoice.email, isEmail: true });
  if (invoice.phone) billedToLines.push({ text: invoice.phone, isPhone: true });

  // Prepare Billed By lines
  const billedByLines: { text: string; isName?: boolean; isEmail?: boolean }[] = [];
  billedByLines.push({ text: invoice.preparedBy || "CodeBlend Digital Solutions", isName: true });
  if (invoice.preparedByEmail) billedByLines.push({ text: invoice.preparedByEmail, isEmail: true });

  // Calculate card heights
  const billedToHeight = 14 + billedToLines.length * 4.6;
  const billedByHeight = 14 + billedByLines.length * 4.6;
  const cardHeight = Math.max(28, billedToHeight, billedByHeight);

  // Left Card (BILLED TO)
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(startX, cardY, cardWidth, cardHeight, 3, 3, "F");
  doc.setDrawColor(241, 245, 249); // Slate 100
  doc.roundedRect(startX, cardY, cardWidth, cardHeight, 3, 3, "S");

  // BILLED TO label
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(isQuotation ? "PREPARED FOR" : "BILLED TO", startX + 5, cardY + 6.5);

  let cY = cardY + 12;
  billedToLines.forEach((item) => {
    if (item.isName) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text(item.text, startX + 5, cY);
      cY += 5;
    } else if (item.isEmail) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Email: ${item.text}`, startX + 5, cY);
      cY += 4.5;
    } else if (item.isPhone) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Phone: ${item.text}`, startX + 5, cY);
      cY += 4.5;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85); // Slate 700
      doc.text(item.text, startX + 5, cY);
      cY += 4.5;
    }
  });

  // Right Card (BILLED BY)
  const rightCardX = startX + cardWidth + cardGap;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightCardX, cardY, cardWidth, cardHeight, 3, 3, "F");
  doc.setDrawColor(241, 245, 249);
  doc.roundedRect(rightCardX, cardY, cardWidth, cardHeight, 3, 3, "S");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(148, 163, 184);
  doc.text("BILLED BY", rightCardX + 5, cardY + 6.5);

  cY = cardY + 12;
  billedByLines.forEach((item) => {
    if (item.isName) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(item.text, rightCardX + 5, cY);
      cY += 5;
    } else if (item.isEmail) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Email: ${item.text}`, rightCardX + 5, cY);
      cY += 4.5;
    }
  });

  y = cardY + cardHeight + 10;

  // ── LINE ITEMS TABLE ──
  let itemsList: any[] = [];
  if (invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0) {
    itemsList = invoice.items;
  } else {
    itemsList = [{ description: invoice.title || "Services", quantity: 1, rate: invoice.amount, amount: invoice.amount }];
  }

  // Table Header
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(startX, y + 6, endX, y + 6);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text("ITEM DESCRIPTION", startX, y + 4);
  doc.text("QTY / HRS", 130, y + 4, { align: "center" });
  doc.text("RATE", 160, y + 4, { align: "right" });
  doc.text("TOTAL", endX, y + 4, { align: "right" });

  y += 8;

  // Table Rows
  itemsList.forEach((item) => {
    const desc = item.description || "";
    const qty = item.quantity !== undefined ? item.quantity : 1;
    const rate = parseFloat(item.rate) || 0;
    const amount = parseFloat(item.amount) || 0;

    const descLines = doc.splitTextToSize(desc, 105);
    const rowHeight = Math.max(9, descLines.length * 4.5 + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59); // Slate 800

    let lineY = y + 5;
    descLines.forEach((dLine: string) => {
      doc.text(dLine, startX, lineY);
      lineY += 4.5;
    });

    doc.setFont("courier", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(String(qty), 130, y + 5, { align: "center" });
    doc.text(`${sym}${rate.toFixed(2)}`, 160, y + 5, { align: "right" });

    doc.setFont("courier", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`${sym}${amount.toFixed(2)}`, endX, y + 5, { align: "right" });

    y += rowHeight;
    doc.setDrawColor(241, 245, 249); // Slate 100
    doc.setLineWidth(0.3);
    doc.line(startX, y, endX, y);
  });

  y += 6;

  // ── FINANCIAL SUMMARY ──
  const summaryX = 120;

  // Total Invoiced Row
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(isQuotation ? "Estimated Cost:" : "Total Invoiced:", summaryX, y + 4);
  doc.setFont("courier", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${sym}${totalInvoiced.toFixed(2)}`, endX, y + 4, { align: "right" });
  y += 6;

  if (!isQuotation) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Total Paid:", summaryX, y + 4);
    doc.setFont("courier", "bold");
    doc.setTextColor(16, 185, 129); // Emerald 600 accent for paid
    doc.text(`- ${sym}${totalPaid.toFixed(2)}`, endX, y + 4, { align: "right" });
    y += 7;

    // Single clean divider line above Balance Due
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(summaryX, y, endX, y);
    y += 2;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Balance Due:", summaryX, y + 4);
    doc.setFont("courier", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`${sym}${balanceDue.toFixed(2)}`, endX, y + 4, { align: "right" });
    y += 12;
  } else {
    y += 6;
  }

  // ── PAYMENT INFORMATION / BANK DETAILS ──
  if (invoice.paymentDetails) {
    const bankBoxY = y;
    const bankLines = invoice.paymentDetails.split("\n");
    const bankBoxHeight = 12 + bankLines.length * 4.6;

    doc.setFillColor(248, 250, 252); // Slate 50
    doc.roundedRect(startX, bankBoxY, contentWidth, bankBoxHeight, 3, 3, "F");
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.roundedRect(startX, bankBoxY, contentWidth, bankBoxHeight, 3, 3, "S");

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text("PAYMENT INFORMATION / BANK DETAILS:", startX + 5, bankBoxY + 6.5);

    doc.setFont("courier", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85); // Slate 700

    let bY = bankBoxY + 11.5;
    bankLines.forEach((bLine) => {
      doc.text(bLine, startX + 5, bY);
      bY += 4.6;
    });

    y = bankBoxY + bankBoxHeight + 8;
  }

  // ── NOTES / TERMS SECTION ──
  if (invoice.notes) {
    const notesY = y;
    const noteLines = doc.splitTextToSize(invoice.notes, contentWidth - 10);
    const notesHeight = 9 + noteLines.length * 4.2;

    doc.setFillColor(248, 250, 252); // Light Slate 50
    doc.roundedRect(startX, notesY, contentWidth, notesHeight, 3, 3, "F");
    doc.setDrawColor(241, 245, 249);
    doc.roundedRect(startX, notesY, contentWidth, notesHeight, 3, 3, "S");

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text("NOTES / TERMS:", startX + 5, notesY + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    let nY = notesY + 10;
    noteLines.forEach((nLine: string) => {
      doc.text(nLine, startX + 5, nY);
      nY += 4.2;
    });

    y = notesY + notesHeight + 8;
  }

  // ── FOOTER ──
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(startX, 280, endX, 280);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Thank you for trusting CodeBlend. For inquiries or questions, please contact contact@codeblend.co.", 105, 285.5, { align: "center" });

  return doc;
}

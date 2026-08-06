"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { deleteGuestInvoiceOrQuotation, sendInvoiceOrQuotationEmail } from "./actions";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

type InvoiceItem = {
  id: string;
  type: string;
  title: string;
  amount: number;
  paid: number;
  notes: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  initialInvoices: InvoiceItem[];
};

export function ClientInvoicesTable({ initialInvoices }: Props) {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [emailLoading, setEmailLoading] = useState<Record<string, string>>({}); // id -> "idle" | "sending" | "sent" | "error"
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleSendEmail = async (id: string) => {
    setEmailLoading((prev) => ({ ...prev, [id]: "sending" }));
    try {
      const resPage = await fetch(`/share/invoice/${id}`);
      if (!resPage.ok) throw new Error("Failed to fetch document layout for PDF conversion");
      const htmlText = await resPage.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");
      const card = doc.querySelector(".invoice-card");
      if (!card) throw new Error("Document card container not found");

      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.width = "800px";
      tempDiv.style.top = "-9999px";
      tempDiv.style.left = "-9999px";
      tempDiv.appendChild(card.cloneNode(true));
      document.body.appendChild(tempDiv);

      const controls = tempDiv.querySelector("#controls-bar");
      if (controls) controls.remove();

      const invoiceItem = invoices.find((i) => i.id === id);
      const isQuo = invoiceItem?.type === "guest_quotation";
      const docNumber = `${isQuo ? "QT" : "INV"}-${id.slice(-8).toUpperCase()}`;
      const filename = `${docNumber}.pdf`;

      const canvas = await html2canvas(tempDiv, {
        scale: 2.0,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
      }

      const pdfDataUri = pdf.output("datauristring");
      const pdfBase64 = pdfDataUri.split(";base64,")[1];

      tempDiv.remove();

      const res = await sendInvoiceOrQuotationEmail(id, pdfBase64, filename);
      if (res.success) {
        setEmailLoading((prev) => ({ ...prev, [id]: "sent" }));
        setTimeout(() => {
          setEmailLoading((prev) => ({ ...prev, [id]: "idle" }));
        }, 3000);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to send email.");
      setEmailLoading((prev) => ({ ...prev, [id]: "error" }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) return;

    startTransition(async () => {
      try {
        const res = await deleteGuestInvoiceOrQuotation(id);
        if (res.success) {
          setInvoices((prev) => prev.filter((inv) => inv.id !== id));
        }
      } catch (err: any) {
        alert(err.message || "Failed to delete document.");
      }
    });
  };

  // Filter logic
  const filtered = invoices.filter((inv) => {
    const query = search.toLowerCase();
    const nameMatch = (inv.name || "").toLowerCase().includes(query);
    const emailMatch = (inv.email || "").toLowerCase().includes(query);
    const phoneMatch = (inv.phone || "").toLowerCase().includes(query);
    const titleMatch = (inv.title || "").toLowerCase().includes(query);
    const idMatch = inv.id.toLowerCase().includes(query);

    const matchesSearch = nameMatch || emailMatch || phoneMatch || titleMatch || idMatch;

    if (typeFilter === "invoice") {
      return matchesSearch && inv.type === "guest_invoice";
    }
    if (typeFilter === "quotation") {
      return matchesSearch && inv.type === "guest_quotation";
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by client, title, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-slate-400 transition"
          />
          <span className="absolute left-3.5 top-2.5 text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-slate-400 transition cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="invoice">Invoices Only</option>
          <option value="quotation">Quotations Only</option>
        </select>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-slate-100 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <th className="p-4 w-1/4">Customer Info</th>
              <th className="p-4 w-1/4">Details</th>
              <th className="p-4 text-center">Type</th>
              <th className="p-4 text-right">Amounts</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs">
            {filtered.length > 0 ? (
              filtered.map((inv) => {
                const isQuotation = inv.type === "guest_quotation";
                const isPaid = !isQuotation && inv.amount <= inv.paid;
                const statusText = isQuotation
                  ? "Estimate"
                  : isPaid
                  ? "Paid"
                  : inv.paid > 0
                  ? "Partial"
                  : "Unpaid";

                const emailState = emailLoading[inv.id] || "idle";

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 align-top">
                      <div className="font-extrabold text-slate-900">{inv.name || "N/A"}</div>
                      {inv.email && <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{inv.email}</div>}
                      {inv.phone && <div className="text-[10px] text-slate-400 font-medium mt-0.5">📞 {inv.phone}</div>}
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-bold text-slate-800 line-clamp-1">{inv.title}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">ID: #{inv.id.slice(-8).toUpperCase()}</div>
                    </td>
                    <td className="p-4 text-center align-top whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isQuotation
                            ? "bg-sky-50 text-sky-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {isQuotation ? "Quotation" : "Invoice"}
                      </span>
                    </td>
                    <td className="p-4 text-right align-top whitespace-nowrap">
                      <div className="font-extrabold text-slate-900">৳{inv.amount.toFixed(2)}</div>
                      {!isQuotation ? (
                        <>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            Paid: ৳{inv.paid.toFixed(2)}
                          </div>
                          <div className={`text-[10px] font-bold mt-0.5 ${isPaid ? "text-emerald-600" : "text-rose-600"}`}>
                            {statusText}
                          </div>
                        </>
                      ) : (
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          Estimate Only
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center align-top whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Shared Link */}
                        <a
                          href={`/share/invoice/${inv.id}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View document public link"
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>

                        {/* Download PDF Button */}
                        <button
                          type="button"
                          disabled={downloadingId !== null}
                          onClick={async () => {
                            try {
                              setDownloadingId(inv.id);
                              
                              const res = await fetch(`/share/invoice/${inv.id}`);
                              if (!res.ok) throw new Error("Failed to fetch document");
                              
                              const htmlText = await res.text();
                              const parser = new DOMParser();
                              const doc = parser.parseFromString(htmlText, "text/html");
                              const card = doc.querySelector(".invoice-card");
                              if (!card) throw new Error("Document card container not found");

                              const tempDiv = document.createElement("div");
                              tempDiv.style.position = "absolute";
                              tempDiv.style.width = "800px";
                              tempDiv.style.top = "-9999px";
                              tempDiv.style.left = "-9999px";
                              
                              tempDiv.appendChild(card.cloneNode(true));
                              document.body.appendChild(tempDiv);

                              const controls = tempDiv.querySelector("#controls-bar");
                              if (controls) controls.remove();

                              const docNumber = `${isQuotation ? "QT" : "INV"}-${inv.id.slice(-8).toUpperCase()}`;
                              const filename = `${docNumber}.pdf`;

                              const canvas = await html2canvas(tempDiv, {
                                scale: 2.5,
                                useCORS: true,
                                logging: false
                              });

                              const imgData = canvas.toDataURL("image/jpeg", 0.98);
                              const pdf = new jsPDF("p", "mm", "a4");

                              const pageWidth = 210;
                              const pageHeight = 297;
                              const margin = 10;
                              const imgWidth = pageWidth - (margin * 2);
                              const imgHeight = (canvas.height * imgWidth) / canvas.width;

                              let heightLeft = imgHeight;
                              let position = margin;

                              pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
                              heightLeft -= (pageHeight - margin * 2);

                              while (heightLeft > 0) {
                                position = heightLeft - imgHeight + margin;
                                pdf.addPage();
                                pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
                                heightLeft -= (pageHeight - margin * 2);
                              }

                              pdf.save(filename);
                              tempDiv.remove();
                            } catch (err: any) {
                              alert(err.message || "Failed to download PDF.");
                            } finally {
                              setDownloadingId(null);
                            }
                          }}
                          title={downloadingId === inv.id ? "Generating PDF..." : "Download PDF directly"}
                          className={`p-1.5 rounded-lg transition ${
                            downloadingId === inv.id 
                              ? "bg-slate-50 text-emerald-600 animate-pulse" 
                              : "hover:bg-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer disabled:opacity-50"
                          }`}
                        >
                          {downloadingId === inv.id ? (
                            <svg className="w-4 h-4 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          )}
                        </button>

                        {/* Edit */}
                        <Link
                          href={`/dashboard/admin/invoices/${inv.id}/edit`}
                          title="Edit document"
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>

                        {/* Send Email */}
                        {inv.email ? (
                          <button
                            type="button"
                            onClick={() => handleSendEmail(inv.id)}
                            disabled={emailState === "sending"}
                            title="Send invoice via email"
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              emailState === "sending"
                                ? "bg-slate-50 text-slate-400"
                                : emailState === "sent"
                                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                : emailState === "error"
                                ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
                                : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            {emailState === "sending" ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : emailState === "sent" ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        ) : (
                          <span
                            title="Add email to send"
                            className="p-1.5 text-slate-300 rounded-lg cursor-not-allowed"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </span>
                        )}

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDelete(inv.id)}
                          title="Delete document"
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">
                  No guest invoices or quotations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

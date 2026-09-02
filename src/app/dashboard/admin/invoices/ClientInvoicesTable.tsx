"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { deleteGuestInvoiceOrQuotation, sendInvoiceOrQuotationEmail, markInvoicePaid } from "./actions";
import { getCurrencySymbol } from "@/lib/currency";
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
  currency: string | null;
  lastEmailedAt: Date | null;
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

  // Pay modal state
  const [payModal, setPayModal] = useState<{ id: string; name: string | null; amount: number; currentPaid: number; currency: string | null } | null>(null);
  const [payInput, setPayInput] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{ id: string; email: string; name: string | null; docRef: string } | null>(null);

  const openEmailConfirm = (inv: InvoiceItem) => {
    if (!inv.email) return;
    const isQuo = inv.type === "guest_quotation";
    const docRef = `${isQuo ? "QT" : "INV"}-${inv.id.slice(-8).toUpperCase()}`;
    setConfirmModal({ id: inv.id, email: inv.email, name: inv.name, docRef });
  };

  // Track which invoices have been emailed (in-session + from DB)
  const [emailedAt, setEmailedAt] = useState<Record<string, string | null>>(
    () => Object.fromEntries(initialInvoices.map((inv) => [
      inv.id,
      inv.lastEmailedAt ? inv.lastEmailedAt.toString() : null,
    ]))
  );

  const handleSendEmail = async (id: string) => {
    setConfirmModal(null); // close modal before sending
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
        // Persist the sent timestamp in local state — no more reset timeout
        setEmailedAt((prev) => ({ ...prev, [id]: res.lastEmailedAt || new Date().toISOString() }));
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

  const handleMarkPaid = async () => {
    if (!payModal) return;
    const amount = parseFloat(payInput);
    if (isNaN(amount) || amount < 0) { alert("Please enter a valid amount."); return; }
    setPayLoading(true);
    try {
      const res = await markInvoicePaid(payModal.id, amount);
      if (res.success) {
        setInvoices((prev) => prev.map((inv) =>
          inv.id === payModal.id ? { ...inv, paid: res.paid } : inv
        ));
        setPayModal(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update payment.");
    } finally {
      setPayLoading(false);
    }
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

      {/* ── Pay Modal ── */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 font-black text-lg">$</div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Update Payment</h3>
                <p className="text-xs text-slate-500 mt-0.5">{payModal.name || "Invoice"} — Total: {getCurrencySymbol(payModal.currency)}{payModal.amount.toFixed(2)}</p>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Amount Paid ({getCurrencySymbol(payModal.currency)})</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={payModal.amount}
                  value={payInput}
                  onChange={(e) => setPayInput(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-400 transition"
                  placeholder={`0.00 – ${payModal.amount.toFixed(2)}`}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setPayInput(payModal.amount.toFixed(2))}
                    className="flex-1 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition cursor-pointer">
                    ✓ Fully Paid
                  </button>
                  <button type="button" onClick={() => setPayInput("0")}
                    className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                    Reset to $0
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button type="button" onClick={() => setPayModal(null)}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={handleMarkPaid} disabled={payLoading}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-sm">
                {payLoading ? "Saving…" : "Save Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Email Confirmation Modal ── */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Send Invoice via Email?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Please confirm before sending. This cannot be undone.</p>
              </div>
            </div>

            {/* Details */}
            <div className="px-6 py-5 space-y-3">
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Sending To</p>
                  <p className="text-sm font-bold text-slate-900">{confirmModal.email}</p>
                  {confirmModal.name && <p className="text-xs text-slate-500 mt-0.5">{confirmModal.name}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Document Reference</p>
                  <p className="text-sm font-bold text-slate-900 font-mono">{confirmModal.docRef}</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                The invoice PDF will be generated and sent as an email attachment to the address above.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSendEmail(confirmModal.id)}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer shadow-sm"
              >
                ✉️ Yes, Send Now
              </button>
            </div>
          </div>
        </div>
      )}
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
                      {(() => {
                        const sym = getCurrencySymbol(inv.currency);
                        return (
                          <>
                            <div className="font-extrabold text-slate-900">{sym}{inv.amount.toFixed(2)}</div>
                            {!isQuotation ? (
                              <>
                                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                  Paid: {sym}{inv.paid.toFixed(2)}
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
                          </>
                        );
                      })()}
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

                        {/* Quick Pay Button (only for invoices, not quotations) */}
                        {!isQuotation && (
                          <button
                            type="button"
                            title={isPaid ? "Fully paid" : "Update payment"}
                            onClick={() => {
                              setPayInput(inv.paid.toFixed(2));
                              setPayModal({ id: inv.id, name: inv.name, amount: inv.amount, currentPaid: inv.paid, currency: inv.currency });
                            }}
                            className={`p-1.5 rounded-lg transition cursor-pointer text-xs font-black ${
                              isPaid
                                ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                                : "text-amber-600 bg-amber-50 hover:bg-amber-100"
                            }`}
                          >
                            $
                          </button>
                        )}

                        {/* Send Email */}
                        {inv.email ? (() => {
                          const isSending = emailLoading[inv.id] === "sending";
                          const hasSent = !!emailedAt[inv.id];
                          const sentTime = emailedAt[inv.id];
                          const relTime = sentTime ? (() => {
                            const diff = Date.now() - new Date(sentTime).getTime();
                            const mins = Math.floor(diff / 60000);
                            const hrs = Math.floor(mins / 60);
                            const days = Math.floor(hrs / 24);
                            if (days > 0) return `${days}d ago`;
                            if (hrs > 0) return `${hrs}h ago`;
                            if (mins > 0) return `${mins}m ago`;
                            return "just now";
                          })() : null;

                          return (
                            <div className="flex flex-col items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => openEmailConfirm(inv)}
                                disabled={isSending}
                                title={hasSent ? `Sent to ${inv.email} — click to resend` : `Send invoice to ${inv.email}`}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  isSending
                                    ? "bg-slate-50 text-slate-400"
                                    : hasSent
                                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                    : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                                }`}
                              >
                                {isSending ? (
                                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                ) : hasSent ? (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </button>
                              {relTime && (
                                <span className="text-[9px] font-semibold text-emerald-600 leading-none whitespace-nowrap">{relTime}</span>
                              )}
                            </div>
                          );
                        })() : (
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

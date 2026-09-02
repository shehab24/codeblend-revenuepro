"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateGuestInvoiceOrQuotation, saveGlobalInvoiceDefaults } from "../../actions";
import {
  SUPPORTED_CURRENCIES,
  getCurrencySymbol,
  DEFAULT_BANK_DETAILS,
  DEFAULT_PREPARED_BY_NAME,
  DEFAULT_PREPARED_BY_EMAIL,
} from "@/lib/currency";

type LineItem = { description: string; quantity: number; rate: number; amount: number };

type InvoiceData = {
  id: string; type: string; title: string; amount: number; paid: number;
  notes: string | null; name: string | null; email: string | null; phone: string | null;
  address?: string | null; currency?: string | null; preparedBy?: string | null;
  preparedByEmail?: string | null; paymentDetails?: string | null; items: any;
  billingMonth?: string | null;
};

function buildInitialItems(invoice: InvoiceData): LineItem[] {
  if (invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0) {
    return invoice.items.map((item: any) => ({
      description: item.description || "",
      quantity: parseFloat(item.quantity) || 1,
      rate: parseFloat(item.rate) || 0,
      amount: parseFloat(item.amount) || 0,
    }));
  }
  return [{ description: invoice.title, quantity: 1, rate: invoice.amount, amount: invoice.amount }];
}

export function EditInvoiceForm({ invoice }: { invoice: InvoiceData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSavingDefaults, setIsSavingDefaults] = useState(false);

  const [type, setType] = useState(invoice.type);
  const [currency, setCurrency] = useState(invoice.currency || "BDT");
  const [preparedBy, setPreparedBy] = useState(invoice.preparedBy || DEFAULT_PREPARED_BY_NAME);
  const [preparedByEmail, setPreparedByEmail] = useState(invoice.preparedByEmail || DEFAULT_PREPARED_BY_EMAIL);
  const [name, setName] = useState(invoice.name || "");
  const [email, setEmail] = useState(invoice.email || "");
  const [phone, setPhone] = useState(invoice.phone || "");
  const [address, setAddress] = useState(invoice.address || "");
  const [paid, setPaid] = useState(invoice.paid.toString());
  const [notes, setNotes] = useState(invoice.notes || "");
  const [paymentDetails, setPaymentDetails] = useState(invoice.paymentDetails || DEFAULT_BANK_DETAILS);
  const [items, setItems] = useState<LineItem[]>(buildInitialItems(invoice));
  const [billingMonth, setBillingMonth] = useState(invoice.billingMonth || "");

  const sym = getCurrencySymbol(currency);

  const updateItem = (idx: number, field: keyof LineItem, raw: string) => {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const next = { ...item };
      if (field === "description") { next.description = raw; }
      else if (field === "quantity") { next.quantity = parseFloat(raw) || 0; next.amount = next.quantity * next.rate; }
      else if (field === "rate") { next.rate = parseFloat(raw) || 0; next.amount = next.quantity * next.rate; }
      return next;
    }));
  };

  const totalAmount = items.reduce((s, i) => s + i.amount, 0);
  const balanceDue = Math.max(0, totalAmount - (parseFloat(paid) || 0));

  const handleSaveDefaults = async () => {
    setIsSavingDefaults(true);
    try {
      await saveGlobalInvoiceDefaults({ currency, preparedBy, preparedByEmail, paymentDetails });
      alert("Defaults saved for all future invoices.");
    } catch (e: any) { alert(e.message); } finally { setIsSavingDefaults(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some((i) => !i.description.trim() || i.amount <= 0)) {
      alert("Each line item needs a description and amount > 0.");
      return;
    }
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("type", type); fd.append("name", name); fd.append("email", email);
        fd.append("phone", phone); fd.append("address", address); fd.append("currency", currency);
        fd.append("preparedBy", preparedBy); fd.append("preparedByEmail", preparedByEmail);
        fd.append("paid", type === "guest_quotation" ? "0" : (paid || "0"));
        fd.append("notes", notes); fd.append("paymentDetails", paymentDetails);
        fd.append("billingMonth", billingMonth);
        fd.append("items", JSON.stringify(items));
        const res = await updateGuestInvoiceOrQuotation(invoice.id, fd);
        if (res?.id) router.push("/dashboard/admin/invoices");
      } catch (e: any) { alert(e.message || "Failed."); }
    });
  };

  return (
    <div className="w-full">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Edit Document</h2>
          <p className="text-sm text-slate-500 mt-0.5">Update invoice details, client info, line items, and payment.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleSaveDefaults} disabled={isSavingDefaults}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer shadow-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {isSavingDefaults ? "Saving…" : "Save as Defaults"}
          </button>
          <Link href="/dashboard/admin/invoices"
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition no-underline cursor-pointer shadow-xs">
            ← Back to List
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ── LEFT COLUMN (2/3): Main form fields ── */}
          <div className="xl:col-span-2 space-y-5">
            {/* Document & Issuer */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Document & Issuer</p>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="lbl">Document Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="inp" required>
                    <option value="guest_invoice">Invoice</option>
                    <option value="guest_quotation">Quotation / Estimate</option>
                  </select>
                </div>
                <div>
                  <label className="lbl">Billing Month <span className="normal-case font-normal text-slate-400">(optional)</span></label>
                  <input
                    type="month"
                    value={billingMonth}
                    onChange={(e) => setBillingMonth(e.target.value)}
                    className="inp"
                    placeholder="e.g. 2026-08"
                  />
                </div>
                <div>
                  <label className="lbl">Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="inp" required>
                    {SUPPORTED_CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl">Billed By (Name / Company)</label>
                  <input type="text" value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} className="inp" placeholder="CodeBlend Digital Solutions" required />
                </div>
                <div className="col-span-2">
                  <label className="lbl">Billed By Email</label>
                  <input type="email" value={preparedByEmail} onChange={(e) => setPreparedByEmail(e.target.value)} className="inp" placeholder="contact@codeblend.co" />
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Client Details (Billed To)</p>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="lbl">Client / Company Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="inp" placeholder="Marie Olivie LLC" required />
                </div>
                <div>
                  <label className="lbl">Client Email <span className="normal-case font-normal text-slate-400">(optional)</span></label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="inp" placeholder="client@example.com" />
                </div>
                <div>
                  <label className="lbl">Phone <span className="normal-case font-normal text-slate-400">(optional)</span></label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="inp" placeholder="+1 305-123-4567" />
                </div>
                <div>
                  <label className="lbl">Address / EIN / Tax ID <span className="normal-case font-normal text-slate-400">(optional)</span></label>
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="inp resize-none"
                    placeholder={"1931 NW 150th Ave, Ste 257\nPembroke Pines, FL 33028\nEIN: 30-1454745"} />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Line Items</p>
                <button type="button" onClick={() => setItems((p) => [...p, { description: "", quantity: 1, rate: 0, amount: 0 }])}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer">+ Add Item</button>
              </div>
              <div className="p-6 space-y-3">
                <div className="grid grid-cols-12 gap-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400 px-1">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2 text-center">Qty / Hrs</div>
                  <div className="col-span-2 text-right">Rate ({sym})</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1" />
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-5">
                      <input type="text" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)}
                        className="inp" placeholder="e.g. Working hours / Development" required />
                    </div>
                    <div className="col-span-2">
                      <input type="number" min="0" step="any" value={item.quantity || ""} onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                        className="inp text-center font-mono" placeholder="0" required />
                    </div>
                    <div className="col-span-2">
                      <input type="number" min="0" step="0.01" value={item.rate || ""} onChange={(e) => updateItem(idx, "rate", e.target.value)}
                        className="inp text-right font-mono" placeholder="0.00" required />
                    </div>
                    <div className="col-span-2 text-right text-sm font-bold font-mono text-slate-800">
                      {sym}{item.amount.toFixed(2)}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button type="button" onClick={() => items.length > 1 && setItems((p) => p.filter((_, i) => i !== idx))}
                        disabled={items.length === 1} className="text-slate-300 hover:text-rose-500 disabled:opacity-20 cursor-pointer text-lg leading-none">×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Notes / Terms <span className="normal-case font-normal text-slate-400">(optional)</span></p>
              </div>
              <div className="p-6">
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="inp resize-none w-full"
                  placeholder="e.g. Payment due within 30 days. Late payments subject to 2% monthly fee." />
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (1/3): Summary + Bank ── */}
          <div className="xl:col-span-1 space-y-5">
            {/* Financial Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Summary</p>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">{sym}{totalAmount.toFixed(2)}</span>
                </div>
                {type === "guest_invoice" && (
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span className="shrink-0">Amount Paid</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-xs">{sym}</span>
                      <input type="number" min="0" step="0.01" value={paid} onChange={(e) => setPaid(e.target.value)}
                        className="w-28 px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm font-mono font-bold text-right text-slate-900 focus:outline-none focus:border-slate-400 bg-white" placeholder="0.00" />
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-base font-black">
                  <span className="text-slate-900">Balance Due</span>
                  <span className={`font-mono ${balanceDue > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {sym}{balanceDue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank / Payment Details */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Payment / Bank Details</p>
              </div>
              <div className="p-5">
                <textarea value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)} rows={7}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[12px] leading-relaxed font-mono text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 resize-none transition"
                  placeholder="Bank Name, Account No., SWIFT, bKash…" />
                <p className="text-[11px] text-slate-400 mt-1.5">Auto-attached to every invoice. Use <strong>Save as Defaults</strong> to persist.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button type="submit" disabled={isPending}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition disabled:opacity-50 cursor-pointer shadow-sm">
                {isPending ? "Saving…" : "Save Changes →"}
              </button>
              <Link href="/dashboard/admin/invoices"
                className="w-full py-3 text-center text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition no-underline cursor-pointer">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        .lbl { display: block; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
        .inp { display: block; width: 100%; padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; color: #1e293b; background: #fff; outline: none; transition: border-color 0.15s; line-height: 1.4; }
        .inp:focus { border-color: #94a3b8; }
        select.inp { cursor: pointer; }
      `}</style>
    </div>
  );
}

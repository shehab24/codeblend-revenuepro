"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createGuestInvoiceOrQuotation } from "../actions";

type LineItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export default function CreateGuestInvoicePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState("guest_invoice");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paid, setPaid] = useState("");
  const [notes, setNotes] = useState("");

  // Multiple line items state
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, rate: 0, amount: 0 },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { description: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === "description") {
        item.description = value as string;
      } else if (field === "quantity") {
        const val = parseInt(value as string) || 0;
        item.quantity = val;
        item.amount = val * item.rate;
      } else if (field === "rate") {
        const val = parseFloat(value as string) || 0;
        item.rate = val;
        item.amount = item.quantity * val;
      }

      updated[index] = item;
      return updated;
    });
  };

  // Calculated subtotal
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.some((item) => !item.description.trim() || item.amount <= 0)) {
      alert("Please ensure all line items have a description and a valid price greater than zero.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("type", type);
        formData.append("name", name);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("paid", type === "guest_quotation" ? "0" : paid || "0");
        formData.append("notes", notes);
        formData.append("items", JSON.stringify(items)); // Send stringified items JSON

        const res = await createGuestInvoiceOrQuotation(formData);
        if (res && res.id) {
          router.push("/dashboard/admin/invoices");
        }
      } catch (err: any) {
        alert(err.message || "Failed to create document.");
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Build New Document</h3>
          <p className="text-xs text-slate-500 mt-1">
            Build a guest invoice or quotation with multiple service items.
          </p>
        </div>
        <Link
          href="/dashboard/admin/invoices"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition shadow-xs no-underline cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to List
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Document Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Document Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-slate-400 transition cursor-pointer"
              required
            >
              <option value="guest_invoice">Invoice</option>
              <option value="guest_quotation">Quotation</option>
            </select>
          </div>

          {/* Client Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Client Name
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400 transition"
              required
            />
          </div>

          {/* Client Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Client Email (Optional)
            </label>
            <input
              type="email"
              placeholder="e.g. client@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400 transition"
            />
          </div>

          {/* Client Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Client Phone (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 017xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400 transition"
            />
          </div>
        </div>

        {/* Dynamic Line Items Section */}
        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Line Items
            </h4>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                {/* Description */}
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 sm:hidden">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Item / Service description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400 transition"
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="w-20 sm:w-20">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 sm:hidden">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-800 text-center focus:outline-none focus:border-slate-400 transition"
                    required
                  />
                </div>

                {/* Rate */}
                <div className="w-28 sm:w-28">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 sm:hidden">
                    Rate
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Rate"
                    value={item.rate || ""}
                    onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-800 text-right focus:outline-none focus:border-slate-400 transition"
                    required
                  />
                </div>

                {/* Calculated Amount */}
                <div className="w-28 text-right font-bold text-xs text-slate-900 py-2.5 px-1 min-w-[70px]">
                  ৳{item.amount.toFixed(2)}
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  disabled={items.length === 1}
                  className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-40 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Totals & Payments Section */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div className="flex justify-end">
            <div className="w-72 p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                <span>Subtotal:</span>
                <span className="text-slate-900 font-mono">৳{totalAmount.toFixed(2)}</span>
              </div>
              
              {type === "guest_invoice" && (
                <div className="space-y-2 border-t border-slate-200/60 pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-xs font-bold text-slate-600">
                      Amount Paid (৳):
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={paid}
                      onChange={(e) => setPaid(e.target.value)}
                      className="w-32 px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-900 text-right focus:outline-none focus:border-slate-400 transition"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-slate-100">
                    <span className="text-slate-900">Balance Due:</span>
                    <span className="text-rose-600 font-mono">
                      ৳{Math.max(0, totalAmount - (parseFloat(paid) || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Custom Notes / Terms & Conditions (Optional)
            </label>
            <textarea
              placeholder="e.g. Delivery terms, MFS payment instructions, validity estimation, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400 transition resize-y"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
          <Link
            href="/dashboard/admin/invoices"
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer no-underline"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:bg-emerald-400"
          >
            {isPending ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              "Generate Document"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

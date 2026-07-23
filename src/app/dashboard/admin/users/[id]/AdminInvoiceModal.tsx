"use client";

import React, { useState } from "react";

type Props = {
  userId: string;
  userName?: string | null;
  userEmail: string;
  initialTitle: string;
  initialAmount: number;
  initialPaid: number;
  initialNotes?: string;
  type?: string;
  itemId?: string;
  triggerButtonText?: string;
  triggerButtonClass?: string;
};

export function AdminInvoiceModal({
  userId,
  initialTitle,
  initialAmount,
  initialPaid,
  initialNotes = "",
  type = "custom",
  itemId = "",
  triggerButtonText = "Invoice",
  triggerButtonClass = "px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium border border-slate-200 transition cursor-pointer shrink-0",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [amount, setAmount] = useState<number>(initialAmount);
  const [paid, setPaid] = useState<number>(initialPaid);
  const [notes, setNotes] = useState(initialNotes);

  const due = Math.max(0, (amount || 0) - (paid || 0));

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();

    const queryParams = new URLSearchParams({
      type,
      itemId,
      title: title || initialTitle,
      amount: (amount || 0).toString(),
      paid: (paid || 0).toString(),
      notes: notes || "",
    });

    const invoiceUrl = `/dashboard/admin/users/${userId}/invoice?${queryParams.toString()}`;
    setIsOpen(false);
    window.open(invoiceUrl, "_blank");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={triggerButtonClass}
      >
        {triggerButtonText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-6 z-10 text-left space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Generate Custom Invoice
                </h3>
                <p className="text-xs text-slate-500">
                  Adjust payable amount and paid balance for invoice generation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invoiced (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Paid (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paid}
                    onChange={(e) => setPaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400 transition"
                    required
                  />
                </div>
              </div>

              <div className="px-3.5 py-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Calculated Balance Due:</span>
                <span className="font-bold text-slate-900">৳{due.toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid via bKash"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

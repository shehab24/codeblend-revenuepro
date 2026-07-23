"use client";

import React, { useState } from "react";
import { updateServiceRequestBillingFromAdmin } from "../actions";

type Props = {
  serviceRequestId: string;
  targetUserId: string;
  serviceType: string;
  initialTotalAmount: number;
  initialPaidAmount: number;
  initialStatus: string;
};

export function EditServiceBillingModal({
  serviceRequestId,
  targetUserId,
  serviceType,
  initialTotalAmount,
  initialPaidAmount,
  initialStatus,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-[11px] font-medium text-slate-500 hover:text-slate-900 underline cursor-pointer"
        title="Edit Invoiced Amount & Paid Balance"
      >
        Edit Pricing
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 p-6 z-10 text-left space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Update Service Billing
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {serviceType}
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

            <form
              action={async (formData) => {
                await updateServiceRequestBillingFromAdmin(formData);
                setIsOpen(false);
              }}
              className="space-y-3"
            >
              <input type="hidden" name="serviceRequestId" value={serviceRequestId} />
              <input type="hidden" name="targetUserId" value={targetUserId} />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invoiced Amount (৳)
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  step="0.01"
                  min="0"
                  defaultValue={initialTotalAmount}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paid Amount (৳)
                </label>
                <input
                  type="number"
                  name="paidAmount"
                  step="0.01"
                  min="0"
                  defaultValue={initialPaidAmount}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Status
                </label>
                <select
                  name="status"
                  defaultValue={initialStatus}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400 transition"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

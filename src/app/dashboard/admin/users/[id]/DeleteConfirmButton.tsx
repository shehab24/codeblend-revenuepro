"use client";

import React, { useState } from "react";

type Props = {
  action: (formData: FormData) => Promise<void>;
  idFieldName: string;
  idValue: string;
  targetUserId: string;
  itemLabel?: string;
};

export function DeleteConfirmButton({
  action,
  idFieldName,
  idValue,
  targetUserId,
  itemLabel = "item",
}: Props) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition cursor-pointer"
        title={`Delete ${itemLabel}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>

      {isConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setIsConfirming(false)} />

          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 p-6 z-10 text-left space-y-4 animate-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Delete {itemLabel}?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete this {itemLabel.toLowerCase()}? This action cannot be undone.
              </p>
            </div>

            <form action={action} className="flex items-center justify-end gap-2 pt-2">
              <input type="hidden" name={idFieldName} value={idValue} />
              <input type="hidden" name="targetUserId" value={targetUserId} />

              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Delete
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

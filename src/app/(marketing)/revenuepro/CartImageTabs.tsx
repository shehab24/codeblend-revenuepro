"use client";

import { useState } from "react";
import InteractiveImage from "@/components/InteractiveImage";

export function CartImageTabs({ labels }: { labels: string[] }) {
  const [tab, setTab] = useState<0 | 1>(0);

  return (
    <div className="mx-auto w-full max-w-lg space-y-3">
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {labels.map((label, i) => (
          <button
            key={label}
            onClick={() => setTab(i as 0 | 1)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              tab === i ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 0 ? (
        <InteractiveImage src="/feature-cart.png" alt="Abandoned cart settings panel" width={864} height={450} className="h-auto w-full object-contain" />
      ) : (
        <InteractiveImage src="/feature-carts-log.png" alt="Abandoned and recovered carts log" width={1016} height={445} className="h-auto w-full object-contain" />
      )}
    </div>
  );
}

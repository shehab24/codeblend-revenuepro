"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function RequestSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    startTransition(() => {
      if (term) {
        router.push(`/dashboard/admin/requests?q=${encodeURIComponent(term)}`);
      } else {
        router.push(`/dashboard/admin/requests`);
      }
    });
  };

  return (
    <div className="relative">
      <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        placeholder="Search name or email..."
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-9 pr-4 py-2 w-64 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition-all shadow-sm"
      />
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

type ProfileData = {
  name: string;
  email: string;
  phone: string | null;
  imageUrl: string | null;
  createdAt: string;
  clerkId: string;
  role: string;
  verified: boolean;
  totalLicenses: number;
  activeLicenses: number;
  pendingLicenses: number;
  totalTransactions: number;
  totalPaid: number;
  totalRequests: number;
  recentLicenses: { id: string; domain: string; status: string; tier: string; paymentStatus: string; createdAt: string }[];
  recentTransactions: { id: string; amount: number; status: string; paymentMethod: string; createdAt: string }[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    suspended: "bg-red-100 text-red-700",
    verified: "bg-emerald-100 text-emerald-700",
    completed: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
    paid: "bg-emerald-100 text-emerald-700",
    unpaid: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider ${colors[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

export function ProfileClient({ profile }: { profile: ProfileData }) {
  const [activeTab, setActiveTab] = useState<"overview" | "licenses" | "transactions">("overview");
  const [isUpdating, startUpdate] = useTransition();
  const [phoneInput, setPhoneInput] = useState(profile.phone || "");
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);
  const [updateMsg, setUpdateMsg] = useState("");

  const handlePhoneUpdate = () => {
    startUpdate(async () => {
      try {
        const { updateUserPhone } = await import("./actions");
        const res = await updateUserPhone(phoneInput);
        if (res?.error) {
          setUpdateMsg(res.error);
        } else {
          setUpdateMsg("ফোন নম্বর সফলভাবে আপডেট হয়েছে!");
          setShowPhoneEdit(false);
        }
      } catch {
        setUpdateMsg("আপডেট করতে ব্যর্থ হয়েছে।");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-emerald-200/50">
              {profile.imageUrl ? (
                <img src={profile.imageUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-white">{profile.name.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {profile.name}
                {profile.verified && (
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                )}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">{profile.email}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  যোগদান: {formatDate(profile.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase border border-slate-200">
                  {profile.role}
                </span>
                {profile.phone && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-600 rounded-lg text-xs font-bold border border-sky-100">
                    📱 {profile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
          <div className="text-2xl font-black text-slate-800">{profile.totalLicenses}</div>
          <div className="text-xs font-semibold text-slate-400 mt-1">মোট লাইসেন্স</div>
        </div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 text-center">
          <div className="text-2xl font-black text-emerald-600">{profile.activeLicenses}</div>
          <div className="text-xs font-semibold text-emerald-500 mt-1">অ্যাক্টিভ</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
          <div className="text-2xl font-black text-slate-800">{profile.totalRequests}</div>
          <div className="text-xs font-semibold text-slate-400 mt-1">সার্ভিস রিকুয়েস্ট</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
          <div className="text-2xl font-black text-indigo-600">৳{profile.totalPaid.toLocaleString()}</div>
          <div className="text-xs font-semibold text-slate-400 mt-1">মোট পেমেন্ট</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100">
          {(["overview", "licenses", "transactions"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors cursor-pointer border-none bg-transparent
                ${activeTab === tab ? "text-emerald-700 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-600"}`}
            >
              {tab === "overview" ? "প্রোফাইল তথ্য" : tab === "licenses" ? "লাইসেন্স সমূহ" : "লেনদেন"}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">পুরো নাম</div>
                  <div className="text-sm font-semibold text-slate-800">{profile.name}</div>
                </div>

                {/* Email */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">ইমেইল</div>
                  <div className="text-sm font-semibold text-slate-800 break-all">{profile.email}</div>
                </div>

                {/* Phone */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">ফোন নম্বর</div>
                  {showPhoneEdit ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
                      />
                      <button
                        onClick={handlePhoneUpdate}
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 border-none cursor-pointer"
                      >
                        {isUpdating ? "..." : "Save"}
                      </button>
                      <button
                        onClick={() => setShowPhoneEdit(false)}
                        className="px-2 py-1.5 text-slate-400 hover:text-red-500 text-xs border-none bg-transparent cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">{profile.phone || "সেট করা হয়নি"}</span>
                      <button
                        onClick={() => setShowPhoneEdit(true)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold border-none bg-transparent cursor-pointer"
                      >
                        {profile.phone ? "পরিবর্তন" : "যোগ করুন"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Account ID */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">অ্যাকাউন্ট ID</div>
                  <code className="text-xs font-mono text-slate-600 bg-slate-200 px-2 py-1 rounded inline-block break-all">{profile.clerkId}</code>
                </div>

                {/* Join Date */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">যোগদানের তারিখ</div>
                  <div className="text-sm font-semibold text-slate-800">{formatDate(profile.createdAt)}</div>
                </div>

                {/* Role */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">অ্যাকাউন্ট ধরন</div>
                  <div className="text-sm font-semibold text-slate-800 uppercase">{profile.role}</div>
                </div>
              </div>

              {updateMsg && (
                <div className={`p-3 rounded-xl text-sm font-semibold ${updateMsg.includes("ব্যর্থ") ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                  {updateMsg}
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">দ্রুত কার্যক্রম</h4>
                <div className="flex flex-wrap gap-3">
                  <Link href="/dashboard/user/revenuepro" className="px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition no-underline flex items-center gap-2">
                    🔑 লাইসেন্স ম্যানেজ
                  </Link>
                  <Link href="/dashboard/user/requests" className="px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition no-underline flex items-center gap-2">
                    📋 সার্ভিস রিকুয়েস্ট
                  </Link>
                  <Link href="/dashboard/user/transactions" className="px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition no-underline flex items-center gap-2">
                    💳 লেনদেনের ইতিহাস
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Licenses Tab */}
          {activeTab === "licenses" && (
            <div className="space-y-3">
              {profile.recentLicenses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl">🔑</div>
                  <p className="text-sm text-slate-500">কোনো লাইসেন্স নেই</p>
                  <Link href="/dashboard/user/revenuepro" className="text-xs text-emerald-600 font-bold no-underline mt-2 inline-block">
                    নতুন লাইসেন্স আবেদন করুন →
                  </Link>
                </div>
              ) : (
                profile.recentLicenses.map((lic) => (
                  <Link key={lic.id} href={`/dashboard/user/revenuepro/${lic.id}`} className="block p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all no-underline group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{lic.domain}</span>
                      <StatusBadge status={lic.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Plan: {lic.tier}</span>
                      <span>{formatDate(lic.createdAt)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className="space-y-3">
              {profile.recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl">💳</div>
                  <p className="text-sm text-slate-500">কোনো লেনদেনের তথ্য নেই</p>
                </div>
              ) : (
                profile.recentTransactions.map((trx) => (
                  <div key={trx.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-700">৳{trx.amount.toLocaleString()}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{trx.paymentMethod.replace("_", " ")} • {formatDate(trx.createdAt)}</div>
                    </div>
                    <StatusBadge status={trx.status} />
                  </div>
                ))
              )}
              <div className="pt-3 text-center">
                <Link href="/dashboard/user/transactions" className="text-xs text-emerald-600 font-bold no-underline hover:text-emerald-700">
                  সকল লেনদেন দেখুন →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

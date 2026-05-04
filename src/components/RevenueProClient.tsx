"use client";

import { useTransition, useState } from "react";
import { createLicense, deleteLicense } from "@/app/dashboard/user/actions";
import Link from "next/link";

/* ─── Types ─── */
type License = {
  id: string;
  domain: string;
  key: string;
  tier: string;
  status: string;
  paymentStatus: string;
  expirationDate: string | null;
  createdAt: string;
};

type PluginVersion = {
  id: string;
  version: string;
  name: string;
  link: string;
  isLatest: boolean;
};

/* ─── Status Helpers ─── */
function getStatusConfig(status: string) {
  switch (status) {
    case "active":
      return {
        label: "অ্যাক্টিভ",
        labelEn: "Active",
        color: "emerald",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        icon: "✓",
      };
    case "pending":
      return {
        label: "অপেক্ষমাণ",
        labelEn: "Pending",
        color: "amber",
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        dot: "bg-amber-500",
        icon: "⏳",
      };
    case "suspended":
      return {
        label: "স্থগিত",
        labelEn: "Suspended",
        color: "red",
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        dot: "bg-red-500",
        icon: "⚠",
      };
    case "revoked":
      return {
        label: "বাতিল",
        labelEn: "Revoked",
        color: "slate",
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-500",
        dot: "bg-slate-400",
        icon: "✕",
      };
    default:
      return {
        label: status,
        labelEn: status,
        color: "slate",
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-700",
        dot: "bg-slate-400",
        icon: "?",
      };
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
}

/* ─── License Card Component ─── */
function LicenseCard({ license, downloadLinks, paymentSettings, index }: { license: License; downloadLinks: PluginVersion[]; paymentSettings: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [showPayModal, setShowPayModal] = useState(false);
  const [submittingPayment, startSubmitPayment] = useTransition();
  const [payError, setPayError] = useState("");
  
  const isActive = license.status === "active";
  const isPending = license.status === "pending";
  const isPaid = license.paymentStatus === "paid" || license.paymentStatus === "pending_verification";
  const cfg = getStatusConfig(license.status);

  let paymentCfg = { text: "পেমেন্ট অপেক্ষায়", icon: "⏱", bg: "bg-amber-50", color: "text-amber-600" };
  if (license.paymentStatus === "paid") {
    paymentCfg = { text: "পেমেন্ট সম্পন্ন", icon: "💳", bg: "bg-emerald-50", color: "text-emerald-600" };
  } else if (license.paymentStatus === "pending_verification") {
    paymentCfg = { text: "যাচাই করা হচ্ছে", icon: "🔍", bg: "bg-blue-50", color: "text-blue-600" };
  }

  const handleDelete = () => {
    if (!confirm("আপনি কি নিশ্চিত এই লাইসেন্স আবেদনটি মুছে ফেলতে চান?")) return;
    startDelete(async () => {
      await deleteLicense(license.id);
    });
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden group ${expanded ? "shadow-lg " + cfg.border : "border-slate-200 hover:border-slate-300 hover:shadow-md"}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Card Header — Always Visible */}
      <div
        className="p-5 md:p-6 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Domain + Status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-xl ${cfg.bg} ${cfg.text} flex items-center justify-center text-sm font-bold shrink-0`}>
                {cfg.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-800 truncate">{license.domain}</h3>
                <p className="text-xs text-slate-400 font-medium">{license.tier}</p>
              </div>
            </div>
          </div>

          {/* Status + Payment Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${isActive || isPending ? 'animate-pulse' : ''}`}></span>
              {cfg.label} ({cfg.labelEn})
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${paymentCfg.bg} ${paymentCfg.color}`}>
              {paymentCfg.icon} {paymentCfg.text}
            </span>
          </div>

          {/* Expand Arrow */}
          <div className="hidden md:flex items-center">
            <svg
              className={`w-5 h-5 text-slate-300 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 md:px-6 pb-6 border-t border-slate-100">

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            <div className="bg-slate-50 rounded-xl p-3.5">
              <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">শুরুর তারিখ</div>
              <div className="text-sm font-semibold text-slate-700">
                {isActive ? formatDate(license.createdAt) : <span className="text-amber-500 italic text-xs font-normal">অনুমোদনের অপেক্ষায়</span>}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5">
              <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">মেয়াদ শেষ</div>
              <div className="text-sm font-semibold text-emerald-600">
                {isActive ? (license.expirationDate ? formatDate(license.expirationDate) : "আজীবন ∞") : <span className="text-amber-500 italic text-xs font-normal">অনুমোদনের অপেক্ষায়</span>}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5">
              <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">ডোমেইন</div>
              <div className="text-sm font-semibold text-slate-700 truncate">{license.domain}</div>
            </div>
            <div className={`${paymentCfg.bg} rounded-xl p-3.5 flex flex-col justify-between items-start`}>
              <div>
                <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">পেমেন্ট</div>
                <div className={`text-sm font-bold ${paymentCfg.color}`}>{paymentCfg.text}</div>
              </div>
              {!isPaid && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowPayModal(true); }}
                  className="mt-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold transition-colors w-full"
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>

          {/* License Key */}
          <div className="mt-4 bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-2">লাইসেন্স কি (API KEY)</div>
            {isActive ? (
              <div className="flex items-center gap-2">
                <code className="text-emerald-600 break-all text-sm font-mono flex-1 bg-emerald-50 px-3 py-2 rounded-lg">{license.key}</code>
                <button
                  onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(license.key); }}
                  className="shrink-0 px-3 py-2 bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600 rounded-lg transition-colors text-xs font-bold"
                  title="Copy Key"
                >
                  📋 Copy
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="bg-slate-100 text-slate-400 text-xs px-3 py-2.5 rounded-lg blur-[2px] select-none font-mono text-center">
                  REVPRO-XXXXXXXXXXXXXXXXXXXXXXXX
                </div>
                <span className="absolute inset-0 flex items-center justify-center text-slate-500 font-bold tracking-widest text-xs">
                  🔒 HIDDEN
                </span>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {isPending && (
            <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-[0.8rem] leading-relaxed text-amber-700">
              আপনার লাইসেন্সটি অ্যাডমিন প্যানেল থেকে অনুমোদনের অপেক্ষায় আছে। অনুমোদন হওয়ার সাথে সাথেই আপনার API-Key দৃশ্যমান হবে এবং প্লাগইন ডাউনলোড করতে পারবেন।
            </div>
          )}
          {isActive && (
            <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[0.8rem] leading-relaxed text-emerald-700">
              ✅ আপনার লাইসেন্স অ্যাক্টিভ! এই কি (Key) আপনার ওয়ার্ডপ্রেস ড্যাশবোর্ডে গিয়ে Revenue Pro সেটিংসে ব্যবহার করুন।
            </div>
          )}

          {/* Download Links (only for active licenses) */}
          {isActive && downloadLinks.length > 0 && (
            <div className="mt-4">
              <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-3">প্লাগইন ডাউনলোড</div>
              <div className="flex flex-col gap-2">
                {downloadLinks.map(link => (
                  <a
                    key={link.id}
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${link.isLatest ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className={`w-5 h-5 ${link.isLatest ? 'text-emerald-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      <div>
                        <span className="text-sm font-semibold text-slate-700">{link.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {link.isLatest && <span className="bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded text-[0.55rem] font-bold">LATEST</span>}
                          {link.version && <span className="text-xs text-slate-400 font-mono">{link.version}</span>}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${link.isLatest ? 'text-emerald-600' : 'text-slate-500'}`}>ডাউনলোড →</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Actions & Delete */}
          <div className="mt-4 flex items-center justify-between">
            <Link 
              href={`/dashboard/user/revenuepro/${license.id}`}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all"
            >
              📊 বিস্তারিত দেখুন (View Details)
            </Link>

            {isPending && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold text-red-500 hover:text-white bg-red-50 hover:bg-red-500 border border-red-200 hover:border-red-500 rounded-xl transition-all disabled:opacity-50"
              >
                {deleting ? "মুছে ফেলা হচ্ছে..." : "🗑 আবেদন মুছে ফেলুন"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <span className="text-xl">💳</span> পেমেন্ট করুন
              </h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-red-500 p-1">
                ✕
              </button>
            </div>
            
            <div className="p-6">
              {paymentSettings.bkashApiEnabled === "true" && (
                <div className="mb-6">
                  <p className="text-sm text-slate-600 mb-3 font-medium">অটোমেটেড পেমেন্ট করুন:</p>
                  <button 
                    type="button"
                    disabled={submittingPayment}
                    onClick={() => {
                      startSubmitPayment(async () => {
                        try {
                          const { initiateBkashPayment } = await import('@/app/dashboard/user/bkashActions');
                          const res = await initiateBkashPayment(license.id);
                          if (res.error) {
                            setPayError(res.error);
                          } else if (res.bkashURL) {
                            window.location.href = res.bkashURL;
                          }
                        } catch (err) {
                          setPayError("Failed to initiate payment");
                        }
                      });
                    }}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {submittingPayment ? "পেমেন্ট প্রস্তুত করা হচ্ছে... (Processing...)" : "বিকাশ (bKash) দিয়ে পেমেন্ট করুন"}
                  </button>
                  {paymentSettings.bkashManualEnabled === "true" && (
                    <div className="my-4 flex items-center gap-3">
                      <div className="h-px bg-slate-200 flex-1"></div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">OR</span>
                      <div className="h-px bg-slate-200 flex-1"></div>
                    </div>
                  )}
                </div>
              )}

              {paymentSettings.bkashManualEnabled === "true" && (
                <form action={(formData) => {
                  formData.append('licenseId', license.id);
                  startSubmitPayment(async () => {
                    const { submitManualPayment } = await import('@/app/dashboard/user/paymentActions');
                    const res = await submitManualPayment(formData);
                    if (res?.error) {
                      setPayError(res.error);
                    } else {
                      setShowPayModal(false);
                    }
                  });
                }}>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
                    <p className="text-sm text-slate-700 mb-2">
                      অনুগ্রহ করে নিচের <strong>{paymentSettings.bkashManualType === 'merchant' ? 'Merchant' : 'Personal'}</strong> নম্বরে সেন্ড মানি করুন:
                    </p>
                    <div className="text-xl font-bold text-pink-600 tracking-wider mb-1 flex items-center justify-between">
                      {paymentSettings.bkashManualNumber}
                      <button type="button" onClick={() => navigator.clipboard.writeText(paymentSettings.bkashManualNumber)} className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">Copy</button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Sender Number</label>
                      <input type="text" name="senderNumber" required placeholder="01XXXXXXXXX" className="w-full px-3 py-2 rounded-lg border border-slate-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Transaction ID (TrxID)</label>
                      <input type="text" name="trxId" required placeholder="8NXXXXXXXXX" className="w-full px-3 py-2 rounded-lg border border-slate-300 uppercase" />
                    </div>
                  </div>

                  {payError && <div className="mt-3 text-red-500 text-sm font-semibold">{payError}</div>}

                  <button 
                    disabled={submittingPayment}
                    className="w-full mt-6 bg-slate-900 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingPayment ? "সাবমিট হচ্ছে..." : "পেমেন্ট ভেরিফাই করুন"}
                  </button>
                </form>
              )}

              {paymentSettings.bkashApiEnabled !== "true" && paymentSettings.bkashManualEnabled !== "true" && (
                <div className="text-center text-slate-500 py-4">
                  পেমেন্ট গেটওয়ে সেটআপ করা হয়নি। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Apply New License Section ─── */
function NewLicenseForm() {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createLicense(formData);
      setShowForm(false);
    });
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-3 group"
      >
        <div className="w-10 h-10 bg-slate-100 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </div>
        <span className="font-semibold text-sm">নতুন সাইটের জন্য লাইসেন্স আবেদন করুন</span>
      </button>
    );
  }

  return (
    <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          নতুন লাইসেন্স আবেদন
        </h4>
        <button
          onClick={() => setShowForm(false)}
          className="text-slate-400 hover:text-red-500 transition-colors p-1"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5" htmlFor="new-domain">ওয়েবসাইটের ডোমেইন (Target Domain)</label>
          <input
            type="text"
            id="new-domain"
            name="domain"
            placeholder="e.g., ecomdrivebd.com"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5" htmlFor="new-duration">সাবস্ক্রিপশনের মেয়াদ (Duration)</label>
          <select
            id="new-duration"
            name="duration"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm cursor-pointer focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 transition appearance-none"
          >
            <option value="1">১ মাস (1 Month) — ৳১০০০</option>
            <option value="2">২ মাস (2 Months) — ৳১৮০০</option>
            <option value="3">৩ মাস (3 Months) — ৳২৫০০</option>
            <option value="6">৬ মাস (6 Months) — ৳৪৫০০</option>
            <option value="12">১ বছর (1 Year) — ৳৮০০০</option>
            <option value="0">আজীবন (Lifetime) — ৳১৫০০০</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm"
        >
          {isPending ? "আবেদন করা হচ্ছে..." : "সাবস্ক্রিপশনের জন্য আবেদন করুন"}
        </button>
      </form>
    </div>
  );
}

/* ─── Main Client Component ─── */
export function RevenueProClient({
  licenses,
  downloadLinks,
  paymentSettings
}: {
  licenses: License[];
  downloadLinks: PluginVersion[];
  paymentSettings?: any;
}) {
  const activeCount = licenses.filter(l => l.status === "active").length;
  const pendingCount = licenses.filter(l => l.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {licenses.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
            <div className="text-2xl font-bold text-slate-800">{licenses.length}</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">মোট লাইসেন্স</div>
          </div>
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 text-center">
            <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
            <div className="text-xs text-emerald-500 font-semibold mt-1">অ্যাক্টিভ</div>
          </div>
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 text-center">
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            <div className="text-xs text-amber-500 font-semibold mt-1">অপেক্ষমাণ</div>
          </div>
        </div>
      )}

      {/* License Cards */}
      {licenses.length > 0 ? (
        <div className="space-y-4">
          {licenses.map((license, i) => (
            <LicenseCard
              key={license.id}
              license={license}
              downloadLinks={downloadLinks}
              paymentSettings={paymentSettings}
              index={i}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">🔑</div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">এখনো কোনো লাইসেন্স নেই</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            আপনার প্রথম ওয়েবসাইটের জন্য নীচে থেকে নতুন লাইসেন্স আবেদন করুন।
          </p>
        </div>
      )}

      {/* New License Form */}
      <NewLicenseForm />
    </div>
  );
}

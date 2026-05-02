import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RevenueProClient } from "@/components/RevenueProClient";
import { PluginVersion } from "../../admin/settings/client";

export const metadata = {
  title: "Revenue Pro | CodeBlend",
};

export default async function RevenueProPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const [revenueProLinksSetting, legacyLinkSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "REVENUEPRO_PLUGIN_LINKS" } }),
    prisma.setting.findUnique({ where: { key: "REVENUEPRO_PLUGIN_LINK" } }), // Fallback
  ]);

  let downloadLinks: PluginVersion[] = [];
  if (revenueProLinksSetting?.value) {
    try {
      downloadLinks = JSON.parse(revenueProLinksSetting.value);
    } catch {
      downloadLinks = [];
    }
  } else if (legacyLinkSetting?.value) {
    downloadLinks = [{
      id: "legacy",
      version: "1.0.0",
      name: "Revenue Pro - Latest Build",
      link: legacyLinkSetting.value,
      isLatest: true
    }];
  }

  // Fetch the user's email for customerEmail matching
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });

  // Fetch ALL licenses: ones they created OR ones admin assigned to their email
  const licenses = await prisma.license.findMany({
    where: {
      OR: [
        { userId },
        ...(user?.email ? [{ customerEmail: user.email }] : []),
      ]
    },
    orderBy: { createdAt: "desc" }
  });

  // Serialize dates for client component
  const serializedLicenses = licenses.map(l => ({
    id: l.id,
    domain: l.domain,
    key: l.key,
    tier: l.tier,
    status: l.status,
    paymentStatus: l.paymentStatus,
    expirationDate: l.expirationDate ? l.expirationDate.toISOString() : null,
    createdAt: l.createdAt.toISOString(),
  }));

  const activeCount = licenses.filter(l => l.status === "active").length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mt-4">
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-200">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">রেভিনিউ প্রো (Revenue Pro)</h1>
                  <p className="text-xs text-slate-400 mt-0.5">আপনার সকল সাইটের লাইসেন্স এখানে ম্যানেজ করুন</p>
                </div>
              </div>
              <p className="text-slate-500 max-w-lg text-sm leading-relaxed">
                আপনার ই-কমার্স বিজনেস অটোমেট করার সেরা মাধ্যম। ফ্রড ট্র্যাকিং, কুরিয়ার ইন্টিগ্রেশন এবং স্বয়ংক্রিয় এসএমএস ব্যবস্থা থেকে শুরু করে সব কিছুই একত্রে।
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="shrink-0 flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-600">{activeCount}</div>
                <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider">অ্যাক্টিভ</div>
              </div>
              <div className="w-px h-8 bg-slate-100"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-700">{licenses.length}</div>
                <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider">মোট সাইট</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features + Pricing Banner */}
        <div className="p-8 md:p-10 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Pricing */}
            <div className="md:w-1/3">
              <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">সাবস্ক্রিপশন</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-slate-800">৳১০০০</span>
                <span className="text-slate-500 font-medium">/ মাস থেকে</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                প্রতিটি ওয়েবসাইটের জন্য আলাদা লাইসেন্স। একাধিক সাইটে ব্যবহার করুন।
              </p>
            </div>

            {/* Features */}
            <div className="md:w-2/3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "স্মার্ট ফ্রড ডিটেকশন এবং ডেলিভারি রেশিও পরীক্ষক",
                  "স্ট্যাডফাস্ট, পাঠাও এবং রেডএক্স মাল্টি-কুরিয়ার এপিআই",
                  "অটোমেটেড অর্ডার কনফার্মেশন এসএমএস ও হোয়াটসঅ্যাপ ইঞ্জিন",
                  "পরিত্যক্ত কার্ট (Abandoned Cart) এ স্বয়ংক্রিয় মেসেজ প্রেরণ",
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-slate-700">
                    <div className="mt-0.5 bg-emerald-100 text-emerald-600 rounded-full p-1 shrink-0">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* License Listing */}
        <div className="p-8 md:p-10">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            আপনার লাইসেন্সসমূহ ({licenses.length})
          </h3>

          <RevenueProClient
            licenses={serializedLicenses}
            downloadLinks={downloadLinks}
          />
        </div>

        {/* Plugin Download Section */}
        <div className="p-8 md:p-10 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">প্লাগইন ডাউনলোড এবং ইনস্টলেশন</h3>
          
          <div className="flex flex-col gap-4">
            {downloadLinks.length === 0 && (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 shadow-inner">
                এই মুহূর্তে কোনো প্লাগইন ভার্সন আপলোড করা হয়নি।
              </div>
            )}
            
            {downloadLinks.map((link) => (
              <div 
                key={link.id} 
                className={`bg-white border text-left flex flex-col md:flex-row items-center justify-between border-slate-200 p-6 rounded-2xl transition-all group hover:shadow-md ${link.isLatest ? 'hover:border-emerald-300' : 'opacity-80 hover:opacity-100 hover:border-slate-300'}`}
              >
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${link.isLatest ? 'bg-slate-100 text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50' : 'bg-slate-50 text-slate-300'}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{link.name || "Revenue Pro"}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      {link.isLatest && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[0.6rem] font-bold">LATEST</span> 
                      )}
                      {link.version && <span className="font-mono text-xs">{link.version}</span>}
                      {link.isLatest && <span>সকল নতুন আপডেট অন্তর্ভুক্ত।</span>}
                      {!link.isLatest && <span>পুরোনো রিলিজ।</span>}
                    </p>
                  </div>
                </div>
                
                {link.link && activeCount > 0 ? (
                  <a 
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full md:w-auto px-6 py-3 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 ${link.isLatest ? 'bg-slate-900 text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20' : 'border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    {link.isLatest && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                    ডাউনলোড করুন {link.isLatest && '(Download)'}
                  </a>
                ) : (
                  <button 
                    disabled
                    className={`w-full md:w-auto px-6 py-3 font-semibold text-sm rounded-xl cursor-not-allowed flex items-center justify-center gap-2 shrink-0 transition ${link.isLatest ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 text-slate-300 border border-slate-100 py-2.5'}`}
                  >
                    {link.isLatest && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                    {licenses.length > 0 ? "অ্যাপ্রুভাল এর অপেক্ষায়" : link.isLatest ? "লাইসেন্স তৈরি করুন" : "লকড (Locked)"}
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-5 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-blue-800 text-sm">
            <svg className="w-6 h-6 shrink-0 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="leading-relaxed">
              <strong>কীভাবে ইনস্টল করবেন:</strong> লাইসেন্স অ্যাপ্রুভ হওয়ার পর ডাউনলোড করা জিপ ফাইলটি আপনার ওয়ার্ডপ্রেস সাইটের প্যানেলে গিয়ে <strong>Plugins {'>'} Add New {'>'} Upload Plugin</strong> এ আপলোড এবং ইনস্টল করুন। এরপর সেটিংসে গিয়ে উপরের <strong>License Key</strong> টি প্রবেশ করান।
            </p>
          </div>
        </div>

        {/* Feature Request Section */}
        <div className="p-8 md:p-10 border-t border-slate-100 bg-slate-50/50 text-center">
          <h3 className="text-lg font-bold text-slate-800 mb-2">নতুন ফিচার প্রয়োজন?</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            আপনার যদি রেভিনিউ প্রো-তে নতুন কোনো ফিচার বা আপডেটের প্রয়োজন হয়, তবে আমাদের জানান।
          </p>
          <Link 
            href="/dashboard/user/services?type=feature" 
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-200 bg-white text-slate-700 font-semibold text-sm rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-356-1.754-.988-2.386l-.548-.547z" /></svg>
            নতুন ফিচার রিকোয়েস্ট করুন
          </Link>
        </div>

      </div>
    </div>
  );
}

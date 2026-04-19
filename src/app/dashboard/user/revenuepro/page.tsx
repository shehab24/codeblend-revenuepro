import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CreateLicenseForm } from "@/components/CreateLicenseForm";
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

  const license = await prisma.license.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  const isUnlocked = license?.status === "active";

  // Using a predefined Bengali locale for dates
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mt-4">
        {/* Header */}
        <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row items-center gap-8 justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">রেভিনিউ প্রো (Revenue Pro)</h1>
            </div>
            <p className="text-slate-500 max-w-md">
              আপনার ই-কমার্স বিজনেস অটোমেট করার সেরা মাধ্যম। ফ্রড ট্র্যাকিং, কুরিয়ার ইন্টিগ্রেশন এবং স্বয়ংক্রিয় এসএমএস ব্যবস্থা থেকে শুরু করে সব কিছুই একত্রে।
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative min-w-[200px]">
            <svg className="w-20 h-20 text-slate-200 absolute rotate-12 -right-4 -bottom-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            <div className="relative z-10 text-center w-full">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">স্ট্যাটাস</div>
              {isUnlocked ? (
                 <div className="text-emerald-500 font-bold flex flex-col items-center gap-1.5 justify-center mt-2">
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     অ্যাক্টিভ লাইসেন্স
                   </div>
                 </div>
              ) : license ? (
                 <div className="text-amber-500 font-bold flex flex-col items-center gap-1.5 justify-center mt-2">
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                     অ্যাপ্রুভাল এর অপেক্ষায়
                   </div>
                 </div>
              ) : (
                 <div className="text-slate-400 font-medium text-sm mt-2 flex justify-center">
                   সংযুক্ত নয়
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-col lg:flex-row border-b border-slate-100">
          
          {/* Features Section */}
          <div className="p-10 lg:w-3/5 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-center">
             <div className="mb-6">
                <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">রেভিনিউ প্রো সাবস্ক্রিপশন</h3>
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-bold text-slate-800">৳১০০০</span>
                   <span className="text-slate-500 font-medium">/ মাস</span>
                </div>
             </div>
             <p className="text-slate-600 text-sm mb-8 leading-relaxed">
               সম্পূর্ণ পার্সেল ম্যানেজমেন্ট এখন আপনার হাতের মুঠোয়। রিটার্ন রেট কমান এবং কোনো ম্যানুয়াল পরিশ্রম ছাড়াই বিক্রি কয়েকগুণ বৃদ্ধি করুন।
             </p>
             
             <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-700">
                  <div className="mt-0.5 bg-emerald-100 text-emerald-600 rounded-full p-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                  <span className="font-medium">স্মার্ট ফ্রড ডিটেকশন এবং ডেলিভারি রেশিও পরীক্ষক</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <div className="mt-0.5 bg-emerald-100 text-emerald-600 rounded-full p-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                  <span className="font-medium">স্ট্যাডফাস্ট, পাঠাও এবং রেডএক্স মাল্টি-কুরিয়ার এপিআই</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <div className="mt-0.5 bg-emerald-100 text-emerald-600 rounded-full p-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                  <span className="font-medium">অটোমেটেড অর্ডার কনফার্মেশন এসএমএস ও হোয়াটসঅ্যাপ ইঞ্জিন</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <div className="mt-0.5 bg-emerald-100 text-emerald-600 rounded-full p-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                  <span className="font-medium">পরিত্যক্ত কার্ট (Abandoned Cart) এ স্বয়ংক্রিয় মেসেজ প্রেরণ</span>
                </li>
             </ul>
          </div>

          {/* License Area */}
          <div className="p-10 lg:w-2/5 bg-slate-50/30 flex flex-col justify-center">
            {license ? (
              <div className="bg-white border text-left flex flex-col border-emerald-200 p-6 rounded-2xl shadow-sm text-center">
                 <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-4">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                 </div>
                 <h4 className="text-lg font-bold text-slate-800 mb-1">সাবস্ক্রিপশনের তথ্য</h4>
                 
                 <div className="flex flex-col divide-y divide-slate-100 my-4 text-left border border-slate-100 rounded-xl bg-slate-50 overflow-hidden">
                    <div className="flex justify-between p-3">
                       <span className="text-xs text-slate-500 font-semibold">শুরুর তারিখ:</span>
                       <span className="text-xs font-bold text-slate-700">
                         {isUnlocked ? formatDate(license.createdAt) : <span className="text-amber-500 italic font-normal">অনুমোদনের অপেক্ষায়</span>}
                       </span>
                    </div>
                    <div className="flex justify-between p-3">
                       <span className="text-xs text-slate-500 font-semibold">মেয়াদ শেষ হবে:</span>
                       <span className="text-xs font-bold text-emerald-600">
                         {isUnlocked ? (license.expirationDate ? formatDate(license.expirationDate) : "আজীবন (Lifetime)") : <span className="text-amber-500 italic font-normal">অনুমোদনের অপেক্ষায়</span>}
                       </span>
                    </div>
                 </div>

                 <p className="text-[0.8rem] text-slate-500 mb-2">ওয়েবসাইট ডোমেইন: <strong className="text-slate-700">{license.domain}</strong></p>
                 
                 <div className="bg-white rounded-xl p-3 border border-slate-200">
                    <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">লাইসেন্স কি (API KEY)</div>
                    {isUnlocked ? (
                       <code className="text-emerald-600 break-all text-xs font-mono">{license.key}</code>
                    ) : (
                       <div className="bg-slate-100 text-slate-400 text-xs px-3 py-2 rounded-lg blur-[2px] select-none font-mono flex items-center justify-center relative">
                         <span className="absolute text-slate-500 font-bold tracking-widest blur-none z-10 drop-shadow-sm">HIDDEN</span>
                         REVPRO-XXXXXXXXXXXXXXXX
                       </div>
                    )}
                 </div>
                 
                 {!isUnlocked ? (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[0.75rem] leading-relaxed text-amber-700">
                      আপনার লাইসেন্সটি অ্যাডমিন প্যানেল থেকে অনুমোদনের অপেক্ষায় আছে। অনুমোদন হওয়ার সাথে সাথেই আপনি নিচে থেকে প্লাগইন ডাউনলোড করতে পারবেন এবং আপনার API-Key দৃশ্যমান হবে।
                    </div>
                 ) : (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[0.75rem] leading-relaxed text-emerald-700">
                      আপনার লাইসেন্স অ্যাক্টিভ! এই কি (Key) আপনার ওয়ার্ডপ্রেস ড্যাশবোর্ডে গিয়ে Revenue Pro সেটিংসে ব্যবহার করুন।
                    </div>
                 )}
              </div>
            ) : (
              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-4 inline-flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  প্লাগইনের জন্য আবেদন করুন
                </h4>
                <CreateLicenseForm />
              </div>
            )}
          </div>
        </div>

        {/* Download Section */}
        <div className="p-10">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">প্লাগইন ডাউনলোড এবং ইনস্টলেশন</h3>
          
          <div className="flex flex-col gap-4">
            {downloadLinks.length === 0 && (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 shadow-inner">
                এই মুহূর্তে কোনো প্লাগইন ভার্সন আপলোড করা হয়নি।
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
                
                {link.link && isUnlocked ? (
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
                    {license ? "অ্যাপ্রুভাল এর অপেক্ষায়" : link.isLatest ? "লাইসেন্স তৈরি করুন" : "লকড (Locked)"}
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-5 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-blue-800 text-sm">
            <svg className="w-6 h-6 shrink-0 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="leading-relaxed">
              <strong>কীভাবে ইনস্টল করবেন:</strong> লাইসেন্স অ্যাপ্রুভ হওয়ার পর ডাউনলোড করা জিপ ফাইলটি আপনার ওয়ার্ডপ্রেস সাইটের প্যানেলে গিয়ে <strong>Plugins {'>'} Add New {'>'} Upload Plugin</strong> এ আপলোড এবং ইনস্টল করুন। এরপর সেটিংসে গিয়ে উপরের <strong>License Key</strong> টি প্রবেশ করান।
            </p>
          </div>
        </div>

        {/* Feature Request Section */}
        <div className="p-10 border-t border-slate-100 bg-slate-50/50 text-center">
          <h3 className="text-lg font-bold text-slate-800 mb-2">নতুন ফিচার প্রয়োজন?</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            আপনার যদি রেভিনিউ প্রো-তে নতুন কোনো ফিচার বা আপডেটের প্রয়োজন হয়, তবে আমাদের জানান। আমরা দ্রুত তা যুক্ত করার চেষ্টা করবো!
          </p>
          <Link 
            href="/dashboard/user/services?type=feature" 
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-200 bg-white text-slate-700 font-semibold text-sm rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            নতুন ফিচার রিকোয়েস্ট করুন
          </Link>
        </div>

      </div>
    </div>
  );
}

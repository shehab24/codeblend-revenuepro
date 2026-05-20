import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // Try to match standard and short youtube URLs
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  
  // If it's already an embed link, return as is
  if (url.includes("youtube.com/embed/")) {
    return url;
  }
  
  return null;
}

export default async function TutorialsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const [videoUrlSetting, playlistUrlSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "TUTORIAL_VIDEO_URL" } }),
    prisma.setting.findUnique({ where: { key: "TUTORIAL_PLAYLIST_URL" } }),
  ]);

  const rawVideoUrl = videoUrlSetting?.value || "";
  const playlistUrl = playlistUrlSetting?.value || "";
  const embedUrl = getYouTubeEmbedUrl(rawVideoUrl);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          প্লাগইন টিউটোরিয়াল ও সেটআপ গাইড
        </h1>
        <p className="text-lg text-slate-500">
          আপনার ওয়ার্ডপ্রেস সাইটে RevenuePro প্লাগইন এবং bKash পেমেন্ট গেটওয়ে কনফিগার করার সম্পূর্ণ গাইডলাইন ভিডিওটি দেখুন।
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {embedUrl ? (
          <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-slate-900 relative">
            <iframe
              src={embedUrl}
              title="RevenuePro Video Tutorial"
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center">
            <svg
              className="w-16 h-16 text-slate-300 mb-4 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
              />
            </svg>
            <h3 className="text-lg font-bold text-slate-700">কোন টিউটোরিয়াল ভিডিও সেট করা হয়নি</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              অ্যাডমিন খুব শীঘ্রই এখানে গুরুত্বপূর্ণ টিউটোরিয়াল গাইড ভিডিও যুক্ত করবেন। অনুগ্রহ করে পরে আবার চেক করুন।
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-slate-800">প্লেলিস্টের বাকি ভিডিওগুলো দেখতে চান?</h4>
            <p className="text-sm text-slate-500">আমাদের ইউটিউব চ্যানেলে সম্পূর্ণ সেটআপ প্লেলিস্ট পেয়ে যাবেন।</p>
          </div>
          
          {playlistUrl ? (
            <a
              href={playlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              See Full Playlist
            </a>
          ) : (
            <button
              disabled
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 text-slate-400 rounded-2xl font-bold text-sm cursor-not-allowed border border-slate-200/60"
            >
              See Full Playlist (Not Configured)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

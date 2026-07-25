import { LeadCTAButton } from "@/components/LeadPopup";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export const metadata = {
  title: "Features & Automations — CodeBlend Suite",
  description: "Granular breakdown of features for RevenuePro, CodePay, and Expense Tracker.",
};

export default async function FeaturesPage() {
  const { userId } = await auth();

  return (
    <div className="py-20 bg-slate-50 min-h-screen font-[var(--font-geist-sans)] overflow-x-hidden">
      {/* ═══════════ HERO ═══════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold text-slate-700">Comprehensive Suite Features ✨</span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-5 leading-tight max-w-4xl mx-auto">
          All Product Features &<br className="hidden sm:inline" />{" "}
          <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 bg-clip-text text-transparent">
            Automations Across Our Ecosystem
          </span>
        </h1>
        <p className="text-slate-550 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Explore the detailed capabilities of RevenuePro, CodePay Router, and Expense Tracker in one organized overview.
        </p>
      </section>

      {/* ═══════════ SECTION 1: REVENUEPRO SUITE ═══════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-8 mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
                <span>🛡️</span> Product 01: RevenuePro
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">RevenuePro Suite Features</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
                WooCommerce protection, automated fraud prevention, courier status syncing, and order verification tools.
              </p>
            </div>
            <Link
              href="/revenuepro"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start md:self-center"
            >
              Explore RevenuePro →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🛡️",
                title: "Automated Fraud Detection",
                desc: "Block duplicate orders, suspicious IP addresses, blacklisted mobile numbers, and serial return buyers automatically.",
              },
              {
                icon: "📱",
                title: "OTP Mobile Verification",
                desc: "Send instant SMS OTP verification codes to confirm buyer contact numbers before allowing order placement.",
              },
              {
                icon: "🛒",
                title: "Abandoned Cart Recovery",
                desc: "Capture partial checkout form inputs in real-time and send automated SMS and Email recovery alerts.",
              },
              {
                icon: "⚡",
                title: "One-Click Courier Upload",
                desc: "Dispatch orders directly to courier portals with automated parcel tracking status updates.",
              },
              {
                icon: "🖨️",
                title: "Bulk Printing Suite",
                desc: "Generate and print shipping labels, stickers, and customer order invoices in bulk with a single click.",
              },
              {
                icon: "📊",
                title: "WooCommerce Admin Panel",
                desc: "Verify buyer delivery history, delivery success rates, and previous order flags inside WP admin.",
              },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-white hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg mb-3">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">{item.title}</h3>
                <p className="text-slate-550 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 2: CODEPAY ROUTER ═══════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-8 mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wider mb-3">
                <span>💳</span> Product 02: CodePay
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">CodePay MFS Router Features</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
                Direct personal MFS payment routing, zero gateway commissions, and Android SMS auto-matching.
              </p>
            </div>
            <Link
              href="/codepay"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start md:self-center"
            >
              Explore CodePay →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                icon: "📲",
                title: "Personal MFS Router",
                desc: "Route bKash, Nagad, Rocket, and Upay checkout payments straight to your personal phone numbers.",
              },
              {
                icon: "💸",
                title: "0% Gateway Commissions",
                desc: "Save 2% to 3% on every order by completely eliminating traditional merchant payment gateway percentage fees.",
              },
              {
                icon: "🤖",
                title: "Android SMS Sync App",
                desc: "Automatically forward incoming SMS payment notifications from your phone to your store in real-time.",
              },
              {
                icon: "⚡",
                title: "Real-Time TrxID Auto-Match",
                desc: "Verify submitted MFS Transaction IDs instantly against live incoming SMS notifications.",
              },
              {
                icon: "🎨",
                title: "Dynamic Brand Customizer",
                desc: "Customize the checkout phone mockup frame border and colors to match your store brand theme.",
              },
              {
                icon: "🔀",
                title: "Multi-Channel Switcher",
                desc: "Automatically toggle or schedule active MFS payment options based on channel availability.",
              },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 hover:bg-white hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-lg mb-3">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">{item.title}</h3>
                <p className="text-slate-550 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 3: EXPENSE TRACKER ═══════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-8 mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
                <span>📊</span> Product 03: Expense Tracker
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Expense Tracker Features</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
                Automated SMS cashflow ledger, BDT & USD currency analytics, and Excel compilation exports.
              </p>
            </div>
            <Link
              href="/expense-tracker"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start md:self-center"
            >
              Explore Expense Tracker →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                icon: "📊",
                title: "Automated SMS Cashflow Sync",
                desc: "Automatically parse bKash and Nagad inflow and outflow SMS texts into structured financial ledgers.",
              },
              {
                icon: "💱",
                title: "BDT & USD Multi-Currency Board",
                desc: "Toggle between local BDT (৳) currency and converted USD ($) metrics across all financial charts.",
              },
              {
                icon: "🍰",
                title: "Category Allocations Chart",
                desc: "View category breakdowns for Shopping, Utilities, Bank Transfers, and custom business expenses.",
              },
              {
                icon: "⏱️",
                title: "Multi-Period Auditing Filters",
                desc: "Compare cashflow performance across This Month, Last 15 Days, and This Week calendar intervals.",
              },
              {
                icon: "🔍",
                title: "Sender Wallet Search & Filter",
                desc: "Search and filter wallet addresses to audit payouts to specific suppliers or customers immediately.",
              },
              {
                icon: "📥",
                title: "Excel & CSV Ledger Export",
                desc: "Download clean financial ledgers in Excel or CSV format for official bookkeeping and taxes.",
              },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg mb-3">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">{item.title}</h3>
                <p className="text-slate-550 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA SECTION ═══════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-indigo-600 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4">
              Ready to Automate & Protect Your E-commerce Store?
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-xl mx-auto mb-8 leading-relaxed">
              Get started with CodeBlend today and scale your business operations with our complete product suite.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!userId ? (
                <LeadCTAButton serviceType="Features Page CTA" className="w-full sm:w-auto px-6 py-3.5 bg-white text-emerald-700 rounded-2xl text-xs sm:text-sm font-bold hover:bg-emerald-50 transition-all shadow-md text-center cursor-pointer">
                  🚀 Start Free Trial →
                </LeadCTAButton>
              ) : (
                <Link href="/dashboard" className="w-full sm:w-auto px-6 py-3.5 bg-white text-emerald-700 rounded-2xl text-xs sm:text-sm font-bold hover:bg-emerald-50 transition-all shadow-md text-center">
                  🚀 Open Dashboard →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

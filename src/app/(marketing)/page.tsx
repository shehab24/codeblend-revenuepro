import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { LeadCTAButton } from "@/components/LeadPopup";
import { prisma } from "@/lib/prisma";
import { ShowcaseSlider } from "@/components/ShowcaseSlider";
import { PricingSectionWithTabs } from "@/components/PricingSectionWithTabs";

export default async function Home() {
  const { userId } = await auth();
  const showcaseCustomers = await prisma.showcaseCustomer.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div className="overflow-x-hidden w-full">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-purple-50/50" />
        <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-purple-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-emerald-100 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">All-in-One E-commerce & WordPress Suite ✨</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
            Build, Protect &<br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Scale Your Business
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-3xl mx-auto mb-8 leading-relaxed">
            Premium WordPress plugins, fraud prevention tools, MFS payment routing, and automated cashflow tracking solutions — everything you need to grow your online business.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10">
            {!userId ? (
              <LeadCTAButton serviceType="Get Started" className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 text-center cursor-pointer">🚀 Get Started Free →</LeadCTAButton>
            ) : (
              <Link href="/dashboard" className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 text-center inline-flex items-center justify-center">
                🚀 Launch Dashboard →
              </Link>
            )}
            <Link href="#products" className="w-full sm:w-auto px-6 py-3.5 bg-white text-slate-700 rounded-2xl text-sm font-bold border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all inline-flex items-center justify-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">▼</span>
              Explore Our Suite
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> 5-minute setup</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> 50+ Clients</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> 24/7 Support</span>
          </div>

          {/* Trust Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-12 max-w-lg mx-auto">
            {[
              { icon: "👥", value: "50+", label: "Clients" },
              { icon: "📦", value: "1M+", label: "Orders" },
              { icon: "📈", value: "99.9%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 px-3 sm:px-8 py-4 sm:py-5 shadow-sm">
                <div className="text-xl sm:text-2xl mb-1">{stat.icon}</div>
                <div className="text-lg sm:text-2xl font-extrabold text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CUSTOMER SHOWCASE ═══════════ */}
      {showcaseCustomers.length > 0 && (
        <section className="py-16 bg-slate-50/60 border-y border-slate-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-35" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[150px] bg-emerald-100/35 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 mb-10 text-center z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 mb-3 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold text-emerald-800 tracking-wider uppercase">Our Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trusted by E-commerce Leaders
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Powering operations and secure logistics for fast-growing brands.
            </p>
          </div>

          <div className="relative w-full overflow-hidden flex items-center z-10 px-4 sm:px-8">
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-36 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-36 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
            <ShowcaseSlider customers={showcaseCustomers} />
          </div>
        </section>
      )}

      {/* ═══════════ PROBLEMS SECTION ═══════════ */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 mb-5">
              <span className="text-red-500 text-sm">⚠️</span>
              <span className="text-xs sm:text-sm font-medium text-red-600">Common E-commerce Challenges</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
              Running business manually?<br />
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Facing these problems?</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">These problems are silently killing your profit margins every single day</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { num: "01", icon: "💸", title: "High Gateway Commission Fees", desc: "Losing 2% to 3% profit margins on every order to traditional payment gateways.", color: "bg-teal-500" },
              { num: "02", icon: "🚫", title: "Fake Orders Draining Budget", desc: "Ad budget & delivery shipping costs wasted on fake orders and serial returners.", color: "bg-red-500" },
              { num: "03", icon: "📊", title: "Untracked MFS Cashflow", desc: "Manual bKash/Nagad text entry leading to accounting errors & missed ledger logs.", color: "bg-indigo-500" },
              { num: "04", icon: "📦", title: "Return Parcel Losses", desc: "Uncollected parcels lost at courier hubs without automated return tracking.", color: "bg-orange-500" },
              { num: "05", icon: "⚡", title: "Complex Checkout Forms", desc: "Long multi-step checkout forms causing buyers to drop off before completing orders.", color: "bg-emerald-500" },
              { num: "06", icon: "🗂️", title: "Disorganized Expense Audit", desc: "Inflows & outflows scattered across SMS inbox instead of visual financial dashboards.", color: "bg-purple-500" },
              { num: "07", icon: "⏰", title: "Manual Courier Entry", desc: "Wasting hours daily re-typing delivery addresses into courier portals manually.", color: "bg-pink-500" },
              { num: "08", icon: "🔐", title: "Fake TrxID Submissions", desc: "Buyers submitting fake or reused bKash TrxIDs causing product dispatch losses.", color: "bg-cyan-500" },
              { num: "09", icon: "📈", title: "No Real-Time Profit Data", desc: "Running business blindly without clear net margin, expense, and order analytics.", color: "bg-blue-500" },
            ].map((item) => (
              <div key={item.num} className="group bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-emerald-100 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 ${item.color} rounded-xl flex items-center justify-center text-white text-xl shadow-md`}>
                    {item.icon}
                  </div>
                  <span className="text-slate-200 text-xs font-mono font-bold">{item.num}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ OUR 3 CORE PRODUCTS SHOWCASE ═══════════ */}
      <section id="products" className="py-16 md:py-24 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-5">
              <span className="text-emerald-500 text-sm">🛠️</span>
              <span className="text-xs sm:text-sm font-medium text-emerald-600">Our Complete Product Suite</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              Everything You Need to<br />
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 bg-clip-text text-transparent">Scale & Protect Your Store</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              Automate fraud protection, accept MFS payments with 0% gateway fees, and track your ledger cashflow in real-time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Product 1: RevenuePro */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg mb-6 group-hover:scale-105 transition-transform">
                  🛡️
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider mb-3">
                  Flagship WooCommerce Plugin
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">RevenuePro</h3>
                <p className="text-slate-550 text-xs sm:text-sm leading-relaxed mb-6">
                  Real-time courier fraud prevention, automated OTP confirmation popups, partial payment collections, and courier booking status updates.
                </p>
                <ul className="space-y-2 text-xs text-slate-650 mb-8 border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Automated Fraud Detection & IP Blocking</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> OTP Mobile Verification</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Abandoned Cart Recovery Alerts</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Courier Auto-Booking Status</li>
                </ul>
              </div>
              <Link href="/revenuepro" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-center text-xs shadow-md transition-all">
                Explore RevenuePro →
              </Link>
            </div>

            {/* Product 2: CodePay */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm hover:shadow-xl hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg mb-6 group-hover:scale-105 transition-transform">
                  💳
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md uppercase tracking-wider mb-3">
                  0% Commission MFS Router
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">CodePay Router</h3>
                <p className="text-slate-550 text-xs sm:text-sm leading-relaxed mb-6">
                  Route checkout payments straight to your personal bKash, Nagad, Rocket, or Upay numbers. Auto-match TrxIDs with SMS listener app.
                </p>
                <ul className="space-y-2 text-xs text-slate-650 mb-8 border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2"><span className="text-teal-500 font-bold">✓</span> Personal bKash/Nagad/Rocket Direct Router</li>
                  <li className="flex items-center gap-2"><span className="text-teal-500 font-bold">✓</span> Zero Merchant Gateway Fees</li>
                  <li className="flex items-center gap-2"><span className="text-teal-500 font-bold">✓</span> Android SMS Sync Listener Companion</li>
                  <li className="flex items-center gap-2"><span className="text-teal-500 font-bold">✓</span> Dynamic Brand Phone Customizer</li>
                </ul>
              </div>
              <Link href="/codepay" className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-center text-xs shadow-md transition-all">
                Explore CodePay →
              </Link>
            </div>

            {/* Product 3: Expense Tracker */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg mb-6 group-hover:scale-105 transition-transform">
                  📊
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md uppercase tracking-wider mb-3">
                  Cashflow Ledger Automation
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Expense Tracker</h3>
                <p className="text-slate-550 text-xs sm:text-sm leading-relaxed mb-6">
                  Automatically sync MFS inflow, outflow, and raw SMS transaction history into visual financial charts and Excel reports.
                </p>
                <ul className="space-y-2 text-xs text-slate-650 mb-8 border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2"><span className="text-indigo-500 font-bold">✓</span> Automated MFS SMS Inflow/Outflow Sync</li>
                  <li className="flex items-center gap-2"><span className="text-indigo-500 font-bold">✓</span> BDT (৳) & USD ($) Multi-Currency View</li>
                  <li className="flex items-center gap-2"><span className="text-indigo-500 font-bold">✓</span> Category Allocations & Ledger Audit</li>
                  <li className="flex items-center gap-2"><span className="text-indigo-500 font-bold">✓</span> Excel / CSV Export & Mobile App Sync</li>
                </ul>
              </div>
              <Link href="/expense-tracker" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-center text-xs shadow-md transition-all">
                Explore Expense Tracker →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SERVICES SECTION ═══════════ */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-5">
              <span className="text-purple-500 text-sm">⚡</span>
              <span className="text-xs sm:text-sm font-medium text-purple-600">Our Services</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
              Custom solutions for<br />
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">your unique needs</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { icon: "🔌", color: "bg-blue-500", title: "Custom WP Plugin Development", desc: "Tailored WordPress plugins built to your exact specifications. WooCommerce integrations, custom dashboards, and more." },
              { icon: "🤖", color: "bg-emerald-500", title: "E-commerce Automation", desc: "Automate courier uploads, order processing, stock management, and reporting. Save hours of manual work every day." },
              { icon: "🎨", color: "bg-pink-500", title: "Shopify & WooCommerce Themes", desc: "Custom, conversion-optimized themes and storefront designs that enhance the shopping experience and drive sales." },
              { icon: "🔗", color: "bg-purple-500", title: "API Integration", desc: "Connect your e-commerce store with courier APIs, payment gateways, SMS services, and third-party platforms seamlessly." },
              { icon: "📱", color: "bg-orange-500", title: "Landing Page Design", desc: "High-converting landing pages and marketing funnels designed to capture leads and maximize your ad spend ROI." },
              { icon: "🛠️", color: "bg-cyan-500", title: "Maintenance & Support", desc: "Ongoing technical support, security updates, performance optimization, and feature enhancements for your digital products." },
            ].map((service) => (
              <div key={service.title} className="group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:border-purple-100 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className={`w-12 h-12 ${service.color} rounded-2xl flex items-center justify-center text-xl shadow-md mb-4`}>
                  {service.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">{service.desc}</p>
                <LeadCTAButton serviceType={service.title} className="w-full py-2.5 bg-purple-50 text-purple-600 rounded-xl font-bold text-sm hover:bg-purple-100 transition-colors text-center cursor-pointer">
                  Start Now →
                </LeadCTAButton>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/services" className="text-slate-600 text-sm font-bold hover:text-purple-600">View all services →</Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES SECTION ═══════════ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-5">
              <span className="text-blue-500 text-sm">⚙️</span>
              <span className="text-xs sm:text-sm font-medium text-blue-600">Powerful Features</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
              All features and<br />
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">automation in one platform</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { icon: "🛡️", title: "Fake Order & Fraud Prevention", desc: "Block duplicates, bad IPs, blacklisted phone numbers & serial returners.", color: "bg-emerald-500" },
              { icon: "💳", title: "0% Commission MFS Router", desc: "Route bKash, Nagad & Rocket directly to personal numbers with 0% fee.", color: "bg-teal-500" },
              { icon: "📊", title: "Automated SMS Cashflow Sync", desc: "Android companion app parses MFS SMS alerts into visual ledger entries.", color: "bg-indigo-500" },
              { icon: "📱", title: "OTP Mobile Verification", desc: "Verify buyer phone numbers with instant SMS OTP popups before checkout.", color: "bg-purple-500" },
              { icon: "📲", title: "Real-time TrxID Auto-Match", desc: "Instantly verify MFS transaction IDs against live incoming SMS notifications.", color: "bg-cyan-500" },
              { icon: "📈", title: "Multi-Currency Cashflow Board", desc: "View net balance, inflow vs outflow metrics in BDT (৳) and USD ($).", color: "bg-blue-500" },
              { icon: "🛒", title: "Abandoned Cart Recovery", desc: "Track partial checkout forms and send automated recovery notifications.", color: "bg-pink-500" },
              { icon: "🎨", title: "Dynamic Brand Customizer", desc: "Customize checkout phone frames and brand colors matching store theme.", color: "bg-yellow-500" },
              { icon: "📥", title: "Excel & CSV Ledger Export", desc: "Download clean financial reports and transaction ledgers for auditing.", color: "bg-violet-500" },
              { icon: "⚡", title: "One-Click Courier Booking", desc: "Upload WooCommerce orders to courier portals with status syncing.", color: "bg-orange-500" },
              { icon: "🖨️", title: "Bulk Invoice & Sticker Print", desc: "Print shipping labels, stickers, and invoices in bulk with one click.", color: "bg-red-500" },
              { icon: "🔒", title: "Anti-Piracy Licensing", desc: "Secure RSA-signed licensing & instant multi-site plugin verification.", color: "bg-slate-600" },
            ].map((feature) => (
              <div key={feature.title} className="group bg-slate-50 rounded-2xl p-4 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition-all duration-300">
                <div className={`w-10 h-10 ${feature.color} rounded-xl flex items-center justify-center text-base shadow-md mb-3`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">{feature.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed hidden sm:block">{feature.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/features" className="text-slate-600 text-sm font-bold hover:text-blue-600">View all features & automations →</Link>
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING SECTION WITH TABS ═══════════ */}
      <PricingSectionWithTabs userId={userId} />

      {/* ═══════════ CTA SECTION ═══════════ */}
      <section className="py-16 md:py-24" id="contact">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-8 sm:p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white mb-4">
                Ready to grow your business?
              </h2>
              <p className="text-emerald-100 text-sm sm:text-lg max-w-xl mx-auto mb-8">
                Get started with CodeBlend today and transform how you manage your e-commerce operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {!userId ? (
                  <LeadCTAButton serviceType="Free Trial" className="w-full sm:w-auto px-6 py-3.5 bg-white text-emerald-600 rounded-2xl text-sm font-bold hover:bg-emerald-50 transition-all shadow-xl text-center">🚀 Start Free Trial</LeadCTAButton>
                ) : (
                  <Link href="/dashboard" className="w-full sm:w-auto px-6 py-3.5 bg-white text-emerald-600 rounded-2xl text-sm font-bold hover:bg-emerald-50 transition-all shadow-xl text-center">
                    🚀 Open Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

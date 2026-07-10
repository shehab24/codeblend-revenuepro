import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { LeadCTAButton } from "@/components/LeadPopup";
import { prisma } from "@/lib/prisma";
import { ShowcaseSlider } from "@/components/ShowcaseSlider";

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
            <span className="text-xs sm:text-sm font-medium text-slate-700">WordPress & E-commerce Solutions ✨</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
            Build, Protect &<br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Scale Your Business
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Premium WordPress plugins, fraud prevention tools, and custom e-commerce solutions — everything you need to grow your online business.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10">
            {!userId ? (
              <LeadCTAButton serviceType="Get Started" className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 text-center cursor-pointer">🚀 Get Started Free →</LeadCTAButton>
            ) : (
              <Link href="/dashboard" className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 text-center inline-flex items-center justify-center">
                🚀 Launch Dashboard →
              </Link>
            )}
            <Link href="/revenuepro" className="w-full sm:w-auto px-6 py-3.5 bg-white text-slate-700 rounded-2xl text-sm font-bold border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all inline-flex items-center justify-center gap-2">
              <span className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs">▶</span>
              Explore RevenuePro
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
            {/* Fade Gradients (Left and Right overlays) */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-36 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-36 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />

            {/* Showcase Slider */}
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
              { num: "01", icon: "📊", title: "No Profit-Loss Tracking", desc: "Business is running, but you don't know if you're actually making profit.", color: "bg-blue-500" },
              { num: "02", icon: "🚫", title: "Fake Orders Draining Budget", desc: "Budget exhausted on fake orders. Facebook Pixel health is destroyed.", color: "bg-red-500" },
              { num: "03", icon: "📦", title: "Return Parcel Issues", desc: "No tracking of return parcels — losing one parcel costs 10 sales of profit.", color: "bg-orange-500" },
              { num: "04", icon: "📋", title: "No Stock Management", desc: "No inventory tracking, products unavailable when orders actually come in.", color: "bg-emerald-500" },
              { num: "05", icon: "👥", title: "Team Management Problems", desc: "Hard to tell who's working and who's slacking in your team.", color: "bg-purple-500" },
              { num: "06", icon: "📉", title: "No Data Analysis", desc: "Without data, you can't understand where you're going wrong.", color: "bg-cyan-500" },
              { num: "07", icon: "💰", title: "Can't Track Product Profit", desc: "Can't figure out which product is profitable and which is losing money.", color: "bg-yellow-500" },
              { num: "08", icon: "⏰", title: "Manual Courier Entry", desc: "Wasting valuable time on repetitive manual courier entry tasks.", color: "bg-pink-500" },
              { num: "09", icon: "🗂️", title: "Disorganized Workflow", desc: "Messy operations without bulk invoice or sticker printing.", color: "bg-indigo-500" },
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

      {/* ═══════════ REVENUEPRO SECTION ═══════════ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-5">
              <span className="text-emerald-500 text-sm">🛡️</span>
              <span className="text-xs sm:text-sm font-medium text-emerald-600">Our Flagship Product</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-slate-900 mb-4">
              RevenuePro<br />
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Intelligence Platform</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Real-time courier fraud prevention, advanced analytics, and seamless WooCommerce integration to protect your profit margins.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/revenuepro" className="px-6 py-3.5 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 text-center">
                Get RevenuePro Now
              </Link>
              <Link href="/pricing" className="px-6 py-3.5 bg-white text-slate-700 rounded-2xl text-sm font-bold border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all text-center">
                View Pricing
              </Link>
            </div>
          </div>

          <div className="group relative bg-white rounded-3xl border border-slate-100 p-6 md:p-12 hover:shadow-2xl hover:border-emerald-100 transition-all duration-500 max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex-1">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg mb-5">
                🛡️
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">RevenuePro</h3>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-5">
                Increase revenue, boost sales, and eliminate losses by completely automating your manual workflow and blocking fake orders before they happen.
              </p>
              <Link href="/revenuepro" className="text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-2 text-sm">
                Learn more about RevenuePro →
              </Link>
            </div>
            <div className="bg-slate-900 rounded-2xl p-5 shadow-xl w-full md:w-72 font-mono text-sm">
              <h4 className="text-white border-b border-slate-700 pb-3 mb-3 text-xs sm:text-sm flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 Live Performance
              </h4>
              <div className="flex justify-between text-slate-400 mb-2 text-xs sm:text-sm"><span>Orders Saved:</span> <span className="text-emerald-400">1,240</span></div>
              <div className="flex justify-between text-slate-400 mb-2 text-xs sm:text-sm"><span>Loss Prevented:</span> <span className="text-emerald-400">৳ 24,800</span></div>
              <div className="flex justify-between text-slate-400 text-xs sm:text-sm"><span>Time Saved:</span> <span className="text-blue-400">8.4 hrs/day</span></div>
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
              { icon: "📋", title: "Incomplete Order Tracking", desc: "Track customers who fill forms but don't complete checkout.", color: "bg-blue-500" },
              { icon: "🛡️", title: "Fake Order Prevention", desc: "Block duplicates, OTP, and return customer detection.", color: "bg-emerald-500" },
              { icon: "📦", title: "Return Order Tracking", desc: "Monitor if couriers return all your parcels properly.", color: "bg-purple-500" },
              { icon: "⚡", title: "One-Click Courier", desc: "Upload orders to any courier with a single click.", color: "bg-orange-500" },
              { icon: "📊", title: "Detailed Reporting", desc: "Profit-loss, returns, stock & expense reports in one place.", color: "bg-pink-500" },
              { icon: "👥", title: "Employee Performance", desc: "Track order counts, return rates, and team performance.", color: "bg-cyan-500" },
              { icon: "🔔", title: "Stock Alerts", desc: "Get notifications when stock runs low.", color: "bg-yellow-500" },
              { icon: "🔌", title: "WooCommerce Integration", desc: "Seamlessly integrates with your WooCommerce store.", color: "bg-indigo-500" },
              { icon: "🖨️", title: "Bulk Print", desc: "Bulk invoice & sticker printing in seconds.", color: "bg-red-500" },
              { icon: "📋", title: "Task Management", desc: "Manage delivery problems efficiently.", color: "bg-teal-500" },
              { icon: "💰", title: "Expense Management", desc: "Track all your business expenses easily.", color: "bg-violet-500" },
              { icon: "🔒", title: "Secure Licensing", desc: "Anti-piracy RSA-signed license verification.", color: "bg-slate-600" },
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

      {/* ═══════════ PRICING SECTION ═══════════ */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">সহজ ও স্বচ্ছ প্রাইসিং প্ল্যান</h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">আপনার ই-কমার্স ব্যবসাকে স্বয়ংক্রিয় এবং ফ্রড-মুক্ত করতে সেরা প্ল্যানটি বেছে নিন।</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Plan 1 — Monthly */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.04)] hover:border-emerald-500/20 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div>
                <div className="mb-4">
                  <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">Start Smart</span>
                </div>
                <h3 className="text-slate-900 font-extrabold text-xl mb-2">Monthly Plan</h3>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">৳ ২৪৯</span>
                  <span className="text-slate-400 text-sm font-semibold">/মাস</span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm mb-8 leading-relaxed">নতুন স্টার্টআপ ও ছোট ই-কমার্স ব্যবসার জন্য সেরা শুরু।</p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">Built-in bKash পেমেন্ট (মার্চেন্ট ছাড়া)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">bKash API-এর মতো সহজ পেমেন্ট ভেরিফিকেশন</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">Partial Payment (আংশিক পেমেন্ট) সুবিধা</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">Automated Fraud Detection & ব্লকিং</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">পেমেন্ট মেথড অটো সুইচ (Switcher)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">IP, Email & browser ব্লকিং সিস্টেম</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">OTP দিয়ে মোবাইল নম্বর ভেরিফিকেশন</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">কার্ট রিকভারি ও অটো SMS/ইমেইল এলার্ট</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">SMS Integration ও ওটিপি ভেরিফিকেশন</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">কুরিয়ার অটো বুকিং ও স্ট্যাটাস আপডেট</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">পিক্সেল, কনভার্সন API ও UTM ট্র্যাকিং</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">COD অর্ডার প্লেসমেন্ট ও উন্নত চেকআউট</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">সন্দেহজনক অর্ডারে Instant Warning Popup</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">এবং আরও অনেক Premium Features</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4">
                {!userId ? (
                  <LeadCTAButton serviceType="Monthly Plan" className="w-full py-4 text-center bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.2)] hover:scale-[1.01] transition-all cursor-pointer text-sm">শুরু করুন</LeadCTAButton>
                ) : (
                  <Link href="/dashboard" className="w-full py-4 block text-center bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.2)] hover:scale-[1.01] transition-all text-sm">সাবস্ক্রাইব করুন</Link>
                )}
              </div>
            </div>

            {/* Plan 2 — 6 Months */}
            <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-3xl border-2 border-emerald-500/30 p-8 shadow-[0_25px_60px_-15px_rgba(16,185,129,0.15)] flex flex-col justify-between relative md:-translate-y-4 hover:scale-[1.02] transition-all duration-300 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.25)] border border-emerald-400/30">
                  🔥 Best Value
                </span>
              </div>
              
              <div>
                <h3 className="text-emerald-400 font-extrabold text-xl mb-2 mt-2">6 Months Plan</h3>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">৳ ১,৪৯৯</span>
                  <span className="text-slate-400 text-sm font-semibold">/৬ মাস</span>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm mb-8 leading-relaxed">ব্যবসার প্রয়োজনীয় সকল অ্যাডভান্সড অটোমেশন ও সাপোর্ট।</p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-300 font-medium leading-tight">Built-in bKash পেমেন্ট (মার্চেন্ট ছাড়া)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-300 font-medium leading-tight">bKash API-এর মতো সহজ পেমেন্ট ভেরিফিকেশন</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-300 font-medium leading-tight">Partial Payment (আংশিক পেমেন্ট) সুবিধা</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-300 font-medium leading-tight">Automated Fraud Detection & ব্লকিং</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-300 font-medium leading-tight">পেমেন্ট মেথড অটো সুইচ (Switcher)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-300 font-medium leading-tight">IP, Email & browser ব্লকিং সিস্টেম</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-300 font-medium leading-tight">OTP দিয়ে মোবাইল নম্বর ভেরিফিকেশন</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-300 font-medium leading-tight">কার্ট রিকভারি ও অটো SMS/ইমেইল এলার্ট</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-300 font-medium leading-tight">SMS Integration ও ওটিপি ভেরিফিকেশন</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-300 font-medium leading-tight">কুরিয়ার অটো বুকিং ও স্ট্যাটাস আপডেট</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-300 font-medium leading-tight">পিক্সেল, কনভার্সন API ও UTM ট্র্যাকিং</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-300 font-medium leading-tight">COD অর্ডার প্লেসমেন্ট ও উন্নত চেকআউট</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-300 font-medium leading-tight">সন্দেহজনক অর্ডারে Instant Warning Popup</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-300 font-medium leading-tight">এবং আরও অনেক ছোট-বড় Premium Features</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4">
                {!userId ? (
                  <LeadCTAButton serviceType="6 Months Plan" className="w-full py-4 text-center bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-extrabold rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.4)] hover:scale-[1.01] hover:brightness-105 transition-all cursor-pointer text-sm">শুরু করুন</LeadCTAButton>
                ) : (
                  <Link href="/dashboard" className="w-full py-4 block text-center bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-extrabold rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.4)] hover:scale-[1.01] hover:brightness-105 transition-all text-sm">সাবস্ক্রাইব করুন</Link>
                )}
              </div>
            </div>

            {/* Plan 3 — 1 Year */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.04)] hover:border-emerald-500/20 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div>
                <div className="mb-4">
                  <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">Ultimate Protection</span>
                </div>
                <h3 className="text-slate-900 font-extrabold text-xl mb-2">1 Year Plan</h3>
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">৳ ২,৯৯৯</span>
                  <span className="text-slate-400 text-sm font-semibold">/১ বছর</span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm mb-8 leading-relaxed">সম্পূর্ণ ফ্রড প্রোটেকশন ও প্রিমিয়াম স্কেলিং ফিচারস।</p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">Built-in bKash পেমেন্ট (মার্চেন্ট ছাড়া)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">bKash API-এর মতো পেমেন্ট ভেরিফিকেশন</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">Partial Payment (আংশিক পেমেন্ট) সুবিধা</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">Automated Fraud Detection & ব্লকিং</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">পেমেন্ট মেথড অটো সুইচ (Switcher)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">IP, Email & browser ব্লকিং সিস্টেম</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">OTP দিয়ে মোবাইল নম্বর ভেরিফিকেশন</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">কার্ট রিকভারি ও অটো SMS/ইমেইল এলার্ট</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">SMS Integration ও ওটিপি ভেরিফিকেশন</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">কুরিয়ার অটো বুকিং ও স্ট্যাটাস আপডেট</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">পিক্সেল, কনভার্সন API ও UTM ট্র্যাকিং</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">COD অর্ডার প্লেসমেন্ট ও উন্নত চেকআউট</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">সন্দেহজনক অর্ডারে Instant Warning Popup</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium leading-tight">এবং আরও অনেক Premium Features</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4">
                {!userId ? (
                  <LeadCTAButton serviceType="1 Year Plan" className="w-full py-4 text-center bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.2)] hover:scale-[1.01] transition-all cursor-pointer text-sm">শুরু করুন</LeadCTAButton>
                ) : (
                  <Link href="/dashboard" className="w-full py-4 block text-center bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.2)] hover:scale-[1.01] transition-all text-sm">সাবস্ক্রাইব করুন</Link>
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/pricing" className="text-slate-600 text-sm font-bold hover:text-emerald-600">সবগুলো ফিচার ও বিস্তারিত প্রাইসিং দেখুন →</Link>
          </div>
        </div>
      </section>

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

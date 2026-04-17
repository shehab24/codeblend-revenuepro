export const metadata = {
  title: "Features — CodeBlend",
  description: "Powerful features and automation in one platform.",
};

export default function FeaturesPage() {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <span className="text-blue-500 text-sm">⚙️</span>
            <span className="text-sm font-medium text-blue-600">Powerful Features</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
            All features and<br />
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">automation in one platform</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">
            All the tools you need to manage and grow your e-commerce business confidently.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          {[
            { icon: "📋", title: "Incomplete Order Tracking", desc: "Track customers who fill forms but don't complete checkout.", color: "bg-blue-500" },
            { icon: "🛡️", title: "Fake Order Prevention", desc: "Block duplicates, Checkout OTP, and return customer detection.", color: "bg-emerald-500" },
            { icon: "📦", title: "Return Order Tracking", desc: "Monitor if couriers return all your parcels properly.", color: "bg-purple-500" },
            { icon: "⚡", title: "One-Click Courier", desc: "Upload orders to any courier with a single click.", color: "bg-orange-500" },
            { icon: "📊", title: "Detailed Reporting", desc: "Profit-loss, returns, stock & expense reports in one place.", color: "bg-pink-500" },
            { icon: "👥", title: "Employee Performance", desc: "Track order counts, return rates, and team performance.", color: "bg-cyan-500" },
            { icon: "📦", title: "Product Stock Alerts", desc: "Get instant notifications when stock runs low.", color: "bg-yellow-500" },
            { icon: "🔌", title: "WordPress Integration", desc: "Seamlessly integrates with WooCommerce.", color: "bg-indigo-500" },
            { icon: "🖨️", title: "Bulk Print", desc: "Bulk invoice & sticker printing in seconds.", color: "bg-red-500" },
            { icon: "📋", title: "Task Management", desc: "Manage delivery problems efficiently.", color: "bg-teal-500" },
            { icon: "💰", title: "Expense Management", desc: "Track all your business expenses easily.", color: "bg-violet-500" },
            { icon: "🔒", title: "Secure Licensing", desc: "Anti-piracy RSA-signed license verification.", color: "bg-slate-600" },
          ].map((feature) => (
            <div key={feature.title} className="group bg-slate-50 rounded-2xl p-5 hover:bg-white hover:shadow-md hover:border-slate-100 border border-transparent transition-all duration-300">
              <div className={`w-11 h-11 ${feature.color} rounded-xl flex items-center justify-center text-lg shadow-md mb-4`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">{feature.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

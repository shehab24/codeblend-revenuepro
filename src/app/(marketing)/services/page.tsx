export const metadata = {
  title: "Services — CodeBlend",
  description: "Custom WP Plugin Development, E-commerce Automation, API Integration, and more.",
};

export default function ServicesPage() {
  return (
    <div className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6">
            <span className="text-purple-500 text-sm">⚡</span>
            <span className="text-sm font-medium text-purple-600">Our Services</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
            Custom solutions for<br />
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">your unique needs</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">
            From concept to deployment — we build exactly what your business needs to scale.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "🔌",
              color: "bg-blue-500",
              title: "Custom WP Plugin Development",
              desc: "Tailored WordPress plugins built to your exact specifications. WooCommerce integrations, custom dashboards, and more.",
            },
            {
              icon: "🤖",
              color: "bg-emerald-500",
              title: "E-commerce Automation",
              desc: "Automate courier uploads, order processing, stock management, and reporting. Save hours of manual work every day.",
            },
            {
              icon: "🔗",
              color: "bg-purple-500",
              title: "API Integration",
              desc: "Connect your e-commerce store with courier APIs, payment gateways, SMS services, and third-party platforms seamlessly.",
            },
            {
              icon: "🎨",
              color: "bg-pink-500",
              title: "Shopify & WooCommerce Themes",
              desc: "Custom, conversion-optimized themes and storefront designs that enhance the shopping experience and drive sales.",
            },
            {
              icon: "📱",
              color: "bg-orange-500",
              title: "Landing Page Design",
              desc: "High-converting landing pages and marketing funnels designed to capture leads and maximize your ad spend ROI.",
            },
            {
              icon: "🛠️",
              color: "bg-cyan-500",
              title: "Maintenance & Support",
              desc: "Ongoing technical support, security updates, performance optimization, and feature enhancements for your digital products.",
            },
          ].map((service) => (
            <div key={service.title} className="group bg-white rounded-2xl border border-slate-100 p-8 hover:shadow-lg hover:border-purple-100 hover:-translate-y-1 transition-all duration-300">
              <div className={`w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg mb-5`}>
                {service.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                C
              </div>
              <div>
                <span className="text-xl font-bold">CodeBlend</span>
                <span className="block text-xs text-slate-400 -mt-1">Digital Solutions</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Premium WordPress plugins, e-commerce automation, and custom development solutions. From order management to fraud prevention — everything in one place.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-300 mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/revenuepro" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">RevenuePro</Link></li>
              <li><Link href="/services" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">Services</Link></li>
              <li><Link href="/features" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-300 mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="text-slate-400 text-sm">📧 info@codeblend.co</li>
              <li className="text-slate-400 text-sm">📱 +880 1XXXXXXXXX</li>
              <li className="text-slate-400 text-sm">📍 Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2026 CodeBlend. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-emerald-400 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-500 hover:text-emerald-400 text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

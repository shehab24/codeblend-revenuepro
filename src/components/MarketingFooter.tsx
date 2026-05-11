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
              <li className="text-slate-400 text-sm">
                <a href="https://wa.me/8801570296656" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  WhatsApp: 01570296656
                </a>
              </li>
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

import { ServiceRequestForm } from "./ServiceRequestForm";

export const metadata = {
  title: "Get Service | CodeBlend",
};

export default function ServicesPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-4">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-10 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2">Ready to start a new project?</h2>
            <p className="text-emerald-50 text-sm max-w-md">
              Let us know what you need. Our team will review your requirements, assign an expected delivery date, and prepare your invoice.
            </p>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        <div className="p-8">
          <ServiceRequestForm />
        </div>
      </div>
    </div>
  );
}

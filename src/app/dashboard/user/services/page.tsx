import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CodeBracketSquareIcon,
  PlusIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { DASH_CARD, PageHeader } from "@/components/dashboard/ui";
import { ServiceRequestForm } from "./ServiceRequestForm";

export const metadata = {
  title: "Get Service | CodeBlend",
};

const STEPS = [
  { title: "Tell us what you need", desc: "Describe your project in the form." },
  { title: "We review & quote", desc: "You get a fixed price and delivery date." },
  { title: "Track progress here", desc: "Follow status, notes and invoices in My Services." },
];

const PILLARS = [
  { icon: CodeBracketSquareIcon, label: "WordPress & WooCommerce", cls: "bg-sky-50 text-sky-600 ring-sky-100" },
  { icon: SparklesIcon, label: "AI automation", cls: "bg-violet-50 text-violet-600 ring-violet-100" },
  { icon: ShoppingBagIcon, label: "Shopify", cls: "bg-lime-50 text-lime-700 ring-lime-100" },
];

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Request a service"
        description="Start a new project with our team. We'll review your requirements, confirm a delivery date and prepare your invoice."
        icon={<PlusIcon className="h-6 w-6" />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className={`${DASH_CARD} overflow-hidden`}>
          <div className="relative overflow-hidden bg-slate-950 px-6 py-7 text-white sm:px-8">
            <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-emerald-500/25 blur-3xl" />
            <h2 className="relative text-lg font-semibold">Ready to start a new project?</h2>
            <p className="relative mt-1 max-w-md text-sm text-slate-400">Fill in the details below — it takes about two minutes.</p>
          </div>
          <div className="p-6 sm:p-8">
            <ServiceRequestForm />
          </div>
        </section>

        <aside className="space-y-6">
          <section className={`${DASH_CARD} p-6`}>
            <h3 className="text-[15px] font-semibold text-slate-950">How it works</h3>
            <ol className="mt-5 space-y-5">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">{i + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={`${DASH_CARD} p-6`}>
            <h3 className="text-[15px] font-semibold text-slate-950">What we build</h3>
            <ul className="mt-4 space-y-2.5">
              {PILLARS.map((p) => (
                <li key={p.label} className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${p.cls}`}>
                    <p.icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-sm font-medium text-slate-700">{p.label}</span>
                </li>
              ))}
            </ul>
            <ul className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-xs text-slate-500">
              <li className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-emerald-500" /> Fixed price before work starts</li>
              <li className="flex items-center gap-2"><ClipboardDocumentCheckIcon className="h-4 w-4 text-emerald-500" /> Status and notes tracked in your portal</li>
            </ul>
          </section>

          <a
            href="https://wa.me/8801570296656"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200 transition hover:bg-emerald-100/70"
          >
            <ChatBubbleLeftRightIcon className="h-6 w-6 shrink-0 text-emerald-600" />
            <span>
              <span className="block text-sm font-semibold text-emerald-900">Prefer to talk first?</span>
              <span className="block text-xs text-emerald-700">Chat with us on WhatsApp</span>
            </span>
          </a>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { adminSendEmailToUser } from "./actions";

interface Props {
  recipientEmail: string;
  recipientName: string;
  requestId: string;
  serviceType: string;
}

const EMAIL_TEMPLATES = [
  {
    id: "subscription_started",
    label: "✅ Subscription Started",
    subject: "Your RevenuePro Subscription Has Started!",
    body: `Hi {name},

Great news! Your RevenuePro subscription has been successfully activated.

You can now log in to your dashboard and access all features:
👉 https://codeblend.co/dashboard/user/revenuepro

If you have any questions, feel free to reply to this email or contact us via WhatsApp.

Best regards,
CodeBlend Team`,
  },
  {
    id: "free_trial_instructions",
    label: "🆓 Free Trial Instructions",
    subject: "How to Start Your RevenuePro Free Trial",
    body: `Hi {name},

Thank you for applying for the RevenuePro free trial! Here's how to get started:

1. Log in to your dashboard at https://codeblend.co/dashboard
2. Navigate to "Revenue Pro" in the sidebar
3. Download the plugin from your dashboard
4. Install and activate it on your WordPress site
5. Enter your license key in the plugin settings

Your trial license key is available in your dashboard. If you need any help, feel free to reach out.

Best regards,
CodeBlend Team`,
  },
  {
    id: "payment_received",
    label: "💳 Payment Received",
    subject: "Payment Received — Thank You!",
    body: `Hi {name},

We've successfully received your payment for your service request. 

Our team will begin processing your request and you will be notified once it's underway.

You can track the progress of your request here:
👉 https://codeblend.co/dashboard/user/requests

Thank you for choosing CodeBlend!

Best regards,
CodeBlend Team`,
  },
  {
    id: "request_update",
    label: "🔄 Request Status Update",
    subject: "Update on Your Service Request",
    body: `Hi {name},

We wanted to give you a quick update on your service request ({serviceType}).

Our team is actively working on it and we'll keep you posted on the progress. Please check your dashboard for the latest status.

👉 https://codeblend.co/dashboard/user/requests

If you have any questions or concerns, don't hesitate to reach out.

Best regards,
CodeBlend Team`,
  },
  {
    id: "custom",
    label: "✏️ Custom Message",
    subject: "",
    body: "",
  },
];

export function AdminSendEmailModal({ recipientEmail, recipientName, requestId, serviceType }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setResult(null);
    const tpl = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (tpl && templateId !== "custom") {
      setSubject(tpl.subject);
      setBody(
        tpl.body
          .replace(/{name}/g, recipientName || "there")
          .replace(/{serviceType}/g, serviceType || "your request")
      );
    }
  };

  const handleOpen = () => {
    setResult(null);
    setSelectedTemplate("custom");
    setSubject("");
    setBody("");
    setIsOpen(true);
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) return;
    startTransition(async () => {
      const res = await adminSendEmailToUser({
        requestId,
        recipientEmail,
        recipientName,
        subject: subject.trim(),
        body: body.trim(),
      });
      setResult(res);
      if (res.success) {
        setTimeout(() => setIsOpen(false), 1800);
      }
    });
  };

  return (
    <>
      <button
        onClick={handleOpen}
        title="Send email to user"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-semibold text-xs border border-indigo-200 hover:bg-indigo-100 transition"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
        Email
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-slate-800">Send Email</h3>
                <p className="text-xs text-slate-400 mt-0.5">To: {recipientName} &lt;{recipientEmail}&gt;</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Template selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Quick Templates
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMAIL_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => applyTemplate(tpl.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        selectedTemplate === tpl.id
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message here..."
                  rows={10}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition resize-none font-mono"
                />
                <p className="text-[0.65rem] text-slate-400 mt-1">Plain text. Line breaks are preserved.</p>
              </div>

              {/* Result feedback */}
              {result && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold ${
                    result.success
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-red-50 text-red-600 border border-red-100"
                  }`}
                >
                  {result.success ? (
                    <>
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Email sent successfully!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      {result.error || "Failed to send email."}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition border-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={isPending || !subject.trim() || !body.trim()}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

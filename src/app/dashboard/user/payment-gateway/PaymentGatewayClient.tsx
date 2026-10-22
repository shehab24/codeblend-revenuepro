"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { saveGatewaySettings, saveBrandingSettings, generateGatewayKeys, simulateSandboxSms, createSandboxPayment, addBankAccount, deleteBankAccount, toggleBankAccountActive, saveBkashMerchantSettings } from "./actions";

interface BkashSmsTx {
  id: string;
  trxId: string;
  sender: string;
  amount: number;
  rawMessage: string;
  senderAddress: string;
  status: string;
  orderId: string | null;
  createdAt: string;
}

interface PaymentGatewayClientProps {
  initialTransactions: BkashSmsTx[];
  stats: {
    totalCount: number;
    unusedCount: number;
    usedCount: number;
    totalAmount: number;
  };
  gatewaySettings: {
    apiKey: string | null;
    apiSecret: string | null;
    bkash: string;
    nagad: string;
    rocket: string;
    upay: string;
    cellfin: string;
    tap: string;
    bkashActive: boolean;
    nagadActive: boolean;
    rocketActive: boolean;
    upayActive: boolean;
    cellfinActive: boolean;
    tapActive: boolean;
    bkashType: "personal" | "merchant";
    bkashQr: string;
    withTrx: boolean;
    withoutTrx: boolean;
    bankAccounts: {
      id: string;
      bankName: string;
      accountName: string;
      accountNo: string;
      branch: string;
      active: boolean;
    }[];
    active: boolean;
    brandName: string;
    brandLogo: string;
    brandColor: string;
  };
  apkLinks?: {
    id: string;
    version: string;
    name: string;
    link: string;
    isLatest: boolean;
  }[];
  downloadAllowed?: boolean;
}

type TabType = "transactions" | "settings" | "api" | "app";

export default function PaymentGatewayClient({
  initialTransactions,
  stats,
  gatewaySettings,
  apkLinks = [],
  downloadAllowed = true,
}: PaymentGatewayClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derive active tab from URL (?tab=transactions|settings|api|app)
  const activeTab: TabType = useMemo(() => {
    const t = searchParams.get("tab");
    if (t === "settings" || t === "app") return t;
    if (t === "api" && gatewaySettings.active) return t;
    return "transactions";
  }, [searchParams, gatewaySettings.active]);

  const setActiveTab = useCallback((tab: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const latestApkLink = useMemo(() => {
    return apkLinks.find((l) => l.isLatest) || apkLinks[0] || null;
  }, [apkLinks]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [showSandboxSuccess, setShowSandboxSuccess] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("sandbox_status") === "success") {
        setShowSandboxSuccess(true);
        // Remove sandbox_status but keep tab param
        const next = new URLSearchParams(params.toString());
        next.delete("sandbox_status");
        const qs = next.toString();
        window.history.replaceState({}, document.title, qs ? `${pathname}?${qs}` : pathname);
      }
    }
  }, [pathname]);

  // Settings states
  const [bkash, setBkash] = useState(gatewaySettings.bkash);
  const [nagad, setNagad] = useState(gatewaySettings.nagad);
  const [rocket, setRocket] = useState(gatewaySettings.rocket);
  const [upay, setUpay] = useState(gatewaySettings.upay || "");
  const [cellfin, setCellfin] = useState(gatewaySettings.cellfin || "");
  const [tap, setTap] = useState(gatewaySettings.tap || "");

  const [bkashActive, setBkashActive] = useState(gatewaySettings.bkashActive);
  const [nagadActive, setNagadActive] = useState(gatewaySettings.nagadActive);
  const [rocketActive, setRocketActive] = useState(gatewaySettings.rocketActive);
  const [upayActive, setUpayActive] = useState(gatewaySettings.upayActive);
  const [cellfinActive, setCellfinActive] = useState(gatewaySettings.cellfinActive);
  const [tapActive, setTapActive] = useState(gatewaySettings.tapActive);

  const [withTrx, setWithTrx] = useState(gatewaySettings.withTrx);
  const [withoutTrx, setWithoutTrx] = useState(gatewaySettings.withoutTrx);

  // Bank transfer state
  const [bankAccounts, setBankAccounts] = useState(gatewaySettings.bankAccounts || []);
  const [newBankName, setNewBankName] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountNo, setNewAccountNo] = useState("");
  const [newBranch, setNewBranch] = useState("");
  const [isAddingBank, setIsAddingBank] = useState(false);

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Branding states
  const [brandName, setBrandName] = useState(gatewaySettings.brandName);
  const [brandLogo, setBrandLogo] = useState(gatewaySettings.brandLogo);
  const [brandColor, setBrandColor] = useState(gatewaySettings.brandColor);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [brandSaveMsg, setBrandSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [logoInputMode, setLogoInputMode] = useState<"upload" | "url">("upload");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBrandLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Dynamic Gateway Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [formProvider, setFormProvider] = useState<"bkash" | "nagad" | "rocket" | "upay" | "cellfin" | "tap">("bkash");
  const [formNumber, setFormNumber] = useState("");
  const [editingProvider, setEditingProvider] = useState<"bkash" | "nagad" | "rocket" | "upay" | "cellfin" | "tap" | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // bKash merchant (Payment / QR) settings
  const [bkashType, setBkashType] = useState<"personal" | "merchant">(gatewaySettings.bkashType);
  const [bkashQr, setBkashQr] = useState(gatewaySettings.bkashQr);
  const [formBkashType, setFormBkashType] = useState<"personal" | "merchant">(gatewaySettings.bkashType);
  const [formQr, setFormQr] = useState(gatewaySettings.bkashQr);
  const [formQrFile, setFormQrFile] = useState<File | null>(null);
  const [qrInputMode, setQrInputMode] = useState<"upload" | "url">("upload");

  // Bank form visibility
  const [showBankForm, setShowBankForm] = useState(false);

  // API credentials states
  const [apiKey, setApiKey] = useState(gatewaySettings.apiKey);
  const [apiSecret, setApiSecret] = useState(gatewaySettings.apiSecret);
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<"php" | "node" | "curl">("php");

  // Sandbox simulation states
  const [sandboxMethod, setSandboxMethod] = useState<"bkash" | "nagad" | "rocket" | "upay" | "cellfin" | "tap">("bkash");
  const [sandboxAmount, setSandboxAmount] = useState("1200");
  const [sandboxSender, setSandboxSender] = useState("01712345678");
  const [sandboxTrxId, setSandboxTrxId] = useState(() => `TXN${Math.floor(100000 + Math.random() * 900000)}CP`);
  const [isSimulating, setIsSimulating] = useState(false);
  const [sandboxMessage, setSandboxMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [generatedSandboxUrl, setGeneratedSandboxUrl] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter((tx) => {
      const matchesSearch =
        tx.trxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.orderId && tx.orderId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || tx.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [initialTransactions, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const toggleExpand = (id: string) => {
    setExpandedTxId(expandedTxId === id ? null : id);
  };

  const saveSettingsDirectly = async (
    nextBkash: string,
    nextNagad: string,
    nextRocket: string,
    nextUpay: string,
    nextCellfin: string,
    nextTap: string
  ) => {
    setIsSavingSettings(true);
    setSaveMessage(null);
    try {
      const formData = new FormData();
      formData.append("bkash", nextBkash);
      formData.append("nagad", nextNagad);
      formData.append("rocket", nextRocket);
      formData.append("upay", nextUpay);
      formData.append("cellfin", nextCellfin);
      formData.append("tap", nextTap);
      const res = await saveGatewaySettings(formData);
      if (res.success) {
        setSaveMessage({ type: "success", text: "Merchant payment configurations updated successfully!" });
        setShowAddForm(false);
        setEditingProvider(null);
        setFormNumber("");
      } else {
        setSaveMessage({ type: "error", text: "Failed to save configurations." });
      }
    } catch (err: any) {
      setSaveMessage({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleToggleGatewayActive = async (provider: "bkash" | "nagad" | "rocket" | "upay" | "cellfin" | "tap") => {
    let nextBkashActive = bkashActive;
    let nextNagadActive = nagadActive;
    let nextRocketActive = rocketActive;
    let nextUpayActive = upayActive;
    let nextCellfinActive = cellfinActive;
    let nextTapActive = tapActive;

    if (provider === "bkash") { nextBkashActive = !bkashActive; setBkashActive(nextBkashActive); }
    else if (provider === "nagad") { nextNagadActive = !nagadActive; setNagadActive(nextNagadActive); }
    else if (provider === "rocket") { nextRocketActive = !rocketActive; setRocketActive(nextRocketActive); }
    else if (provider === "upay") { nextUpayActive = !upayActive; setUpayActive(nextUpayActive); }
    else if (provider === "cellfin") { nextCellfinActive = !cellfinActive; setCellfinActive(nextCellfinActive); }
    else if (provider === "tap") { nextTapActive = !tapActive; setTapActive(nextTapActive); }

    try {
      const fd = new FormData();
      fd.append("brandName", brandName);
      fd.append("brandColor", brandColor);
      fd.append("brandLogo", brandLogo);
      fd.append("withTrx", String(withTrx));
      fd.append("withoutTrx", String(withoutTrx));
      
      fd.append("bkashActive", String(nextBkashActive));
      fd.append("nagadActive", String(nextNagadActive));
      fd.append("rocketActive", String(nextRocketActive));
      fd.append("upayActive", String(nextUpayActive));
      fd.append("cellfinActive", String(nextCellfinActive));
      fd.append("tapActive", String(nextTapActive));

      await saveBrandingSettings(fd);
    } catch (err: any) {
      alert("Failed to toggle gateway status: " + err.message);
    }
  };

  const getProviderActive = (provider: string) => {
    if (provider === "bkash") return bkashActive;
    if (provider === "nagad") return nagadActive;
    if (provider === "rocket") return rocketActive;
    if (provider === "upay") return upayActive;
    if (provider === "cellfin") return cellfinActive;
    if (provider === "tap") return tapActive;
    return false;
  };

  const openGatewayModal = (provider: "bkash" | "nagad" | "rocket" | "upay" | "cellfin" | "tap", editing: boolean, number = "") => {
    setFormProvider(provider);
    setEditingProvider(editing ? provider : null);
    setFormNumber(number);
    setFormBkashType(bkashType);
    setFormQr(bkashQr);
    setFormQrFile(null);
    setQrInputMode(bkashQr && !bkashQr.includes("ik.imagekit.io") ? "url" : "upload");
    setModalError(null);
    setShowAddForm(true);
  };

  const closeGatewayModal = () => {
    setShowAddForm(false);
    setEditingProvider(null);
    setFormNumber("");
    setFormQrFile(null);
    setModalError(null);
  };

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setModalError("QR code must be an image file (PNG, JPG or WEBP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setModalError("QR code image must be 2MB or smaller.");
      return;
    }
    setModalError(null);
    setFormQrFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) setFormQr(event.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGatewaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let nextBkash = bkash;
    let nextNagad = nagad;
    let nextRocket = rocket;
    let nextUpay = upay;
    let nextCellfin = cellfin;
    let nextTap = tap;

    const providerToSet = editingProvider || formProvider;

    // bKash: persist account type + merchant QR before the number
    if (providerToSet === "bkash") {
      setIsSavingSettings(true);
      setModalError(null);
      try {
        const fd = new FormData();
        fd.append("bkashType", formBkashType);
        if (formQrFile) {
          fd.append("qrFile", formQrFile);
        } else if (formQr && !formQr.startsWith("data:")) {
          fd.append("bkashQr", formQr);
        }
        const res = await saveBkashMerchantSettings(fd);
        setBkashType(res.bkashType as "personal" | "merchant");
        setBkashQr(res.bkashQr || "");
        setFormQrFile(null);
      } catch (err: any) {
        setModalError(err.message || "Failed to save bKash merchant settings.");
        setIsSavingSettings(false);
        return;
      }
    }

    if (providerToSet === "bkash") {
      nextBkash = formNumber;
      setBkash(formNumber);
    } else if (providerToSet === "nagad") {
      nextNagad = formNumber;
      setNagad(formNumber);
    } else if (providerToSet === "rocket") {
      nextRocket = formNumber;
      setRocket(formNumber);
    } else if (providerToSet === "upay") {
      nextUpay = formNumber;
      setUpay(formNumber);
    } else if (providerToSet === "cellfin") {
      nextCellfin = formNumber;
      setCellfin(formNumber);
    } else if (providerToSet === "tap") {
      nextTap = formNumber;
      setTap(formNumber);
    }

    await saveSettingsDirectly(nextBkash, nextNagad, nextRocket, nextUpay, nextCellfin, nextTap);
  };

  const handleDeleteGateway = (provider: "bkash" | "nagad" | "rocket" | "upay" | "cellfin" | "tap") => {
    if (!confirm(`Are you sure you want to delete the ${provider} gateway?`)) {
      return;
    }

    let nextBkash = bkash;
    let nextNagad = nagad;
    let nextRocket = rocket;
    let nextUpay = upay;
    let nextCellfin = cellfin;
    let nextTap = tap;

    if (provider === "bkash") {
      nextBkash = "";
      setBkash("");
    } else if (provider === "nagad") {
      nextNagad = "";
      setNagad("");
    } else if (provider === "rocket") {
      nextRocket = "";
      setRocket("");
    } else if (provider === "upay") {
      nextUpay = "";
      setUpay("");
    } else if (provider === "cellfin") {
      nextCellfin = "";
      setCellfin("");
    } else if (provider === "tap") {
      nextTap = "";
      setTap("");
    }

    saveSettingsDirectly(nextBkash, nextNagad, nextRocket, nextUpay, nextCellfin, nextTap);
  };

  const handleGenerateKeys = async () => {
    if (!confirm("Are you sure you want to generate new API Keys? This will invalidate your old keys and break existing integrations!")) {
      return;
    }
    setIsGeneratingKeys(true);
    try {
      const res = await generateGatewayKeys();
      if (res.success && res.apiKey && res.apiSecret) {
        setApiKey(res.apiKey);
        setApiSecret(res.apiSecret);
      }
    } catch (err: any) {
      alert("Failed to generate keys: " + err.message);
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  const handleSimulateSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSandboxMessage(null);
    try {
      const formData = new FormData();
      formData.append("method", sandboxMethod);
      formData.append("amount", sandboxAmount);
      formData.append("sender", sandboxSender);
      formData.append("trxId", sandboxTrxId);

      const res = await simulateSandboxSms(formData);
      if (res.success) {
        setSandboxMessage({
          type: "success",
          text: `Simulated SMS successfully! TrxID: ${res.trxId} is now live in your unused logs.`,
        });
        // Generate a new random TrxID for the next test
        setSandboxTrxId(`TXN${Math.floor(100000 + Math.random() * 900000)}CP`);
      }
    } catch (err: any) {
      setSandboxMessage({ type: "error", text: err.message || "SMS simulation failed." });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCreateSandboxPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSandboxMessage(null);
    setGeneratedSandboxUrl(null);
    try {
      const formData = new FormData();
      formData.append("amount", sandboxAmount);

      const res = await createSandboxPayment(formData, window.location.origin);
      if (res.success && res.paymentUrl) {
        setGeneratedSandboxUrl(res.paymentUrl);
        setSandboxMessage({
          type: "success",
          text: `Sandbox checkout generated successfully! Click 'Launch Sandbox Checkout' and use TrxID 'SANDBOX123' to verify.`,
        });
      }
    } catch (err: any) {
      setSandboxMessage({ type: "error", text: err.message || "Sandbox checkout generation failed." });
    } finally {
      setIsSimulating(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const connectedWallets = [bkash, nagad, rocket, upay, cellfin, tap].filter(Boolean).length;
  const activeBanks = bankAccounts.filter((b: any) => b.active).length;

  const TAB_META: Record<TabType, { label: string; icon: IconName }> = {
    transactions: { label: "Transactions", icon: "list" },
    settings: { label: "Gateway Settings", icon: "settings" },
    api: { label: "Developer API", icon: "code" },
    app: { label: "Android App", icon: "phone" },
  };

  return (
    <div className="space-y-6">
      {showSandboxSuccess && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-5 sm:p-6 text-white shadow-lg shadow-emerald-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 shrink-0 rounded-2xl bg-white/20 flex items-center justify-center"><Icon name="check" className="w-5 h-5" /></span>
            <div>
              <h3 className="font-extrabold text-base">Sandbox payment verified successfully!</h3>
              <p className="text-xs text-white/85 mt-0.5 leading-relaxed">
                The checkout matched your simulated SMS, marked the payment as completed, and redirected back to your callback URL.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSandboxSuccess(false)}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold transition cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-6 sm:p-8 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-cyan-50/60" />
        <div className="absolute -top-24 -right-16 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-emerald-100 shadow-sm">
              <span className={`w-2 h-2 rounded-full ${gatewaySettings.active ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`} />
              <span className="text-xs font-semibold text-slate-700">
                {gatewaySettings.active ? "Gateway live" : "Gateway suspended"}
              </span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                CodePay{" "}
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">Gateway</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1.5 max-w-xl leading-relaxed">
                Connect your MFS wallets and bank accounts, auto-verify payments from synced SMS, and integrate checkout into any website.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 shrink-0">
            {latestApkLink && (
              downloadAllowed !== false ? (
                latestApkLink.link ? (
                  <a
                    href={latestApkLink.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-200 transition no-underline"
                  >
                    <Icon name="download" className="w-4 h-4" />
                    Download App {latestApkLink.version ? `v${latestApkLink.version}` : ""}
                  </a>
                ) : null
              ) : (
                <span
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 text-slate-400 text-sm font-bold border border-slate-200 cursor-not-allowed"
                  title="Download access restricted by Administrator"
                >
                  <Icon name="lock" className="w-4 h-4" />
                  Download Restricted
                </span>
              )
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { label: "Wallets connected", value: `${connectedWallets}/6`, icon: "wallet" as IconName },
            { label: "Bank accounts", value: String(activeBanks), icon: "bank" as IconName },
            { label: "Verification", value: withoutTrx ? "Auto-match" : "TrxID", icon: "shield" as IconName },
            { label: "API keys", value: apiKey ? "Generated" : "Not set", icon: "key" as IconName },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur border border-slate-100 px-4 py-3 shadow-sm">
              <span className="w-9 h-9 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Icon name={s.icon} className="w-4 h-4" /></span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-slate-900 truncate">{s.value}</p>
                <p className="text-[11px] text-slate-500 leading-tight">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs (URL-driven) ── */}
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <div className="inline-flex min-w-max gap-1 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/60">
          {(["transactions", "settings", "api", "app"] as const)
            .filter((tab) => tab !== "api" || gatewaySettings.active)
            .map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Icon name={TAB_META[tab].icon} className={`w-4 h-4 ${isActive ? "text-emerald-500" : ""}`} />
                  {TAB_META[tab].label}
                </button>
              );
            })}
        </div>
      </div>

      {activeTab === "transactions" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {latestApkLink && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white shadow-lg shadow-emerald-200/50">
              <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
              <div className="absolute right-24 -bottom-16 w-40 h-40 rounded-full bg-white/10" />
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <span className="w-12 h-12 shrink-0 rounded-2xl bg-white/20 flex items-center justify-center"><Icon name="phone" className="w-6 h-6" /></span>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-base">Android SMS Listener {latestApkLink.version ? `v${latestApkLink.version}` : ""}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">Required</span>
                    </div>
                    <p className="text-[13px] text-white/90 max-w-2xl leading-relaxed">
                      ইনকামিং পেমেন্ট SMS স্বয়ংক্রিয়ভাবে ভেরিফাই করার জন্য আমাদের অফিশিয়াল অ্যান্ড্রয়েড অ্যাপটি আপনার পেমেন্ট গ্রহণকারী ফোনে ইনস্টল করুন। অ্যাপটি ব্যাকগ্রাউন্ডে রান হয়ে ইনস্ট্যান্ট পেমেন্ট ভেরিফিকেশন সম্পন্ন করবে।
                    </p>
                  </div>
                </div>
                {downloadAllowed !== false ? (
                  latestApkLink.link ? (
                    <a
                      href={latestApkLink.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 text-sm font-bold shadow-md transition shrink-0 no-underline"
                    >
                      <Icon name="download" className="w-4 h-4" />
                      ডাউনলোড করুন
                    </a>
                  ) : (
                    <span className="text-xs text-white/80 font-semibold">No active download link available.</span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/15 text-white/80 text-sm font-semibold cursor-not-allowed shrink-0">
                    <Icon name="lock" className="w-4 h-4" />
                    ডাউনলোড অ্যাক্সেস সীমাবদ্ধ
                  </span>
                )}
              </div>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total synced SMS", value: stats.totalCount.toLocaleString("en-US"), icon: "inbox" as IconName, tile: "bg-slate-100 text-slate-600", ring: "from-slate-200" },
              { label: "Unused / available", value: stats.unusedCount.toLocaleString("en-US"), icon: "check" as IconName, tile: "bg-emerald-50 text-emerald-600", ring: "from-emerald-300" },
              { label: "Matched orders", value: stats.usedCount.toLocaleString("en-US"), icon: "bolt" as IconName, tile: "bg-cyan-50 text-cyan-600", ring: "from-cyan-300" },
              { label: "Total volume", value: `৳${stats.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: "cash" as IconName, tile: "bg-purple-50 text-purple-600", ring: "from-purple-300" },
            ].map((k) => (
              <div key={k.label} className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm hover:shadow-md transition">
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${k.ring} to-transparent`} />
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.tile}`}><Icon name={k.icon} className="w-5 h-5" /></span>
                <p className="mt-4 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">{k.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Transactions panel */}
          <div className="rounded-3xl border border-slate-200/70 bg-white shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">SMS transactions</h2>
                <p className="text-xs text-slate-500 mt-0.5">Payments synced from your phone in the last 7 days. Click a row to see the raw SMS.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-72">
                  <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search TrxID, sender or order…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${INPUT_CLS} pl-10`}
                  />
                </div>
                <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/60 shrink-0">
                  {[
                    { v: "all", l: "All" },
                    { v: "unused", l: "Unused" },
                    { v: "used", l: "Matched" },
                  ].map((f) => (
                    <button
                      key={f.v}
                      onClick={() => setStatusFilter(f.v)}
                      className={`flex-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        statusFilter === f.v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {f.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {paginatedTransactions.length === 0 ? (
              <EmptyState
                icon="inbox"
                title="No matching transactions"
                text={initialTransactions.length === 0 ? "Install the Android app and receive a payment — it will show up here within seconds." : "Try a different search or status filter."}
              />
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/70 border-b border-slate-100">
                      <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-6">Method</th>
                        <th className="py-3 px-4">Transaction ID</th>
                        <th className="py-3 px-4">Sender</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4">Order</th>
                        <th className="py-3 px-6 text-right">Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedTransactions.map((tx) => {
                        const isExpanded = expandedTxId === tx.id;
                        return (
                          <React.Fragment key={tx.id}>
                            <tr onClick={() => toggleExpand(tx.id)} className={`cursor-pointer transition-colors ${isExpanded ? "bg-emerald-50/40" : "hover:bg-slate-50/80"}`}>
                              <td className="py-3.5 px-6"><MethodBadge address={tx.senderAddress} /></td>
                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-800">
                                  {tx.trxId}
                                  <Icon name="chevron" className={`w-3 h-3 text-slate-300 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-600">{tx.sender}</td>
                              <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">৳{tx.amount.toFixed(2)}</td>
                              <td className="py-3.5 px-4 text-center"><StatusPill status={tx.status} /></td>
                              <td className="py-3.5 px-4">
                                {tx.orderId ? (
                                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">#{tx.orderId}</span>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                              <td className="py-3.5 px-6 text-right text-xs text-slate-500 whitespace-nowrap">
                                {new Date(tx.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" })}
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-emerald-50/40">
                                <td colSpan={7} className="px-6 pb-5 pt-1">
                                  <RawSmsDetails tx={tx} />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {paginatedTransactions.map((tx) => {
                    const isExpanded = expandedTxId === tx.id;
                    return (
                      <div key={tx.id} className={`p-4 transition-colors ${isExpanded ? "bg-emerald-50/40" : ""}`}>
                        <button onClick={() => toggleExpand(tx.id)} className="w-full text-left cursor-pointer">
                          <div className="flex items-center justify-between gap-3">
                            <MethodBadge address={tx.senderAddress} />
                            <span className="text-base font-extrabold text-slate-900">৳{tx.amount.toFixed(2)}</span>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-mono text-sm font-bold text-slate-800 truncate">{tx.trxId}</p>
                              <p className="font-mono text-xs text-slate-500">{tx.sender}</p>
                            </div>
                            <StatusPill status={tx.status} />
                          </div>
                          <p className="mt-2 text-[11px] text-slate-400">
                            {new Date(tx.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" })}
                            {tx.orderId && <> · Order <span className="font-mono font-semibold text-slate-600">#{tx.orderId}</span></>}
                          </p>
                        </button>
                        {isExpanded && <div className="mt-3"><RawSmsDetails tx={tx} /></div>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Pagination */}
            <div className="px-5 sm:px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>
                  Showing <span className="font-semibold text-slate-700">{filteredTransactions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span>–<span className="font-semibold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of{" "}
                  <span className="font-semibold text-slate-700">{filteredTransactions.length}</span>
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {[10, 20, 30, 50, 100].map((n) => (
                    <option key={n} value={n}>{n} / page</option>
                  ))}
                </select>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
                  >
                    Prev
                  </button>
                  {(() => {
                    const pages: (number | "...")[] = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (currentPage > 3) pages.push("...");
                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);
                      for (let i = start; i <= end; i++) pages.push(i);
                      if (currentPage < totalPages - 2) pages.push("...");
                      pages.push(totalPages);
                    }
                    return pages.map((p, idx) =>
                      p === "..." ? (
                        <span key={`ellipsis-${idx}`} className="w-8 text-center text-xs text-slate-400 select-none">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p as number)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                            currentPage === p ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    );
                  })()}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (() => {
        const GATEWAY_META: Record<string, { label: string; desc: string; placeholder: string; accent: string; soft: string; logoUrl: string; }> = {
          bkash:   { label: "bKash",   desc: "Send Money or Merchant Payment", placeholder: "017XXXXXXXX", accent: "#e2136e", soft: "#fdf2f8", logoUrl: "/logos/bkash.png" },
          nagad:   { label: "Nagad",   desc: "Send Money SMS matching",        placeholder: "019XXXXXXXX", accent: "#ec1c24", soft: "#fff7ed", logoUrl: "/logos/nagad.png" },
          rocket:  { label: "Rocket",  desc: "Send Money SMS matching",        placeholder: "01XXXXXXXXXX", accent: "#8c3c95", soft: "#faf5ff", logoUrl: "/logos/rocket.png" },
          upay:    { label: "Upay",    desc: "Send Money SMS matching",        placeholder: "01XXXXXXXXX", accent: "#d99a00", soft: "#fefce8", logoUrl: "/logos/upay.png" },
          cellfin: { label: "CellFin", desc: "Send Money SMS matching",        placeholder: "01XXXXXXXXX", accent: "#138a4e", soft: "#ecfdf5", logoUrl: "/logos/cellfin.png" },
          tap:     { label: "Tap",     desc: "Send Money SMS matching",        placeholder: "01XXXXXXXXX", accent: "#1f5bbf", soft: "#eff6ff", logoUrl: "/logos/tap.png" },
        };

        const BANK_META: Record<string, { name: string; logo: string }> = {
          ibl: { name: "Islami Bank Bangladesh PLC", logo: "/logos/ibl.png" },
          abbank: { name: "AB Bank PLC", logo: "/logos/abbank.png" },
          citybank: { name: "The City Bank PLC", logo: "/logos/citybank.png" },
          sonali: { name: "Sonali Bank PLC", logo: "/logos/sonali.png" },
          dbbl: { name: "Dutch-Bangla Bank PLC", logo: "/logos/dbbl.png" },
          basic: { name: "BASIC Bank PLC", logo: "/logos/basic.png" },
          ebl: { name: "Eastern Bank PLC", logo: "/logos/ebl.png" },
        };

        const configuredGateways = [
          ...(bkash  ? [{ provider: "bkash"  as const, number: bkash  }] : []),
          ...(nagad  ? [{ provider: "nagad"  as const, number: nagad  }] : []),
          ...(rocket ? [{ provider: "rocket" as const, number: rocket }] : []),
          ...(upay   ? [{ provider: "upay"   as const, number: upay   }] : []),
          ...(cellfin? [{ provider: "cellfin"as const, number: cellfin}] : []),
          ...(tap    ? [{ provider: "tap"    as const, number: tap    }] : []),
        ];

        const availableToAdd = (["bkash", "nagad", "rocket", "upay", "cellfin", "tap"] as const).filter(
          (p) => !(p === "bkash" ? bkash : p === "nagad" ? nagad : p === "rocket" ? rocket : p === "upay" ? upay : p === "cellfin" ? cellfin : tap)
        );

        const modalProvider = editingProvider || formProvider;

        return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full animate-in fade-in duration-300">

          {/* ── Add / Edit Wallet Modal ── */}
          {showAddForm && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4" onClick={closeGatewayModal}>
              <div
                className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[92dvh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">{editingProvider ? `Edit ${GATEWAY_META[editingProvider].label}` : "Connect a wallet"}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">The number customers pay to on your checkout page.</p>
                  </div>
                  <button type="button" onClick={closeGatewayModal} aria-label="Close" className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition cursor-pointer">
                    <Icon name="x" className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleGatewaySubmit} className="p-6 space-y-5">
                  {!editingProvider && (
                    <div className="space-y-2">
                      <label className={LABEL_CLS}>Wallet</label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableToAdd.map((p) => {
                          const m = GATEWAY_META[p];
                          const isSelected = formProvider === p;
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setFormProvider(p)}
                              className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition cursor-pointer hover:bg-slate-50"
                              style={isSelected ? { borderColor: m.accent, backgroundColor: m.soft } : { borderColor: "#e2e8f0" }}
                            >
                              <span className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                <img src={m.logoUrl} alt={m.label} className="w-full h-full object-contain p-1" />
                              </span>
                              <span className="text-xs font-bold" style={{ color: isSelected ? m.accent : "#64748b" }}>{m.label}</span>
                            </button>
                          );
                        })}
                        {availableToAdd.length === 0 && (
                          <p className="col-span-3 text-xs text-slate-400 text-center py-3">All wallets are already connected.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* bKash account type */}
                  {modalProvider === "bkash" && (
                    <div className="space-y-2">
                      <label className={LABEL_CLS}>bKash account type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          { v: "personal", t: "Personal", d: "Customers use Send Money" },
                          { v: "merchant", t: "Merchant", d: "Customers use Payment / scan QR" },
                        ] as const).map((o) => {
                          const isSelected = formBkashType === o.v;
                          return (
                            <button
                              key={o.v}
                              type="button"
                              onClick={() => setFormBkashType(o.v)}
                              className={`text-left p-3.5 rounded-2xl border-2 transition cursor-pointer ${isSelected ? "border-pink-500 bg-pink-50/60" : "border-slate-200 hover:bg-slate-50"}`}
                            >
                              <span className="flex items-center justify-between">
                                <span className={`text-sm font-bold ${isSelected ? "text-pink-700" : "text-slate-800"}`}>{o.t}</span>
                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-pink-500" : "border-slate-300"}`}>
                                  {isSelected && <span className="w-2 h-2 rounded-full bg-pink-500" />}
                                </span>
                              </span>
                              <span className="text-[11px] text-slate-500 mt-1 block leading-snug">{o.d}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className={LABEL_CLS}>{modalProvider === "bkash" && formBkashType === "merchant" ? "Merchant wallet number" : "Wallet number"}</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={formNumber}
                      onChange={(e) => setFormNumber(e.target.value)}
                      placeholder={GATEWAY_META[modalProvider]?.placeholder || "01XXXXXXXXX"}
                      className={`${INPUT_CLS} font-mono font-bold tracking-wider`}
                    />
                  </div>

                  {/* Merchant QR code */}
                  {modalProvider === "bkash" && formBkashType === "merchant" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className={LABEL_CLS}>Merchant QR code <span className="normal-case font-medium text-slate-400">(optional)</span></label>
                        <SegmentedMini
                          value={qrInputMode}
                          onChange={(v) => setQrInputMode(v as "upload" | "url")}
                          options={[{ v: "upload", l: "Upload" }, { v: "url", l: "Image URL" }]}
                        />
                      </div>

                      {formQr ? (
                        <div className="flex items-center gap-4 p-3 rounded-2xl border border-slate-200 bg-slate-50/60">
                          <div className="w-24 h-24 shrink-0 rounded-xl bg-white border border-slate-200 p-1.5 shadow-sm">
                            <img src={formQr} alt="Merchant QR preview" className="w-full h-full object-contain" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-2">
                            <p className="text-sm font-bold text-slate-800">QR code ready</p>
                            <p className="text-[11px] text-slate-500 truncate">{formQrFile ? formQrFile.name : "Shown to customers at checkout"}</p>
                            <div className="flex gap-2">
                              {qrInputMode === "upload" && (
                                <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition">
                                  Replace
                                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleQrFileChange} />
                                </label>
                              )}
                              <button
                                type="button"
                                onClick={() => { setFormQr(""); setFormQrFile(null); }}
                                className="px-3 py-1.5 rounded-lg bg-white border border-red-100 text-[11px] font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : qrInputMode === "upload" ? (
                        <label className="flex flex-col items-center justify-center gap-2 w-full py-7 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-emerald-50/40 hover:border-emerald-300 cursor-pointer transition text-center">
                          <span className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center shadow-sm"><Icon name="qr" className="w-5 h-5" /></span>
                          <span className="text-sm font-bold text-slate-700">Upload your bKash merchant QR</span>
                          <span className="text-[11px] text-slate-400">PNG, JPG or WEBP · max 2MB</span>
                          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleQrFileChange} />
                        </label>
                      ) : null}

                      {qrInputMode === "url" && (
                        <input
                          type="url"
                          value={formQr.startsWith("data:") ? "" : formQr}
                          onChange={(e) => { setFormQr(e.target.value); setFormQrFile(null); }}
                          placeholder="https://your-cdn.com/bkash-qr.png"
                          className={`${INPUT_CLS} font-mono text-xs`}
                        />
                      )}
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Download it from the bKash Merchant app (My QR → Save). Customers can scan it instead of typing your number.
                      </p>
                    </div>
                  )}

                  {modalError && <Notice tone="error">{modalError}</Notice>}

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={closeGatewayModal} className={`${BTN_SECONDARY} flex-1`}>Cancel</button>
                    <button
                      type="submit"
                      disabled={isSavingSettings || (availableToAdd.length === 0 && !editingProvider)}
                      className={`${BTN_PRIMARY} flex-1`}
                    >
                      {isSavingSettings ? "Saving…" : editingProvider ? "Save changes" : "Connect wallet"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Left column: wallets & banks */}
          <div className="xl:col-span-7 space-y-6">

            {/* ── Mobile wallets ── */}
            <Card>
              <CardHeader
                icon="wallet"
                eyebrow="Mobile banking"
                title="MFS wallets"
                desc={`${configuredGateways.length} of 6 wallets connected. Toggle a wallet off to hide it from checkout.`}
                action={
                  <button
                    type="button"
                    onClick={() => availableToAdd.length > 0 && openGatewayModal(availableToAdd[0], false)}
                    disabled={availableToAdd.length === 0}
                    className={BTN_PRIMARY}
                  >
                    <Icon name="plus" className="w-4 h-4" /> Add wallet
                  </button>
                }
              />
              {saveMessage && (
                <div className="px-6 pt-4"><Notice tone={saveMessage.type}>{saveMessage.text}</Notice></div>
              )}

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {configuredGateways.map(({ provider, number }) => {
                  const m = GATEWAY_META[provider];
                  const isOn = getProviderActive(provider);
                  const isMerchant = provider === "bkash" && bkashType === "merchant";
                  return (
                    <div
                      key={provider}
                      className={`relative rounded-2xl border p-4 transition hover:shadow-md ${isOn ? "bg-white border-slate-200" : "bg-slate-50/70 border-slate-200/70"}`}
                    >
                      <div className="absolute inset-x-4 top-0 h-0.5 rounded-full" style={{ backgroundColor: isOn ? m.accent : "#cbd5e1" }} />
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-12 h-12 shrink-0 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm ${isOn ? "" : "grayscale opacity-60"}`}>
                            <img src={m.logoUrl} alt={m.label} className="w-full h-full object-contain p-1.5" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-sm font-extrabold text-slate-900">{m.label}</p>
                              {provider === "bkash" && (
                                <span
                                  className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                                  style={{ backgroundColor: m.soft, color: m.accent }}
                                >
                                  {isMerchant ? "Merchant" : "Personal"}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{provider === "bkash" ? (isMerchant ? "Payment / QR scan" : "Send Money") : m.desc}</p>
                          </div>
                        </div>
                        <Switch checked={isOn} onChange={() => handleToggleGatewayActive(provider)} label={`${m.label} active`} />
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] text-slate-400">Wallet number</p>
                          <p className="font-mono text-base font-bold text-slate-800 tracking-wide truncate">{number}</p>
                        </div>
                        {isMerchant && bkashQr && (
                          <span className="w-11 h-11 shrink-0 rounded-lg border border-slate-200 bg-white p-0.5" title="Merchant QR uploaded">
                            <img src={bkashQr} alt="bKash merchant QR" className="w-full h-full object-contain" />
                          </span>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${isOn ? "text-emerald-600" : "text-slate-400"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOn ? "bg-emerald-500" : "bg-slate-300"}`} />
                          {isOn ? "Live on checkout" : "Hidden from checkout"}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openGatewayModal(provider, true, number || "")}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Icon name="edit" className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGateway(provider)}
                            disabled={isSavingSettings}
                            aria-label={`Remove ${m.label}`}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                          >
                            <Icon name="trash" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {availableToAdd.length > 0 && (
                  <button
                    type="button"
                    onClick={() => openGatewayModal(availableToAdd[0], false)}
                    className="min-h-[188px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 flex flex-col items-center justify-center gap-3 p-4 text-center transition cursor-pointer group"
                  >
                    <span className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-600 flex items-center justify-center transition">
                      <Icon name="plus" className="w-5 h-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-700">Connect another wallet</span>
                      <span className="flex items-center justify-center gap-1 mt-2">
                        {availableToAdd.map((p) => (
                          <img key={p} src={GATEWAY_META[p].logoUrl} alt={GATEWAY_META[p].label} className="w-6 h-6 object-contain rounded-md bg-white border border-slate-100 p-0.5" />
                        ))}
                      </span>
                    </span>
                  </button>
                )}
              </div>
            </Card>

            {/* ── Bank accounts ── */}
            <Card>
              <CardHeader
                icon="bank"
                eyebrow="Offline channel"
                title="Bank accounts"
                desc="Receive direct bank transfers. Customers see every active account on checkout."
                action={
                  <button type="button" onClick={() => setShowBankForm((v) => !v)} className={showBankForm ? BTN_SECONDARY : BTN_PRIMARY}>
                    <Icon name={showBankForm ? "x" : "plus"} className="w-4 h-4" /> {showBankForm ? "Close" : "Add bank"}
                  </button>
                }
              />

              {showBankForm && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newBankName || !newAccountName || !newAccountNo) {
                      alert("Please fill in all required fields.");
                      return;
                    }
                    setIsAddingBank(true);
                    try {
                      const fd = new FormData();
                      fd.append("bankName", newBankName);
                      fd.append("accountName", newAccountName);
                      fd.append("accountNo", newAccountNo);
                      fd.append("branch", newBranch);

                      const res = await addBankAccount(fd);
                      if (res.success && res.account) {
                        setBankAccounts((prev: any) => [...prev, res.account]);
                        setNewBankName("");
                        setNewAccountName("");
                        setNewAccountNo("");
                        setNewBranch("");
                        setShowBankForm(false);
                      }
                    } catch (err: any) {
                      alert(err.message || "Failed to add bank account.");
                    } finally {
                      setIsAddingBank(false);
                    }
                  }}
                  className="mx-6 mt-5 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={LABEL_CLS}>Bank *</label>
                      <select value={newBankName} onChange={(e) => setNewBankName(e.target.value)} className={`${INPUT_CLS} bg-white cursor-pointer`} required>
                        <option value="">Select bank</option>
                        {Object.entries(BANK_META).map(([id, b]) => (
                          <option key={id} value={id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className={LABEL_CLS}>Account name *</label>
                      <input type="text" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} placeholder="e.g. Codeblend Ltd." className={`${INPUT_CLS} bg-white`} required />
                    </div>
                    <div className="space-y-1.5">
                      <label className={LABEL_CLS}>Account number *</label>
                      <input type="text" value={newAccountNo} onChange={(e) => setNewAccountNo(e.target.value)} placeholder="e.g. 2050XXXXXXXXXXXXX" className={`${INPUT_CLS} bg-white font-mono`} required />
                    </div>
                    <div className="space-y-1.5">
                      <label className={LABEL_CLS}>Branch <span className="normal-case font-medium text-slate-400">(optional)</span></label>
                      <input type="text" value={newBranch} onChange={(e) => setNewBranch(e.target.value)} placeholder="e.g. Motijheel, Dhaka" className={`${INPUT_CLS} bg-white`} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={isAddingBank} className={BTN_PRIMARY}>
                      {isAddingBank ? "Adding…" : "Add bank account"}
                    </button>
                  </div>
                </form>
              )}

              <div className="p-6">
                {bankAccounts.length === 0 ? (
                  <EmptyState icon="bank" title="No bank accounts yet" text="Add a bank account to let customers pay by direct transfer." compact />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bankAccounts.map((account: any) => (
                      <div key={account.id} className={`rounded-2xl border p-4 transition hover:shadow-md ${account.active ? "bg-white border-slate-200" : "bg-slate-50/70 border-slate-200/70"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`w-11 h-11 shrink-0 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm ${account.active ? "" : "grayscale opacity-60"}`}>
                              <img src={BANK_META[account.bankName]?.logo || "/logos/citybank.png"} alt={account.bankName} className="w-full h-full object-contain p-1.5" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-extrabold text-slate-900 truncate">{account.accountName}</p>
                              <p className="text-[11px] text-slate-500 truncate">{BANK_META[account.bankName]?.name || account.bankName}</p>
                            </div>
                          </div>
                          <Switch
                            checked={account.active}
                            label={`${account.accountName} active`}
                            onChange={async () => {
                              const checked = !account.active;
                              try {
                                const res = await toggleBankAccountActive(account.id, checked);
                                if (res.success) {
                                  setBankAccounts((prev: any) => prev.map((item: any) => (item.id === account.id ? { ...item, active: checked } : item)));
                                }
                              } catch {
                                alert("Failed to toggle bank active state.");
                              }
                            }}
                          />
                        </div>
                        <div className="mt-4 flex items-end justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-mono text-sm font-bold text-slate-800 truncate">{account.accountNo}</p>
                            <p className="text-[11px] text-slate-400 truncate">{account.branch ? `${account.branch} branch` : "No branch set"}</p>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirm("Are you sure you want to delete this bank account?")) return;
                              try {
                                const res = await deleteBankAccount(account.id);
                                if (res.success) setBankAccounts((prev: any) => prev.filter((item: any) => item.id !== account.id));
                              } catch {
                                alert("Failed to delete bank account.");
                              }
                            }}
                            aria-label="Delete bank account"
                            className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          >
                            <Icon name="trash" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right column: branding, verification & sandbox */}
          <div className="xl:col-span-5 space-y-6">
            <Card>
              <CardHeader icon="sparkles" eyebrow="Checkout page" title="Branding & verification" desc="How your business appears to customers and how payments are verified." />
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSavingBranding(true);
                  setBrandSaveMsg(null);
                  try {
                    const fd = new FormData();
                    fd.append("brandName", brandName);
                    fd.append("brandColor", "#0f172a");
                    fd.append("withTrx", String(withTrx));
                    fd.append("withoutTrx", String(withoutTrx));

                    fd.append("bkashActive", String(bkashActive));
                    fd.append("nagadActive", String(nagadActive));
                    fd.append("rocketActive", String(rocketActive));
                    fd.append("upayActive", String(upayActive));
                    fd.append("cellfinActive", String(cellfinActive));
                    fd.append("tapActive", String(tapActive));

                    if (brandLogo && !brandLogo.startsWith("data:")) {
                      fd.append("brandLogo", brandLogo);
                    }
                    if (logoFile) {
                      fd.append("logoFile", logoFile);
                    }

                    const res = await saveBrandingSettings(fd);
                    if (res.success) {
                      if (res.brandLogo) {
                        setBrandLogo(res.brandLogo);
                      }
                      setLogoFile(null);
                      setBrandSaveMsg({ type: "success", text: "Settings saved successfully!" });
                    }
                  } catch (err: any) {
                    setBrandSaveMsg({ type: "error", text: err.message || "Failed to save settings." });
                  } finally {
                    setIsSavingBranding(false);
                  }
                }}
                className="p-6 space-y-6"
              >
                <div className="space-y-1.5">
                  <label className={LABEL_CLS}>Business / brand name</label>
                  <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Marcus Store" className={INPUT_CLS} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className={LABEL_CLS}>Logo</label>
                    <SegmentedMini
                      value={logoInputMode}
                      onChange={(v) => setLogoInputMode(v as "upload" | "url")}
                      options={[{ v: "upload", l: "Upload" }, { v: "url", l: "URL" }]}
                    />
                  </div>
                  {logoInputMode === "upload" ? (
                    brandLogo ? (
                      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/60">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="h-12 w-20 shrink-0 bg-white rounded-xl border border-slate-100 flex items-center justify-center p-1.5 shadow-sm">
                            <img src={brandLogo} alt="Logo preview" className="max-h-full max-w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800">Logo selected</p>
                            <p className="text-[11px] text-slate-500 truncate">{logoFile ? logoFile.name : "Active brand logo"}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition">
                            Change
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                          </label>
                          <button type="button" onClick={() => { setLogoFile(null); setBrandLogo(""); }} className="px-3 py-1.5 rounded-lg bg-white border border-red-100 text-[11px] font-bold text-red-600 hover:bg-red-50 transition cursor-pointer">
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-1.5 w-full py-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-emerald-50/40 hover:border-emerald-300 cursor-pointer transition text-center">
                        <Icon name="upload" className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-bold text-slate-700">Click to upload a logo</span>
                        <span className="text-[11px] text-slate-400">PNG, SVG or JPG · max 2MB · 200×60px recommended</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                    )
                  ) : (
                    <input type="url" value={brandLogo} onChange={(e) => setBrandLogo(e.target.value)} placeholder="https://your-cdn.com/logo.png" className={`${INPUT_CLS} font-mono text-xs`} />
                  )}
                </div>

                <div className="space-y-2">
                  <label className={LABEL_CLS}>Verification mode</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { on: withTrx, set: () => { setWithTrx(true); setWithoutTrx(false); }, t: "Transaction ID (TrxID)", d: "Customers enter the TrxID from their payment SMS.", icon: "receipt" as IconName },
                      { on: withoutTrx, set: () => { setWithoutTrx(true); setWithTrx(false); }, t: "Sender number auto-match", d: "We match the customer's number and amount against synced SMS — no TrxID needed.", icon: "bolt" as IconName },
                    ].map((o) => (
                      <button
                        key={o.t}
                        type="button"
                        onClick={o.set}
                        className={`flex items-start gap-3 text-left p-3.5 rounded-2xl border-2 transition cursor-pointer ${o.on ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:bg-slate-50"}`}
                      >
                        <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${o.on ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                          <Icon name={o.icon} className="w-4 h-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-slate-800">{o.t}</span>
                          <span className="block text-[11px] text-slate-500 mt-0.5 leading-snug">{o.d}</span>
                        </span>
                        <span className={`mt-1 w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center ${o.on ? "border-emerald-500" : "border-slate-300"}`}>
                          {o.on && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live preview */}
                <div className="space-y-2">
                  <label className={LABEL_CLS}>Live preview</label>
                  <div className="rounded-3xl bg-slate-700 p-4 sm:p-6">
                    <div className="mx-auto max-w-[320px] bg-white rounded-[24px] shadow-2xl overflow-hidden select-none">
                      <div className="px-4 pt-4 pb-3 flex items-center gap-2 border-b border-slate-100">
                        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 flex items-center gap-2">
                          <Icon name="search" className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] text-slate-400 font-semibold">Search payment method…</span>
                        </div>
                        <span className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Icon name="x" className="w-3 h-3" /></span>
                      </div>
                      <div className="py-4 text-center bg-gradient-to-b from-slate-50/60 to-white">
                        <div className="relative w-14 h-14 mx-auto rounded-full bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-sm">
                          {brandLogo ? (
                            <img src={brandLogo} alt={brandName || "Brand"} className="max-h-full max-w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          ) : (
                            <span className="w-full h-full rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-black">{(brandName || "Y").charAt(0).toUpperCase()}</span>
                          )}
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white"><Icon name="check" className="w-2 h-2" /></span>
                        </div>
                        <p className="text-xs font-extrabold text-slate-800 mt-2">{brandName || "Your Brand"}</p>
                      </div>
                      <div className="px-4">
                        <div className="flex p-0.5 bg-slate-100 rounded-xl text-[9px] font-bold">
                          <span className="flex-1 text-center py-1.5 bg-white rounded-lg shadow-sm text-slate-800">Mobile Banking</span>
                          <span className="flex-1 text-center py-1.5 text-slate-400">Bank Transfer</span>
                        </div>
                      </div>
                      <div className="p-4 grid grid-cols-4 gap-1.5">
                        {(["bkash", "nagad", "rocket", "upay", "cellfin", "tap"] as const).map((p) => {
                          const live = configuredGateways.some((g) => g.provider === p) && getProviderActive(p);
                          return (
                            <span key={p} className={`h-9 rounded-lg border border-slate-200/70 bg-white flex items-center justify-center p-1 ${live ? "" : "opacity-30"}`}>
                              <img src={GATEWAY_META[p].logoUrl} alt={p} className="max-h-full max-w-full object-contain" />
                            </span>
                          );
                        })}
                      </div>
                      <p className="py-2.5 bg-slate-50 border-t border-slate-100 text-center text-[8px] font-bold tracking-widest text-slate-400 uppercase">Powered by CodePay</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  {brandSaveMsg ? <Notice tone={brandSaveMsg.type} inline>{brandSaveMsg.text}</Notice> : <span />}
                  <button type="submit" disabled={isSavingBranding} className={BTN_PRIMARY}>
                    {isSavingBranding ? "Saving…" : "Save settings"}
                  </button>
                </div>
              </form>
            </Card>

            {/* ── Sandbox ── */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-lg">
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="relative space-y-5">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center"><Icon name="beaker" className="w-5 h-5" /></span>
                  <div>
                    <h2 className="text-base font-extrabold">Sandbox simulator</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Generate a test checkout to try the full payment &amp; redirect flow.</p>
                  </div>
                </div>

                <form onSubmit={handleCreateSandboxPayment} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold pointer-events-none">৳</span>
                    <input
                      type="number"
                      required
                      value={sandboxAmount}
                      onChange={(e) => setSandboxAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 pl-8 pr-3 text-sm font-mono font-bold focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 transition"
                      placeholder="Amount"
                    />
                  </div>
                  <button type="submit" disabled={isSimulating} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold disabled:opacity-50 transition cursor-pointer whitespace-nowrap shadow-lg shadow-emerald-500/20">
                    {isSimulating ? "Generating…" : "Generate link"}
                  </button>
                </form>

                {sandboxMessage && (
                  <div className={`p-3 rounded-xl text-xs font-medium border ${sandboxMessage.type === "success" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-red-500/10 text-red-300 border-red-500/20"}`}>
                    {sandboxMessage.text}
                  </div>
                )}

                {generatedSandboxUrl && (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Checkout URL</span>
                      <a href={generatedSandboxUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition no-underline">
                        Launch <Icon name="external" className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <input type="text" readOnly value={generatedSandboxUrl.replace(window.location.origin, "https://pay.codeblend.co")} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none" />
                      <button type="button" onClick={() => copyToClipboard(generatedSandboxUrl.replace(window.location.origin, "https://pay.codeblend.co"), "sandbox_url")} className="px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer shrink-0">
                        {copiedField === "sandbox_url" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { l: "Channel", v: "Any wallet" },
                        { l: "Sender", v: "Any number" },
                        { l: "Test TrxID", v: "SANDBOX123", hl: true },
                      ].map((i) => (
                        <div key={i.l} className="rounded-xl bg-black/30 border border-white/5 p-2.5">
                          <span className="block text-[10px] text-slate-500 font-semibold">{i.l}</span>
                          <strong className={`block mt-0.5 truncate ${i.hl ? "text-emerald-400 font-mono select-all" : "text-white"}`}>{i.v}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {activeTab === "api" && (() => {
        const shownKey = apiKey || "YOUR_API_KEY";
        const shownSecret = apiSecret || "YOUR_API_SECRET";
        const snippets: Record<"php" | "node" | "curl", { label: string; intro: string; code: string }> = {
          php: {
            label: "PHP",
            intro: "Initialize a checkout and redirect your customer to the returned payment_url.",
            code: `<?php
$apiKey = "${shownKey}";
$apiSecret = "${shownSecret}";

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "https://codeblend.co/api/v1/codepay/checkout",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => json_encode([
        "amount" => 1200,
        "order_id" => "ORDER_1001",
        "customer_name" => "John Doe",
        "customer_email" => "customer@email.com",
        "redirect_url" => "https://yourwebsite.com/payment/callback"
    ]),
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "X-CodePay-API-Key: " . $apiKey,
        "X-CodePay-API-Secret: " . $apiSecret
    ],
]);

$response = json_decode(curl_exec($curl), true);
curl_close($curl);

if (isset($response['payment_url'])) {
    // Redirect Customer
    header("Location: " . $response['payment_url']);
    exit;
} else {
    echo "Payment Error: " . $response['message'];
}`,
          },
          node: {
            label: "Node.js",
            intro: "Create checkouts from your Express / Next.js / Node backend.",
            code: `const response = await fetch("https://codeblend.co/api/v1/codepay/checkout", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CodePay-API-Key": "${shownKey}",
    "X-CodePay-API-Secret": "${shownSecret}"
  },
  body: JSON.stringify({
    amount: 1200,
    order_id: "ORDER_1001",
    customer_name: "John Doe",
    customer_email: "customer@email.com",
    redirect_url: "https://yourwebsite.com/payment/callback"
  })
});

const data = await response.json();
if (data.payment_url) {
  // Redirect visitor to hosted checkout
  res.redirect(data.payment_url);
} else {
  console.error("Payment failed", data.message);
}`,
          },
          curl: {
            label: "cURL",
            intro: "Quickly test checkout creation from your terminal.",
            code: `curl -X POST https://codeblend.co/api/v1/codepay/checkout \\
  -H "Content-Type: application/json" \\
  -H "X-CodePay-API-Key: ${shownKey}" \\
  -H "X-CodePay-API-Secret: ${shownSecret}" \\
  -d '{
    "amount": 1200,
    "order_id": "ORDER_1001",
    "customer_name": "John Doe",
    "customer_email": "customer@email.com",
    "redirect_url": "https://yourwebsite.com/payment/callback"
  }'`,
          },
        };
        const snippet = snippets[selectedLang];

        return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start animate-in fade-in duration-300">
          {/* Credentials */}
          <Card className="xl:col-span-1">
            <CardHeader icon="key" eyebrow="Authentication" title="API credentials" desc="Send these headers with every server-side request." />
            <div className="p-6">
              {!apiKey ? (
                <EmptyState
                  icon="key"
                  title="No API keys yet"
                  text="Generate a key pair to start creating checkouts from your website."
                  compact
                  action={
                    <button onClick={handleGenerateKeys} disabled={isGeneratingKeys} className={BTN_PRIMARY}>
                      {isGeneratingKeys ? "Generating…" : "Generate keys"}
                    </button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  <CopyField label="API key" value={apiKey} copied={copiedField === "key"} onCopy={() => copyToClipboard(apiKey, "key")} />
                  <CopyField
                    label="API secret"
                    value={apiSecret || ""}
                    masked={!showSecret}
                    copied={copiedField === "secret"}
                    onCopy={() => copyToClipboard(apiSecret || "", "secret")}
                    extra={
                      <button type="button" onClick={() => setShowSecret(!showSecret)} aria-label={showSecret ? "Hide secret" : "Show secret"} className="w-9 h-9 shrink-0 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer">
                        <Icon name={showSecret ? "eyeOff" : "eye"} className="w-4 h-4" />
                      </button>
                    }
                  />
                  <CopyField
                    label="Checkout endpoint"
                    value="https://codeblend.co/api/v1/codepay/checkout"
                    copied={copiedField === "endpoint"}
                    onCopy={() => copyToClipboard("https://codeblend.co/api/v1/codepay/checkout", "endpoint")}
                  />
                  <div className="pt-4 border-t border-slate-100">
                    <Notice tone="warning">Regenerating keys immediately breaks existing integrations.</Notice>
                    <button onClick={handleGenerateKeys} disabled={isGeneratingKeys} className="mt-3 w-full py-2.5 rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50 text-sm font-bold transition cursor-pointer disabled:opacity-50">
                      {isGeneratingKeys ? "Regenerating…" : "Regenerate API keys"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Integration guide */}
          <div className="xl:col-span-2 space-y-6">
            <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-lg overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-white">Integration guide</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{snippet.intro}</p>
                </div>
                <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 self-start">
                  {(["php", "node", "curl"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setSelectedLang(l)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${selectedLang === l ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"}`}
                    >
                      {snippets[l].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="flex items-center gap-1.5 px-5 pt-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(snippet.code, "snippet")}
                  className="absolute top-3 right-4 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-white transition cursor-pointer"
                >
                  <Icon name={copiedField === "snippet" ? "check" : "copy"} className="w-3.5 h-3.5" />
                  {copiedField === "snippet" ? "Copied" : "Copy"}
                </button>
                <pre className="px-5 pb-5 pt-3 font-mono text-[12px] text-emerald-300 overflow-x-auto leading-relaxed max-h-[420px]">{snippet.code}</pre>
              </div>
            </div>

            <Card>
              <CardHeader icon="flow" eyebrow="Under the hood" title="How payment verification works" />
              <ol className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { t: "Customer pays", d: "They pay to your wallet and submit the TrxID (or their number) on the hosted checkout." },
                  { t: "SMS is matched", d: "CodePay matches it against payment SMS synced from your phone by the Android app." },
                  { t: "Redirect back", d: "The customer returns to your redirect_url with ?payment_id=…&status=completed&order_id=…" },
                ].map((s, i) => (
                  <li key={s.t} className="relative rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4">
                    <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-sm font-extrabold flex items-center justify-center shadow-sm shadow-emerald-200">{i + 1}</span>
                    <p className="mt-3 text-sm font-bold text-slate-900">{s.t}</p>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{s.d}</p>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </div>
        );
      })()}

      {activeTab === "app" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start animate-in fade-in duration-300">
          <Card className="xl:col-span-2">
            <CardHeader icon="phone" eyebrow="Companion app" title="অ্যান্ড্রয়েড ট্র্যাকার অ্যাপ" desc="পেমেন্ট ভেরিফিকেশন অটোমেশন সচল রাখতে অ্যাপটি আপনার পেমেন্ট রিসিভিং ফোনে ইনস্টল করুন।" />
            <div className="p-6 space-y-3">
              {apkLinks.length === 0 ? (
                <EmptyState icon="phone" title="No app version yet" text="এই মুহূর্তে কোনো অ্যাপ ভার্সন আপলোড করা হয়নি।" compact />
              ) : (
                apkLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border transition ${
                      link.isLatest ? "border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-cyan-50/40 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${link.isLatest ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200" : "bg-slate-100 text-slate-400"}`}>
                        <Icon name="phone" className="w-6 h-6" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-extrabold text-slate-900 truncate">{link.name || "CodePay Tracker"}</h4>
                          {link.version && <span className="font-mono text-xs text-slate-500">v{link.version}</span>}
                          {link.isLatest && <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">Latest</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{link.isLatest ? "সকল নতুন আপডেট এবং বাগ ফিক্স অন্তর্ভুক্ত।" : "পুরোনো রিলিজ।"}</p>
                      </div>
                    </div>

                    {link.link && downloadAllowed !== false ? (
                      <a
                        href={link.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${link.isLatest ? BTN_PRIMARY : BTN_SECONDARY} shrink-0 no-underline`}
                      >
                        <Icon name="download" className="w-4 h-4" />
                        ডাউনলোড করুন
                      </a>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 text-sm font-semibold cursor-not-allowed shrink-0">
                        <Icon name="lock" className="w-4 h-4" />
                        ডাউনলোড অ্যাক্সেস সীমাবদ্ধ
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <CardHeader icon="list" eyebrow="Setup" title="কীভাবে কনফিগার করবেন" />
            <ol className="p-6 space-y-4">
              {[
                "আপনার ফোন থেকে APK ফাইলটি ডাউনলোড ও ইনস্টল করুন।",
                "অ্যাপ্লিকেশনটি ওপেন করে আপনার CodePay API ক্রেডেনশিয়াল ব্যবহার করে লগইন করুন।",
                "অ্যাপ্লিকেশনটিকে SMS রিড করার প্রয়োজনীয় পারমিশন প্রদান করুন।",
                "ব্যাকগ্রাউন্ড সার্ভিস রান করে রাখুন যাতে প্রতিবার SMS আসার সাথে সাথে ট্র্যাকারটি ডাটাবেজে সিঙ্ক করতে পারে।",
              ].map((step, i, arr) => (
                <li key={i} className="relative flex gap-3">
                  {i < arr.length - 1 && <span className="absolute left-4 top-9 bottom-[-12px] w-px bg-emerald-100" />}
                  <span className="relative w-8 h-8 shrink-0 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-extrabold flex items-center justify-center">{i + 1}</span>
                  <p className="text-[13px] text-slate-600 leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Shared UI ─────────────────────────── */

const INPUT_CLS = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition";
const LABEL_CLS = "block text-xs font-semibold text-slate-600";
const BTN_PRIMARY = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-md shadow-emerald-200/70 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none";
const BTN_SECONDARY = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition cursor-pointer";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-slate-200/70 bg-white shadow-sm overflow-hidden ${className}`}>{children}</div>;
}

function CardHeader({ icon, eyebrow, title, desc, action }: { icon: IconName; eyebrow?: string; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <span className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
          <Icon name={icon} className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">{eyebrow}</p>}
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">{title}</h2>
          {desc && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative w-11 h-6 shrink-0 rounded-full transition-colors cursor-pointer ${checked ? "bg-emerald-500" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

function SegmentedMini({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="inline-flex p-0.5 rounded-lg bg-slate-100">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${value === o.v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function Notice({ tone, children, inline }: { tone: "success" | "error" | "warning"; children: React.ReactNode; inline?: boolean }) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    error: "bg-red-50 text-red-700 border-red-100",
    warning: "bg-amber-50 text-amber-800 border-amber-100",
  }[tone];
  return (
    <div className={`${inline ? "inline-flex" : "flex"} items-start gap-2 px-3 py-2 rounded-xl border text-xs font-medium ${styles}`}>
      <Icon name={tone === "success" ? "check" : "alert"} className="w-4 h-4 shrink-0 mt-px" />
      <span>{children}</span>
    </div>
  );
}

function EmptyState({ icon, title, text, compact, action }: { icon: IconName; title: string; text: string; compact?: boolean; action?: React.ReactNode }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-8" : "py-16 px-6"}`}>
      <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-100 text-emerald-500 flex items-center justify-center">
        <Icon name={icon} className="w-6 h-6" />
      </span>
      <h4 className="mt-4 text-sm font-extrabold text-slate-800">{title}</h4>
      <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function CopyField({ label, value, copied, onCopy, masked, extra }: { label: string; value: string; copied: boolean; onCopy: () => void; masked?: boolean; extra?: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className={LABEL_CLS}>{label}</label>
      <div className="flex gap-1.5">
        <input type={masked ? "password" : "text"} readOnly value={value} className={`${INPUT_CLS} font-mono text-xs select-all`} />
        {extra}
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Copy ${label}`}
          className={`w-9 h-9 shrink-0 self-center rounded-lg border flex items-center justify-center transition cursor-pointer ${copied ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"}`}
        >
          <Icon name={copied ? "check" : "copy"} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const METHOD_BADGES: { match: string[]; label: string; logo: string }[] = [
  { match: ["bkash", "16247"], label: "bKash", logo: "/logos/bkash.png" },
  { match: ["nagad", "16167"], label: "Nagad", logo: "/logos/nagad.png" },
  { match: ["rocket", "16216", "dbbl"], label: "Rocket", logo: "/logos/rocket.png" },
  { match: ["upay"], label: "Upay", logo: "/logos/upay.png" },
  { match: ["cellfin"], label: "CellFin", logo: "/logos/cellfin.png" },
  { match: ["tap"], label: "Tap", logo: "/logos/tap.png" },
];

function MethodBadge({ address }: { address: string }) {
  const normalized = (address || "").toLowerCase();
  const found = METHOD_BADGES.find((b) => b.match.some((m) => normalized.includes(m)));
  return (
    <span className="inline-flex items-center gap-2">
      <span className="w-8 h-8 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1">
        {found ? <img src={found.logo} alt={found.label} className="max-h-full max-w-full object-contain" /> : <Icon name="inbox" className="w-4 h-4 text-slate-400" />}
      </span>
      <span className="text-xs font-semibold text-slate-700">{found?.label || address || "SMS"}</span>
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const isUnused = status === "unused";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize border ${isUnused ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-cyan-50 text-cyan-700 border-cyan-100"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isUnused ? "bg-emerald-500" : "bg-cyan-500"}`} />
      {isUnused ? "Unused" : "Matched"}
    </span>
  );
}

function RawSmsDetails({ tx }: { tx: BkashSmsTx }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Raw SMS</p>
      <p className="text-xs font-mono text-slate-700 leading-relaxed break-words">{tx.rawMessage}</p>
      <p className="text-[11px] text-slate-400">
        From <strong className="text-slate-600">{tx.senderAddress}</strong> · {new Date(tx.createdAt).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
      </p>
    </div>
  );
}

const ICON_PATHS = {
  list: "M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
  settings: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75",
  code: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  phone: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  download: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
  upload: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5",
  lock: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
  check: "M4.5 12.75l6 6 9-13.5",
  x: "M6 18L18 6M6 6l12 12",
  plus: "M12 4.5v15m7.5-7.5h-15",
  edit: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z",
  trash: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0",
  wallet: "M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3",
  bank: "M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z",
  shield: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  key: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
  inbox: "M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z",
  bolt: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  cash: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
  search: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  chevron: "M19.5 8.25l-7.5 7.5-7.5-7.5",
  qr: "M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z",
  sparkles: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z",
  receipt: "M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z",
  beaker: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
  external: "M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25",
  copy: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75",
  eye: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
  eyeOff: "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88",
  alert: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
  flow: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
} as const;

type IconName = keyof typeof ICON_PATHS;

function Icon({ name, className = "w-5 h-5" }: { name: IconName; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
    </svg>
  );
}

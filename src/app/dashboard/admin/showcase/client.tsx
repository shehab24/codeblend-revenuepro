"use client";

import { useState, useTransition } from "react";
import { 
  createShowcaseCustomer, 
  updateShowcaseCustomer, 
  deleteShowcaseCustomer 
} from "./actions";

type Customer = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export function ShowcaseAdminClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal/Form States
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [logoBase64, setLogoBase64] = useState("");
  const [logoFileName, setLogoFileName] = useState("");
  const [logoPreview, setLogoPreview] = useState("");

  const resetForm = () => {
    setName("");
    setWebsiteUrl("");
    setOrder(0);
    setLogoBase64("");
    setLogoFileName("");
    setLogoPreview("");
    setEditingId(null);
    setError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    resetForm();
    setEditingId(customer.id);
    setName(customer.name);
    setWebsiteUrl(customer.websiteUrl || "");
    setOrder(customer.order);
    setLogoPreview(customer.logoUrl); // pre-populate with existing URL
    setIsOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB.");
      return;
    }

    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoBase64(base64String);
      setLogoPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Company Name is required.");
      return;
    }

    if (!editingId && !logoBase64) {
      setError("Please upload a logo image.");
      return;
    }

    startTransition(async () => {
      try {
        if (editingId) {
          const res = await updateShowcaseCustomer(editingId, {
            name,
            websiteUrl,
            order,
            logoBase64: logoBase64 || undefined,
            logoFileName: logoFileName || undefined
          });

          if (res.success && res.customer) {
            setCustomers(prev => 
              prev.map(c => c.id === editingId ? (res.customer as Customer) : c)
                  .sort((a, b) => a.order - b.order)
            );
            setSuccess("Customer updated successfully!");
            setIsOpen(false);
            resetForm();
          }
        } else {
          const res = await createShowcaseCustomer({
            name,
            websiteUrl,
            order,
            logoBase64,
            logoFileName
          });

          if (res.success && res.customer) {
            setCustomers(prev => 
              [...prev, res.customer as Customer]
                  .sort((a, b) => a.order - b.order)
            );
            setSuccess("Customer added successfully!");
            setIsOpen(false);
            resetForm();
          }
        }
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this customer from the showcase?")) return;

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const res = await deleteShowcaseCustomer(id);
        if (res.success) {
          setCustomers(prev => prev.filter(c => c.id !== id));
          setSuccess("Customer deleted successfully!");
        }
      } catch (err: any) {
        setError(err.message || "Failed to delete customer.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 font-bold">×</button>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-500 hover:text-emerald-800 font-bold">×</button>
        </div>
      )}

      {/* Action Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Distribution Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">Currently showcasing {customers.length} companies.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-md shadow-slate-900/10 cursor-pointer"
        >
          <span className="text-lg font-light">+</span> Add Customer
        </button>
      </div>

      {/* Grid of Customers */}
      {customers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {customers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-lg transition-all group relative">
              {/* Badge for sorting order */}
              <div className="absolute top-3 left-3 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Rank: {customer.order}
              </div>

              {/* Logo Preview */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-center h-32 mb-4 group-hover:bg-white transition-colors">
                <img 
                  src={customer.logoUrl} 
                  alt={customer.name} 
                  className="max-h-full max-w-full object-contain filter drop-shadow-sm transition-transform group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="space-y-1 text-center">
                <h3 className="font-bold text-slate-800 text-sm truncate">{customer.name}</h3>
                {customer.websiteUrl ? (
                  <a 
                    href={customer.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-emerald-600 hover:underline truncate block"
                  >
                    {customer.websiteUrl.replace(/https?:\/\/(www\.)?/, "")}
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic block">No Website URL</span>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(customer)}
                  className="px-3 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl font-bold text-xs transition border border-slate-100 hover:border-emerald-200 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  disabled={isPending}
                  className="px-3 py-2 bg-slate-50 hover:bg-red-50 hover:text-red-700 text-slate-600 rounded-xl font-bold text-xs transition border border-slate-100 hover:border-red-200 cursor-pointer disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4 text-2xl">
            🏢
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Customers Showcase Added</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">Click "Add Customer" above to upload your first showcase logo to ImageKit.</p>
        </div>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 animate-fade-in relative">
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold p-1 bg-slate-50 rounded-full hover:bg-slate-100 transition"
            >
              ×
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? "Edit Showcase Customer" : "Add Showcase Customer"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Fill out the details below to publish to the front page.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5" htmlFor="custName">Company Name</label>
                <input 
                  type="text" 
                  id="custName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corporation" 
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  required
                />
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5" htmlFor="custWeb">Website URL (Optional)</label>
                <input 
                  type="url" 
                  id="custWeb"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://acme.com" 
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>

              {/* Order/Rank */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5" htmlFor="custOrder">Display Order Rank</label>
                <input 
                  type="number" 
                  id="custOrder"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  placeholder="0" 
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  min="0"
                />
                <p className="text-[10px] text-slate-400 mt-1">Lower numbers appear first on the frontend slider/grid.</p>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Company Logo Image</label>
                
                {logoPreview && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-center h-24 mb-3 relative group">
                    <img src={logoPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                )}

                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition cursor-pointer border border-dashed border-slate-200 rounded-xl p-1 bg-slate-50"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Recommended: Transparent PNG or SVGs under 2MB.</p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/10 cursor-pointer"
                >
                  {isPending ? "Publishing to CDN..." : (editingId ? "Save Changes" : "Publish Customer")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { adminCreateLicense } from "@/app/dashboard/admin/licenses/actions";

export function AdminCreateLicenseForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await adminCreateLicense(formData);
      (document.getElementById("admin-license-form") as HTMLFormElement).reset();
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title" style={{ color: "var(--foreground)" }}>Issue New WP License</h3>
        <p className="text-muted" style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
          Generate a time-tiered license for a specific WordPress domain.
        </p>
      </div>
      <form id="admin-license-form" action={handleSubmit}>
        <div className="form-group">
          <label className="input-label" htmlFor="domain">Target Installation Domain</label>
          <input 
            type="text" 
            id="domain" 
            name="domain" 
            placeholder="e.g., clientwebsite.com" 
            className="input-field" 
            required 
            style={{ color: "var(--foreground)", backgroundColor: "var(--background)" }}
          />
        </div>

        <div className="form-group mt-4">
          <label className="input-label" htmlFor="duration">Validation Tier Duration</label>
          <select 
            id="duration" 
            name="duration" 
            className="input-field" 
            required
            style={{ color: "var(--foreground)", backgroundColor: "var(--background)", cursor: "pointer" }}
          >
            <option value="2_min">2 Minutes (Fast Test Expiry)</option>
            <option value="5_min">5 Minutes (Test Expiry)</option>
            <option value="15">15 Days (Trial)</option>
            <option value="1">1 Month (Basic)</option>
            <option value="2">2 Months (Extended)</option>
            <option value="3">3 Months (Quarterly)</option>
            <option value="6">6 Months (Biannual)</option>
            <option value="12">12 Months (Elite/Yearly)</option>
            <option value="0">Lifetime Access (Never Expires)</option>
          </select>
        </div>

        <div className="form-group mt-4">
          <label className="input-label" htmlFor="customerEmail">Assigned Customer Email (Optional)</label>
          <input 
            type="email" 
            id="customerEmail" 
            name="customerEmail" 
            placeholder="e.g., client@domain.com" 
            className="input-field" 
            style={{ color: "var(--foreground)", backgroundColor: "var(--background)" }}
          />
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            If provided, the WP siteMUST verify using this exact email for unbreakable anti-piracy binding.
          </p>
        </div>

        <button type="submit" disabled={isPending} className="btn btn-primary mt-4" style={{ width: "100%" }}>
          {isPending ? "Generating Secure License..." : "Generate WP License Key"}
        </button>
      </form>
    </div>
  );
}

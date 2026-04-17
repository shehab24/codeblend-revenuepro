"use client";

import { useTransition } from "react";
import { createLicense } from "@/app/dashboard/user/actions";

export function CreateLicenseForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createLicense(formData);
      (document.getElementById("license-form") as HTMLFormElement).reset();
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Generate New License</h3>
        <p className="text-muted" style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
          Create a new API key binding for a specific domain.
        </p>
      </div>
      <form id="license-form" action={handleSubmit}>
        <div className="form-group">
          <label className="input-label" htmlFor="domain">Target Domain Name</label>
          <input 
            type="text" 
            id="domain" 
            name="domain" 
            placeholder="e.g., myshopify.com or sub.domain.com" 
            className="input-field" 
            required 
          />
        </div>
        <button type="submit" disabled={isPending} className="btn btn-primary mt-4" style={{ width: "100%" }}>
          {isPending ? "Generating..." : "Generate API License"}
        </button>
      </form>
    </div>
  );
}

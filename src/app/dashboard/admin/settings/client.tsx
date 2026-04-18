"use client";
import { useTransition, useRef } from "react";
import { adminSaveSettings } from "./actions";

export function AdminSettingsClient({ currentKey, currentAlertEmail }: { currentKey: string, currentAlertEmail: string }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await adminSaveSettings(formData);
    });
  };

  return (
    <form ref={formRef} action={handleSubmit}>
      <div className="form-group">
        <label className="input-label" htmlFor="bdCourierApiKey">BD Courier API Key (Bearer Token)</label>
        <input 
          type="text" 
          id="bdCourierApiKey"
          name="bdCourierApiKey" 
          defaultValue={currentKey} 
          placeholder="e.g. 521c7a8b9f..." 
          className="input-field" 
          style={{ width: "100%", background: "var(--background)", color: "var(--foreground)" }} 
        />
      </div>
      <div className="form-group" style={{ marginTop: "1rem" }}>
        <label className="input-label" htmlFor="adminAlertEmail">Admin Alert Email</label>
        <input 
          type="email" 
          id="adminAlertEmail"
          name="adminAlertEmail" 
          defaultValue={currentAlertEmail} 
          placeholder="admin@example.com" 
          className="input-field" 
          style={{ width: "100%", background: "var(--background)", color: "var(--foreground)" }} 
        />
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
          This email will receive notifications when new leads or service requests are submitted.
        </p>
      </div>
      <button 
        type="submit" 
        onClick={() => formRef.current?.requestSubmit()}
        disabled={isPending}
        className="btn btn-primary mt-4" 
        style={{ width: "100%", opacity: isPending ? 0.7 : 1, cursor: isPending ? "not-allowed" : "pointer" }}
      >
        {isPending ? "Saving To Vault..." : "Save Configuration"}
      </button>
    </form>
  );
}

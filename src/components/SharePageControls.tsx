"use client";

import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

type Props = {
  docTypeName: string;
  docNumber: string;
  autoDownload: boolean;
  autoPrint: boolean;
};

export default function SharePageControls({ docTypeName, docNumber, autoDownload, autoPrint }: Props) {
  const [downloading, setDownloading] = useState(false);

  const triggerDownload = async () => {
    try {
      setDownloading(true);
      const element = document.querySelector(".invoice-card") as HTMLElement;
      if (!element) throw new Error("Document card container not found");

      // Temporarily hide controls bar during render
      const controls = document.getElementById("controls-bar");
      if (controls) controls.style.display = "none";

      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false
      });

      if (controls) controls.style.display = "flex";

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
      }

      pdf.save(`${docTypeName}-${docNumber}.pdf`);
    } catch (err: any) {
      alert(err.message || "Failed to download PDF.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (autoPrint) {
      setTimeout(() => {
        window.print();
      }, 800);
    } else if (autoDownload) {
      triggerDownload();
    }
  }, [autoPrint, autoDownload]);

  return (
    <div 
      id="controls-bar" 
      className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100 print:hidden"
    >
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
        CodeBlend Document
      </span>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-bold text-xs transition cursor-pointer"
        >
          Print
        </button>
        <button 
          onClick={triggerDownload}
          disabled={downloading}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-xl font-extrabold text-xs transition shadow-xs cursor-pointer ${
            downloading 
              ? "bg-slate-50 text-emerald-600 animate-pulse" 
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          {downloading ? (
            <>
              <svg className="w-4 h-4 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}

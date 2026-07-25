"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
}

export default function InteractiveImage({ src, alt, className, width, height }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="cursor-zoom-in relative overflow-hidden group rounded-xl"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${className} transition-transform duration-300 group-hover:scale-[1.015]`}
        />
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-200 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 bg-white/95 text-slate-800 text-[10px] font-bold py-1 px-2.5 rounded-full shadow-md transition-all duration-200 translate-y-2 group-hover:translate-y-0 flex items-center gap-1 border border-slate-100">
            🔍 Click to expand
          </span>
        </div>
      </div>

      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-10 cursor-zoom-out"
        >
          {/* Close button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-200 z-[110] cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Large image wrapper */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-5xl w-full max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/10 cursor-default"
          >
            <div className="overflow-auto max-h-[78vh] bg-slate-50 flex items-center justify-center p-2">
              <Image
                src={src}
                alt={alt}
                width={1600}
                height={900}
                className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
              />
            </div>
            <div className="bg-slate-900 text-white/80 text-xs px-4 py-3 font-semibold text-center border-t border-slate-800">
              {alt}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

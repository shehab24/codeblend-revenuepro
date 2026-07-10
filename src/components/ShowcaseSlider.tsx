"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";

type Customer = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
};

export function ShowcaseSlider({ customers }: { customers: Customer[] }) {
  // Swiper loop requires enough slides to loop properly (needs to be at least 2x the slidesPerView)
  const repeatCount = Math.max(4, Math.ceil(15 / customers.length));
  const slides = Array.from({ length: repeatCount }).flatMap(() => customers);

  return (
    <div className="w-full relative py-4">
      <Swiper
        modules={[Autoplay]}
        slidesPerView={2}
        spaceBetween={16}
        loop={true}
        speed={3000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          480: {
            slidesPerView: 3,
            spaceBetween: 18,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 24,
          },
        }}
        className="showcase-swiper"
      >
        {slides.map((customer, index) => {
          const logoContent = (
            <div className="bg-white border border-slate-100 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-between gap-2 w-full max-w-[280px] sm:max-w-[320px] h-26 sm:h-30 shadow-xs group select-none overflow-hidden mx-auto bg-gradient-to-b from-white to-slate-50/20">
              <div className="h-10 sm:h-12 w-full flex items-center justify-center">
                <img 
                  src={customer.logoUrl} 
                  alt={customer.name} 
                  className="max-h-full max-w-full object-contain filter grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 pointer-events-none"
                />
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-750 truncate w-full text-center group-hover:text-emerald-600 transition-colors">
                {customer.name}
              </p>
            </div>
          );

          return (
            <SwiperSlide key={`${customer.id}-${index}`} className="flex justify-center items-center">
              {customer.websiteUrl ? (
                <a 
                  href={customer.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title={customer.name}
                  className="focus:outline-none w-full block"
                >
                  {logoContent}
                </a>
              ) : (
                <div title={customer.name} className="w-full block">
                  {logoContent}
                </div>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Global CSS to override Swiper transition timing function for a continuous smooth scroll effect */}
      <style dangerouslySetInnerHTML={{ __html: `
        .showcase-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}} />
    </div>
  );
}

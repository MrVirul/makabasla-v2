"use client";

import Image from "next/image";
import { services } from "@/app/data/services";

export default function ServicesSection() {
  return (
    <section id="services" className="relative bg-[#0B0B0B] py-32 px-6 md:px-12 overflow-hidden border-t border-[#1A1A1A]">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#F5A623] blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#F5A623] blur-[150px] rounded-full" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col items-center mb-24 text-center">
          <span className="text-[#F5A623] font-mono text-[10px] md:text-xs tracking-[0.4em] uppercase mb-6 opacity-80">
            Expert Engineering
          </span>
          <h2 className="text-4xl md:text-6xl text-[#D1D0C5] font-medium tracking-tighter leading-tight max-w-none">
            Specialist Off-Road Modifications
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative aspect-[4/3] overflow-hidden rounded-sm border border-[#1A1A1A] hover:border-[#F5A623]/30 transition-all duration-700 bg-[#0B0B0B] cursor-default"
            >
              {/* Background Image with Zoom Effect */}
              <div className="absolute inset-0 transition-transform duration-1000 ease-out group-hover:scale-110">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover opacity-70 group-hover:opacity-50 transition-opacity duration-700"
                  sizes="(max-w: 768px) 100vw, (max-w: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/20 to-transparent" />
              </div>

              {/* Content Container */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-10 text-center transition-all duration-500">
                <h3 className="text-xl md:text-2xl font-medium text-[#D1D0C5] group-hover:translate-y-[-15px] transition-transform duration-500 ease-out leading-snug drop-shadow-2xl">
                  {service.title}
                </h3>
                
                <div className="max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-all duration-700 ease-out delay-75 pointer-events-none">
                  <p className="mt-4 md:mt-6 text-[#A1A1A1] font-mono text-[11px] md:text-xs leading-relaxed max-w-[300px] tracking-wide">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Hover Overlay Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#F5A623]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              {/* Animated Corner Accents */}
              <div className="absolute top-0 right-0 w-0 h-0 border-t border-r border-[#F5A623] opacity-0 group-hover:w-4 group-hover:h-4 group-hover:opacity-40 transition-all duration-500 ease-in-out" />
              <div className="absolute bottom-0 left-0 w-0 h-0 border-b border-l border-[#F5A623] opacity-0 group-hover:w-4 group-hover:h-4 group-hover:opacity-40 transition-all duration-500 ease-in-out" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

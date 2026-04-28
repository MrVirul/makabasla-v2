"use client";

import { partners } from "@/app/data/Partners";
import Image from "next/image";

export default function PartnersSection() {
  return (
    <section className="py-32 px-6 md:px-12 bg-black border-t border-[#1A1A1A]">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl text-[#D1D0C5] font-medium tracking-tighter leading-tight mb-4">
            Collaborators of the Wild
          </h2>
          <p className="text-[#A1A1A1] font-mono text-sm md:text-base max-w-2xl mx-auto opacity-80">
            Tested by the Wild. Trusted by the Best.{" "}
          </p>
        </div>

        {/* Static Logos Display */}
        <div className="flex flex-wrap items-center justify-center gap-16 md:gap-32 py-12">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center hover:opacity-100 transition-all duration-300 group"
            >
              <Image
                src={partner.image}
                alt={partner.name}
                width={400}
                height={400}
                className="object-contain h-24 md:h-32 w-auto grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

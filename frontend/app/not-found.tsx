"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0B0B0B] text-white selection:bg-[#F5A623] selection:text-black">
      <NavBar />
      
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="relative">
            <h1 className="text-[12rem] md:text-[18rem] font-light leading-none tracking-tighter text-white/5 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <h2 className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase">
                Lost in the Legend
              </h2>
              <div className="h-px w-24 bg-[#F5A623]" />
            </div>
          </div>

          <p className="font-mono text-xs md:text-sm text-[#A1A1A1] uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
            The page you are looking for has been moved or does not exist in our registry.
          </p>

          <div className="pt-8">
            <Link 
              href="/"
              className="inline-flex items-center gap-3 px-10 py-4 bg-[#1A1A1A] border border-[#1A1A1A] text-[#D1D0C5] hover:bg-[#F5A623] hover:text-[#0B0B0B] hover:border-[#F5A623] transition-all duration-500 rounded-sm font-mono text-[12px] tracking-[0.2em] uppercase active:scale-[0.98]"
            >
              <ArrowLeftIcon className="w-4 h-4 stroke-[1.5]" />
              Return to Base
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

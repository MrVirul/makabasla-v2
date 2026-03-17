"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home, Search, AlertCircle } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white">
      <NavBar />
      
      <main className="flex-grow flex items-center justify-center relative px-6 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F5A623]/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-[#F5A623]/10 blur-[60px] rounded-full -z-10 animate-pulse" />
        
        <div className="w-full max-w-2xl text-center animate-reveal">
          {/* Large 404 text with gradient */}
          <div className="relative inline-block mb-8">
            <h1 className="text-[12rem] md:text-[16rem] font-black leading-none tracking-tighter opacity-10 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-24 h-24 text-[#F5A623] animate-bounce duration-[3s]" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-[#F5A623] font-mono text-sm tracking-[0.2em] uppercase mb-2">
                <AlertCircle className="w-4 h-4" />
                Error Code: Null Path
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Lost in the Ecosystem</h2>
              <p className="text-[#CFCFCF]/60 text-lg max-w-lg mx-auto leading-relaxed">
                The node you are looking for has been decommissioned or moved to a restricted sector.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link 
                href="/"
                className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-[#F5A623] text-black font-bold flex items-center justify-center gap-3 hover:bg-[#C97A00] transition-all active:scale-95 shadow-xl shadow-[#F5A623]/10 group"
              >
                <Home className="w-5 h-5" />
                Return to Surface
              </Link>
              
              <button 
                onClick={() => window.history.back()}
                className="w-full sm:w-auto h-14 px-8 rounded-2xl glass border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-3 text-sm font-semibold group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Previous Sector
              </button>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="mt-20 pt-10 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40 hover:opacity-100 transition-opacity">
            <Link href="/webstore" className="text-xs font-bold hover:text-[#F5A623] uppercase tracking-widest transition-colors">Webstore</Link>
            <Link href="/appointments" className="text-xs font-bold hover:text-[#F5A623] uppercase tracking-widest transition-colors">Appointments</Link>
            <Link href="/billing" className="text-xs font-bold hover:text-[#F5A623] uppercase tracking-widest transition-colors">Billing</Link>
            <Link href="/support" className="text-xs font-bold hover:text-[#F5A623] uppercase tracking-widest transition-colors">Support</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

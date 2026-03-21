"use client";

import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  User as UserIcon,
  Lock,
  EyeOff,
  Eye,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, status } = useSession();

  // Login states for the gatekeeper
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid internal credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Gatekeeper: Show login if not authenticated as internal
  const isInternal = !!(session as any)?.isInternal;

  if (!isInternal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] relative overflow-hidden font-sans">
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-[#CFCFCF]/60 hover:text-white transition-all group z-50 px-4 py-2 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium tracking-tight">
            Return to Site
          </span>
        </Link>

        <div className="w-full max-w-[440px] p-6 animate-reveal z-10">
          {/* <div className="flex justify-center mb-10">
            <Image
              src="/home/navBar%20Logo.png"
              alt="Makabasla Logo"
              width={180}
              height={45}
              className="h-10 w-auto object-contain text-white invert"
              priority
            />
          </div> */}

          <div className="glass rounded-[2.5rem] p-8 lg:p-10 border border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="text-center mb-10">
              {/* <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5A623]/10 text-[#F5A623] mb-4">
                <ShieldCheck size={24} />
              </div> */}
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Staff Portal
              </h1>
              <p className="text-[#CFCFCF]/50 text-sm font-medium">
                Internal Credentials Required
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl text-center mb-4 font-medium italic">
                  {error}
                </div>
              )}
              {session && !isInternal && (
                <div className="bg-[#F5A623]/10 border border-[#F5A623]/20 text-[#F5A623] text-xs py-3 px-4 rounded-xl text-center mb-4 font-medium italic">
                  Your account does not have staff permissions.
                </div>
              )}

              <div className="space-y-2">
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CFCFCF]/40 group-focus-within:text-[#F5A623] transition-colors" />
                  <input
                    type="text"
                    placeholder="Username"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm placeholder:text-[#CFCFCF]/30 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623]/40 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CFCFCF]/40 group-focus-within:text-[#F5A623] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 text-white text-sm placeholder:text-[#CFCFCF]/30 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623]/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CFCFCF]/40 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[#F5A623] text-black font-bold flex items-center justify-center gap-2 hover:bg-[#C97A00] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-[#F5A623]/10"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Authorize Access"
                )}
              </button>
            </form>
          </div>
        </div>
        <style jsx global>{`
          .glass {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(12px);
          }
          @keyframes reveal {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-reveal {
            animation: reveal 0.5s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }

  // Internal user: Show actual Admin Interface with Sidebar
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-[#050505] flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/5 px-6 sticky top-0 bg-[#050505]/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-gray-400 hover:text-white" />
            <div className="h-4 w-px bg-white/10" />
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-white leading-none mb-1">
                {session?.user?.name}
              </span>
              <span className="text-[10px] text-[#F5A623] font-bold uppercase tracking-tighter">
                Administrator
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-[#F5A623] font-bold shadow-inner">
              {session?.user?.name?.charAt(0)}
            </div>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

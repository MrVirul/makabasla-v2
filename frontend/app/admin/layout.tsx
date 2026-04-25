"use client";

import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import Link from "next/link";
import {
  ArrowLeftIcon,
  UserIcon,
  LockClosedIcon,
  EyeSlashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, status } = useSession();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleAdminLogin: React.FormEventHandler<HTMLFormElement> = async (e) => {
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
        setError("Invalid username or password.");
      }
    } catch (err) {
      console.error("[AdminLayout] Login error:", err);
      setError("System error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#1A1A1A] border-t-[#F5A623] rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = !!session?.isAdmin;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0B0B] relative text-white/90 font-sans">
        <Link
          href="/"
          className="absolute top-12 left-12 flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300"
        >
          <ArrowLeftIcon className="w-4 h-4 stroke-[1.5]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
            BACK
          </span>
        </Link>

        <div className="w-full max-w-sm p-8 relative">
          <div className="mb-12">
            <h1 className="text-2xl text-center font-light tracking-[0.2em] text-white">
              STAFF LOGIN
            </h1>
            <div className="h-px w-12 bg-[#F5A623] mx-auto mt-4" />
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-8">
            {error && (
              <div className="font-mono text-[10px] text-[#FF453A] border border-[#FF453A]/40 bg-[#FF453A]/10 py-3 px-4 rounded-sm tracking-wider uppercase">
                {error}
              </div>
            )}
            {session && (
              <div className="font-mono text-[10px] text-[#F5A623] border border-[#F5A623]/40 bg-[#F5A623]/10 py-3 px-4 rounded-sm tracking-wider uppercase">
                Access Denied: You do not have permission to view this page.
              </div>
            )}

            <div className="space-y-6">
              <div className="relative group">
                <UserIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 group-focus-within:text-[#F5A623] transition-colors stroke-[1.5]" />
                <input
                  type="text"
                  placeholder="USERNAME"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full h-12 bg-transparent border-b border-white/20 px-8 font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#F5A623] transition-all"
                />
              </div>

              <div className="relative group">
                <LockClosedIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 group-focus-within:text-[#F5A623] transition-colors stroke-[1.5]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="PASSWORD"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full h-12 bg-transparent border-b border-white/20 px-8 font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#F5A623] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-4 h-4 stroke-[1.2]" />
                  ) : (
                    <EyeIcon className="w-4 h-4 stroke-[1.2]" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-10 h-12 border border-white/30 font-mono text-xs uppercase tracking-[0.3em] text-white hover:border-white hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                "LOGIN"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar className="no-print" />
      <SidebarInset className="bg-[#0B0B0B] flex flex-col min-h-screen text-[#D1D0C5]">
        <header className="no-print flex h-16 items-center justify-between gap-4 border-b border-[#1A1A1A] px-10 sticky top-0 bg-[#0B0B0B] z-40">
          <div className="flex items-center gap-6">
            <SidebarTrigger className="text-[#A1A1A1] hover:text-[#D1D0C5] transition-colors" />
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-mono text-xs text-[#D1D0C5] lowercase">
                {session?.user?.name}
              </span>
              <span className="font-mono text-[10px] text-[#F5A623] uppercase tracking-widest">
                Administrator
              </span>
            </div>
            <div className="h-8 w-8 rounded-sm bg-[#1A1A1A] flex items-center justify-center text-[#F5A623] font-mono font-bold text-xs uppercase overflow-hidden relative border border-[#1A1A1A]">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "Admin profile"}
                  fill
                  className="object-cover"
                />
              ) : (
                session?.user?.name?.charAt(0)
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-x-hidden">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

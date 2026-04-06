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
        setError("invalid authentication constraints.");
      }
    } catch (err) {
      setError("system error occurred.");
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

  const isAdmin = !!(session as any)?.isAdmin;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0B0B] relative text-[#D1D0C5] font-sans">
        <Link
          href="/"
          className="absolute top-12 left-12 flex items-center gap-2 text-[#646669] hover:text-[#D1D0C5] transition-colors duration-300"
        >
          <ArrowLeftIcon className="w-4 h-4 stroke-[1.5]" />
          <span className="font-mono text-xs uppercase tracking-widest">escape</span>
        </Link>

        <div className="w-full max-w-sm p-8">
          <div className="mb-12">
            <h1 className="text-xl font-medium tracking-tight mb-2">
              staff restricted
            </h1>
            <p className="font-mono text-xs text-[#646669] tracking-widest uppercase">
              internal credentials strictly required
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            {error && (
              <div className="font-mono text-xs text-[#ca4754] border border-[#ca4754]/30 bg-[#ca4754]/10 py-3 px-4 rounded-sm">
                {error}
              </div>
            )}
            {session && !isAdmin && (
              <div className="font-mono text-xs text-[#F5A623] border border-[#F5A623]/30 bg-[#F5A623]/10 py-3 px-4 rounded-sm">
                active node misses elevated permissions.
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#646669] group-focus-within:text-[#F5A623] transition-colors stroke-[1.5]" />
                <input
                  type="text"
                  placeholder="identity"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full h-12 bg-transparent border-b border-[#1A1A1A] px-12 font-mono text-xs text-[#D1D0C5] placeholder:text-[#646669] focus:outline-none focus:border-[#F5A623] transition-colors"
                />
              </div>

              <div className="relative group">
                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#646669] group-focus-within:text-[#F5A623] transition-colors stroke-[1.5]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="passcode"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full h-12 bg-transparent border-b border-[#1A1A1A] px-12 font-mono text-xs text-[#D1D0C5] placeholder:text-[#646669] focus:outline-none focus:border-[#F5A623] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#646669] hover:text-[#D1D0C5] transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-4 h-4 stroke-[1.5]" />
                  ) : (
                    <EyeIcon className="w-4 h-4 stroke-[1.5]" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 font-mono text-xs uppercase tracking-widest text-[#646669] hover:text-[#F5A623] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {isLoading ? "validating..." : "[ process auth sequence ]"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-[#0B0B0B] flex flex-col min-h-screen text-[#D1D0C5]">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-[#1A1A1A] px-10 sticky top-0 bg-[#0B0B0B] z-40">
          <div className="flex items-center gap-6">
            <SidebarTrigger className="text-[#646669] hover:text-[#D1D0C5] transition-colors" />
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-mono text-xs text-[#D1D0C5] lowercase">
                {session?.user?.name}
              </span>
              <span className="font-mono text-[10px] text-[#F5A623] uppercase tracking-widest">
                administrator
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

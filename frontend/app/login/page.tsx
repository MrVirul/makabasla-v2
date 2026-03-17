"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isAdminView, setIsAdminView] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
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
        setError("Invalid credentials. Please try again.");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] relative overflow-hidden font-sans">
      {/* Dynamic background effects */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(245,166,35,0.1)_0%,transparent_50%)]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_100%_100%,rgba(245,166,35,0.05)_0%,transparent_50%)]" />

      {/* Animated blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#F5A623]/10 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#F5A623]/5 blur-[120px] rounded-full animate-pulse delay-700" />

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-[#CFCFCF]/60 hover:text-white transition-all group z-50 px-4 py-2 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium tracking-tight">
          Return to Home
        </span>
      </Link>

      <div className="w-full max-w-[440px] p-6 lg:p-8 animate-reveal z-10">
        <div className="flex justify-center mb-10 transition-transform hover:scale-105 duration-500">
          <Image
            src="/home/navBar%20Logo.png"
            alt="Makabasla Logo"
            width={180}
            height={45}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        <div className="glass rounded-[2.5rem] p-8 lg:p-10 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Subtle light leak */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {isAdminView ? "Staff Portal" : "Welcome Back"}
            </h1>
            <p className="text-[#CFCFCF]/50 text-sm font-medium">
              {isAdminView
                ? "Enter your internal credentials"
                : "Sign in to access the Makabasla ecosystem"}
            </p>
          </div>

          <div className="space-y-6">
            {!isAdminView ? (
              /* Customer Login View */
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <button
                  onClick={() =>
                    signIn(
                      "keycloak",
                      { callbackUrl: "/" },
                      { kc_idp_hint: "google" },
                    )
                  }
                  className="w-full h-14 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-3 hover:bg-[#F5F5F5] transition-all active:scale-[0.98] shadow-lg group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {/* <Image 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    width={20} 
                    height={20} 
                    className="relative z-10"
                  /> */}
                  <span className="relative z-10">Continue with Google</span>
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest">
                    <span className="bg-[#0D0D0D] px-4 text-[#CFCFCF]/30 font-bold">
                      Secure Access
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsAdminView(true)}
                  className="w-full h-14 rounded-2xl bg-white/5 text-white/80 font-semibold border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 group"
                >
                  <Lock className="w-4 h-4 text-[#F5A623]/60 group-hover:text-[#F5A623] transition-colors" />
                  Staff Login
                </button>
              </div>
            ) : (
              /* Admin/Staff Credentials Form */
              <form
                onSubmit={handleAdminLogin}
                className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl text-center mb-4 font-medium italic">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CFCFCF]/40 group-focus-within:text-[#F5A623] transition-colors" />
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

                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminView(false);
                      setError("");
                    }}
                    className="text-xs text-[#CFCFCF]/40 hover:text-[#F5A623] transition-colors font-medium"
                  >
                    ← Back to Customer Login
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link
              href="/help"
              className="text-xs text-[#CFCFCF]/40 hover:text-[#F5A623] transition-colors"
            >
              Access Issues? View Documentation
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[#CFCFCF]/20 font-mono tracking-widest uppercase">
          Ecosystem Node: 0x{new Date().getUTCFullYear()}8B2
        </p>
      </div>
    </div>
  );
}

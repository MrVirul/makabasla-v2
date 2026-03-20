"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] relative overflow-hidden font-sans">
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
              Welcome Back
            </h1>
            <p className="text-[#CFCFCF]/50 text-sm font-medium">
              Sign in to access the Makabasla ecosystem
            </p>
          </div>

          <div className="space-y-6">
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
                <span className="relative z-10">Continue with Google</span>
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  {/* <div className="w-full border-t border-white/5"></div> */}
                </div>
                {/* <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-[#000000]/20 px-4 text-[#CFCFCF]/30 font-bold backdrop-blur-sm">
                    Secure Access
                  </span>
                </div> */}
              </div>
            </div>
          </div>

          {/* <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link
              href="/help"
              className="text-xs text-[#CFCFCF]/40 hover:text-[#F5A623] transition-colors"
            >
              Access Issues? View Documentation
            </Link>
          </div> */}
        </div>

        <p className="mt-8 text-center text-xs text-[#CFCFCF]/20 font-mono tracking-widest uppercase">
          Ecosystem Node: 0x{new Date().getUTCFullYear()}8B2
        </p>
      </div>
    </div>
  );
}

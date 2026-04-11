"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function SignInForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (error === "CredentialsSignin") {
      setAuthError("Invalid credentials. Please try again.");
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const result = await signIn("credentials", {
        username: email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setAuthError("Identity verification failed.");
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setAuthError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col items-center gap-6">
        {/* Brand/Logo */}
        <Link
            href="/"
            className="hover:brightness-110 transition-all duration-300"
          >
            <Image
              src="/home/logo1.png"
              alt="Makabasla Logo"
              width={320}
              height={80}
              className="h-20 w-auto object-contain"
              priority
            />
          </Link>
        
        <div className="text-center font-mono space-y-2">
          <h1 className="text-2xl font-medium tracking-tight uppercase text-white/90">Sign In</h1>
          <p className="font-mono text-[12px] text-white/80 uppercase tracking-[0.3em]">
            Access your account
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="relative group">
            <input
              type="text"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white/90 px-4 py-3 rounded-lg outline-none focus:border-[#F5A623]/40 focus:bg-white/10 transition-all font-mono text-[11px] placeholder:text-white/60 tracking-wider"
              required
            />
          </div>
          <div className="relative group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white/90 px-4 py-3 rounded-lg outline-none focus:border-[#F5A623]/40 focus:bg-white/10 transition-all font-mono text-[11px] placeholder:text-white/60 tracking-wider"
              required
            />
          </div>
        </div>

        {authError && (
          <p className="font-mono text-[9px] text-rose-500/80 uppercase tracking-widest text-center animate-pulse">
            {authError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D1D0C5] hover:bg-white text-[#0B0B0B] font-mono text-[11px] font-bold py-3 rounded-lg transition-all duration-300 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(209,208,197,0.1)] hover:shadow-[0_0_25px_rgba(209,208,197,0.2)]"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10"></span>
        </div>
        <div className="relative flex justify-center text-[13px] uppercase tracking-[0.em] font-mono text-white/80">
          <span className="bg-[#0B0B0B] px-4">OR CONTINUE WITH</span>
        </div>
      </div>

      <button
        onClick={() => signIn("google", { callbackUrl })}
        className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-[#D1D0C5] font-mono text-[10px] py-3 rounded-lg transition-all duration-300 uppercase tracking-widest group"
      >
        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
          {/* ... (SVG paths) */}
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.67-2.28 1.05-3.71 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>

      <div className="text-center space-y-4">
        <div className="pt-2">
          <Link 
            href="/auth/signup" 
            className="font-mono text-[10px] text-white hover:text-white transition-colors uppercase tracking-widest border-b border-white/10 hover:border-[#F5A623]/30 pb-1"
          >
            Don't have an account? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] selection:bg-[#F5A623]/30 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#F5A623] opacity-[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F5A623] opacity-[0.02] blur-[120px] rounded-full" />
      </div>

      <div className="absolute top-12 left-12 flex items-center gap-3 opacity-30">
        <div className="w-1 h-1 bg-[#F5A623] rounded-full animate-pulse" />
        <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-white">System Online</span>
      </div>

      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="w-5 h-5 border-2 border-[#1A1A1A] border-t-[#D1D0C5] rounded-full animate-spin" />
          <span className="font-mono text-[11px] tracking-widest text-[#646669] uppercase">
            Loading Auth Context...
          </span>
        </div>
      }>
        <SignInForm />
      </Suspense>
    </div>
  );
}

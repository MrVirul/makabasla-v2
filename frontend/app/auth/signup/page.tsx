"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://127.0.0.1:8080/api/auth/api/v1/register", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Registration failed");
      }

      // Automatically sign in after registration
      const result = await signIn("credentials", {
        username: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        router.push("/auth/signin?error=CredentialsSignin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm group hover:border-[#F5A623]/30 transition-all duration-500">
           <div className="w-5 h-5 border-2 border-[#F5A623] rounded-sm transform rotate-45 group-hover:rotate-180 transition-transform duration-1000" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-medium tracking-tight text-white/90">Create Account</h1>
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.3em]">
            Join us today
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="relative group">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white/90 px-4 py-3 rounded-lg outline-none focus:border-[#F5A623]/40 focus:bg-white/10 transition-all font-mono text-[11px] placeholder:text-white/20 tracking-wider"
              required
            />
          </div>
          <div className="relative group">
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white/90 px-4 py-3 rounded-lg outline-none focus:border-[#F5A623]/40 focus:bg-white/10 transition-all font-mono text-[11px] placeholder:text-white/20 tracking-wider"
              required
            />
          </div>
          <div className="relative group">
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white/90 px-4 py-3 rounded-lg outline-none focus:border-[#F5A623]/40 focus:bg-white/10 transition-all font-mono text-[11px] placeholder:text-white/20 tracking-wider"
              required
            />
          </div>
          <div className="relative group">
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white/90 px-4 py-3 rounded-lg outline-none focus:border-[#F5A623]/40 focus:bg-white/10 transition-all font-mono text-[11px] placeholder:text-white/20 tracking-wider"
              required
            />
          </div>
        </div>

        {error && (
          <p className="font-mono text-[9px] text-rose-500/80 uppercase tracking-widest text-center animate-pulse">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D1D0C5] hover:bg-white text-[#0B0B0B] font-mono text-[11px] font-bold py-3 rounded-lg transition-all duration-300 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(209,208,197,0.1)] hover:shadow-[0_0_25px_rgba(209,208,197,0.2)]"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="text-center space-y-4">
        <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em]">
          Makabasla v2.0
        </p>
        <div className="pt-2">
          <Link 
            href="/auth/signin" 
            className="font-mono text-[10px] text-white/60 hover:text-white transition-colors uppercase tracking-widest border-b border-white/10 hover:border-[#F5A623]/30 pb-1"
          >
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] selection:bg-[#F5A623]/30 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F5A623] opacity-[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#F5A623] opacity-[0.02] blur-[120px] rounded-full" />
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
        <SignUpForm />
      </Suspense>
    </div>
  );
}

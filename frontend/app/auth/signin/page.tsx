"use client";

import { Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function GoogleRedirect() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    signIn("google", { callbackUrl });
  }, [callbackUrl]);

  return null;
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
      <Suspense fallback={null}>
        <GoogleRedirect />
      </Suspense>
      <div className="flex flex-col items-center gap-4">
        <div className="w-5 h-5 border-2 border-[#1A1A1A] border-t-[#D1D0C5] rounded-full animate-spin" />
        <span className="font-mono text-[11px] tracking-widest text-[#646669] uppercase">
          redirecting...
        </span>
      </div>
    </div>
  );
}

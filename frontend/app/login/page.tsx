"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0B0B] relative font-sans text-[#D1D0C5]">
      <Link
        href="/"
        className="absolute top-12 left-12 flex items-center gap-2 text-[#646669] hover:text-[#D1D0C5] transition-colors duration-300"
      >
        <ArrowLeftIcon className="w-5 h-5 stroke-[1.5]" />
        <span className="text-sm tracking-widest font-mono uppercase">
          Go Back
        </span>
      </Link>

      <div className="w-full max-w-sm flex flex-col gap-12 z-10 p-6">
        <div className="flex justify-center flex-col items-center">
          <Image
            src="/home/navBar%20Logo.png"
            alt="Makabasla Logo"
            width={160}
            height={40}
            className="h-8 w-auto object-contain opacity-90"
            priority
          />
          <h1 className="mt-8 text-xl font-medium tracking-tight text-[#D1D0C5]">
            Username
          </h1>
          <p className="font-mono text-xs mt-2 text-[#646669] tracking-widest uppercase">
            login to authenticate
          </p>
        </div>

        <div className="bg-[#1A1A1A] p-10 rounded-sm">
          <button
            onClick={() =>
              signIn(
                "keycloak",
                { callbackUrl: "/" },
                { kc_idp_hint: "google" },
              )
            }
            className="w-full py-3 px-4 font-mono text-xs rounded-sm border border-transparent bg-[#0B0B0B] text-[#D1D0C5] hover:border-[#646669] hover:text-[#F5A623] transition-colors duration-300 flex items-center justify-center gap-3 active:scale-[0.99]"
          >
            continue processing
          </button>
        </div>

        <p className="text-center text-[10px] text-[#646669] font-mono tracking-widest uppercase">
          node: 0x{new Date().getUTCFullYear()}8B2
        </p>
      </div>
    </div>
  );
}

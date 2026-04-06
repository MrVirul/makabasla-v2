"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  ShoppingBagIcon,
  ArrowRightStartOnRectangleIcon,
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const GoogleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" className="w-3.5 h-3.5">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18c-.77 1.56-1.21 3.31-1.21 5.18s.44 3.62 1.21 5.18l3.66-2.83z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export default function NavBar() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const services = [
    {
      name: "webstore",
      icon: <ShoppingBagIcon className="w-4 h-4 stroke-[1.5]" />,
      href: "/webstore",
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0B]">
      <div className="max-w-[1400px] mx-auto px-12 h-24 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link
            href="/"
            className="opacity-80 hover:opacity-100 transition-opacity"
          >
            <Image
              src="/home/navBar%20Logo.png"
              alt="Makabasla Logo"
              width={140}
              height={35}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-widest uppercase">
          {mounted ? (
            <>
              {services.map((service) => (
                <Link
                  key={service.name}
                  href={service.href}
                  className="text-[#646669] hover:text-[#D1D0C5] transition-colors duration-300 flex items-center gap-2"
                >
                  {service.icon}
                  {service.name}
                </Link>
              ))}

              {(session as any)?.isInternal && (
                <Link
                  href="/admin"
                  className="text-[#F5A623] hover:text-[#D1D0C5] transition-colors duration-300 flex items-center gap-2"
                >
                  <ShieldCheckIcon className="w-4 h-4 stroke-[1.5]" />
                  panel
                </Link>
              )}

              <div className="h-4 w-[1px] bg-[#1A1A1A] mx-2" />

              {session ? (
                <div className="flex items-center gap-6">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 text-[#646669] hover:text-[#D1D0C5] transition-colors group"
                  >
                    {session.user?.image ? (
                      <div className="relative w-5 h-5 overflow-hidden rounded-full ring-1 ring-[#1A1A1A] group-hover:ring-[#D1D0C5] transition-all">
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "User Profile"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <UserIcon className="w-4 h-4 stroke-[1.5]" />
                    )}
                    <span className="max-w-[120px] truncate">
                      {session.user?.name?.toLowerCase()}
                    </span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-[#646669] hover:text-[#F5A623] transition-colors"
                    title="Log Out"
                  >
                    <ArrowRightStartOnRectangleIcon className="w-4 h-4 stroke-[1.5]" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() =>
                    signIn(
                      "google",
                      { callbackUrl: "/" },
                    )
                  }
                  className="text-[#646669] hover:text-[#F5A623] transition-all duration-300 flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] uppercase group"
                >
                  <div className="opacity-40 group-hover:opacity-100 transition-opacity duration-300 filter grayscale group-hover:grayscale-0">
                    <GoogleIcon />
                  </div>
                  Login
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

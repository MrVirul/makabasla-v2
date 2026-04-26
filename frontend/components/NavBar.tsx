"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  ShoppingBagIcon,
  ArrowRightStartOnRectangleIcon,
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function NavBar() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const services = [
    {
      name: "webstore",
      icon: <ShoppingBagIcon className="w-5 h-5 stroke-[1.5]" />,
      href: "/webstore",
    },
  ];

  return (
    <nav 
      className="relative z-50 bg-[#0B0B0B] border-b border-[#1A1A1A]"
      suppressHydrationWarning
    >
      {/* Bottom Shade Gradient */}
      <div 
        className="absolute top-full left-0 right-0 h-32 bg-gradient-to-b from-[#0B0B0B] to-transparent pointer-events-none z-10" 
        suppressHydrationWarning
        aria-hidden="true"
      />
      <div className="max-w-[1400px] mx-auto px-12 h-40 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/"
            className="hover:brightness-110 transition-all duration-300"
          >
            <Image
              src="/home/logo.png"
              alt="Makabasla Logo"
              width={400}
              height={100}
              className="h-28 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-10 font-mono text-[12px] tracking-widest uppercase">
          {mounted ? (
            <>
              {services.map((service) => (
                <Link
                  key={service.name}
                  href={service.href}
                  className="text-[#A1A1A1] hover:text-[#D1D0C5] transition-colors duration-300 flex items-center gap-2.5"
                >
                  <span className="opacity-50">{service.icon}</span>
                  {service.name}
                </Link>
              ))}

              {session?.isInternal && (
                <Link
                  href="/admin"
                  className="text-[#F5A623] hover:text-[#D1D0C5] transition-colors duration-300 flex items-center gap-2.5"
                >
                  <ShieldCheckIcon className="w-5 h-5 stroke-[1.5]" />
                  admin panel
                </Link>
              )}

              <div className="h-4 w-[1px] bg-[#1A1A1A] mx-2" />

              {session ? (
                <div className="flex items-center gap-8">
                  <Link
                    href="/profile"
                    className="flex items-center gap-4 text-[#A1A1A1] hover:text-[#D1D0C5] transition-colors group"
                  >
                    {session.user?.image ? (
                      <div className="relative w-8 h-8 overflow-hidden rounded-sm ring-1 ring-[#1A1A1A] group-hover:ring-[#D1D0C5] transition-all">
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "User Profile"}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <UserIcon className="w-5 h-5 stroke-[1.5]" />
                    )}
                    <span className="max-w-[160px] truncate tracking-normal normal-case font-sans font-medium text-sm text-[#D1D0C5]">
                      {session.user?.name}
                    </span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-[#A1A1A1] hover:text-[#ca4754] transition-colors p-1"
                    title="Sign Out"
                  >
                    <ArrowRightStartOnRectangleIcon className="w-5 h-5 stroke-[1.5]" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-8 py-3 bg-[#1A1A1A] text-[#D1D0C5] hover:bg-[#F5A623] hover:text-[#0B0B0B] transition-all duration-300 rounded-sm font-mono text-[12px] tracking-widest uppercase"
                >
                  Log In / Sign Up
                </Link>
              )}
            </>
          ) : (
            <div className="h-10 w-48 animate-pulse bg-[#1A1A1A] rounded-sm" />
          )}
        </div>
      </div>
    </nav>
  );
}

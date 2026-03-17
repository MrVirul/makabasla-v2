"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  CalendarDays,
  CreditCard,
  ShoppingBag,
  LogOut,
  User,
  ShieldCheck,
} from "lucide-react";

export default function NavBar() {
  const { data: session } = useSession();
  const services = [
    {
      name: "Appointments",
      icon: <CalendarDays className="w-4 h-4" />,
      href: "/appointments",
    },
    {
      name: "Billing/Quotation",
      icon: <CreditCard className="w-4 h-4" />,
      href: "/billing",
    },
    {
      name: "Webstore",
      icon: <ShoppingBag className="w-4 h-4" />,
      href: "/webstore",
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b-0">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left Space for Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2">
            <Image
              src="/home/navBar%20Logo.png"
              alt="Makabasla Logo"
              width={160}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* System Services Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {services.map((service) => (
            <Link
              key={service.name}
              href={service.href}
              className="px-4 py-2 rounded-full text-[#CFCFCF] text-sm font-medium hover:text-[#F5F5F5] hover:bg-[#F5F5F5]/5 transition-all flex items-center gap-2"
            >
              {service.icon}
              {service.name}
            </Link>
          ))}

          {(session as any)?.isInternal && (
            <Link
              href="/admin"
              className="px-4 py-2 rounded-full text-[#F5A623] text-sm font-bold hover:bg-[#F5A623]/10 transition-all flex items-center gap-2 border border-[#F5A623]/20"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Panel
            </Link>
          )}

          <div className="h-4 w-[1px] bg-[#CFCFCF]/20 mx-2" />

          {session ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={24}
                    height={24}
                    className="rounded-full border border-[#F5A623]/20"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#F5A623]/20 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-[#F5A623]" />
                  </div>
                )}
                <span className="text-sm font-medium text-white max-w-[120px] truncate">
                  {session.user?.name}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2.5 rounded-full text-[#CFCFCF] hover:text-white hover:bg-white/10 transition-all active:scale-95"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/login">
              <button className="h-10 px-6 rounded-full bg-[#F5A623] text-black text-sm font-bold hover:bg-[#C97A00] transition-all active:scale-95 glow shadow-[#F5A623]/10">
                Log In
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Placeholder */}
        <div className="md:hidden">
          <button className="text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

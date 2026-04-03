"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  HomeIcon,
  ShoppingBagIcon,
  ArrowRightStartOnRectangleIcon,
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function NavBar() {
  const { data: session } = useSession();
  const services = [
    {
      name: "Dashboard",
      icon: <HomeIcon className="w-4 h-4 stroke-[1.5]" />,
      href: "/admin",
    },
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
                className="flex items-center gap-2 text-[#646669] hover:text-[#D1D0C5] transition-colors"
              >
                <UserIcon className="w-4 h-4 stroke-[1.5]" />
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
            <Link
              href="/login"
              className="text-[#646669] hover:text-[#F5A623] transition-colors flex items-center gap-2"
            >
              <ArrowRightStartOnRectangleIcon className="w-4 h-4 stroke-[1.5]" />
              oauth
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import logo1 from "@/public/home/common/logo1.png";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B0B0B] border-t border-[#1A1A1A] pt-24 pb-12 px-6 md:px-12 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-12 mb-24">
          {/* Brand Identity */}
          <div className="space-y-8">
            <Link
              href="/"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <Image
                src={logo1}
                alt="Makabasla Logo"
                width={300}
                height={80}
                className="h-20 w-auto object-contain"
              />
            </Link>
            <p className="text-[#A1A1A1] font-mono text-xs md:text-sm leading-relaxed tracking-wide max-w-xs opacity-70">
              The Legend of the Land Rover Defender Lives On. Specialists in
              hardcore off-road modifications, restorations, and overland
              builds.
            </p>
            <div className="flex gap-5">
              <Link
                href="https://www.instagram.com/makabaslapvtlimited/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A1A1A1] hover:text-[#F5A623] transition-colors"
              >
                <Instagram size={20} strokeWidth={1.5} />
              </Link>

              <Link
                href="https://www.facebook.com/profile.php?id=61572483875063"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A1A1A1] hover:text-[#F5A623] transition-colors"
              >
                <Facebook size={20} strokeWidth={1.5} />
              </Link>

              <Link
                href="https://www.youtube.com/@MakabaslaPvtLimited"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A1A1A1] hover:text-[#F5A623] transition-colors"
              >
                <Youtube size={20} strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-[#D1D0C5] font-mono text-[10px] tracking-[0.4em] uppercase mb-10 opacity-50">
              Navigation
            </h4>
            <ul className="space-y-4 font-mono text-[12px] tracking-widest uppercase">
              <li>
                <Link
                  href="/"
                  className="text-[#A1A1A1] hover:text-[#F5A623] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/webstore"
                  className="text-[#A1A1A1] hover:text-[#F5A623] transition-colors"
                >
                  Webstore
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="text-[#A1A1A1] hover:text-[#F5A623] transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="#projects"
                  className="text-[#A1A1A1] hover:text-[#F5A623] transition-colors"
                >
                  Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Services */}
          <div>
            <h4 className="text-[#D1D0C5] font-mono text-[10px] tracking-[0.4em] uppercase mb-10 opacity-50">
              Services
            </h4>
            <ul className="space-y-4 font-mono text-[12px] tracking-widest uppercase">
              <li className="text-[#A1A1A1]">Full Restoration</li>
              <li className="text-[#A1A1A1]">Off-Road Armor</li>
              <li className="text-[#A1A1A1]">Suspension Kits</li>
              <li className="text-[#A1A1A1]">Overland Builds</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-[#D1D0C5] font-mono text-[10px] tracking-[0.4em] uppercase mb-10 opacity-50">
              Contact
            </h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 group">
                <MapPin
                  className="text-[#F5A623] shrink-0"
                  size={18}
                  strokeWidth={1.5}
                />
                <span className="text-[#A1A1A1] font-mono text-xs leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                  No 123, Garage Road,
                  <br />
                  Colombo, Sri Lanka
                </span>
              </li>
              <li className="flex items-center gap-4 group">
                <Phone
                  className="text-[#F5A623] shrink-0"
                  size={18}
                  strokeWidth={1.5}
                />
                <span className="text-[#A1A1A1] font-mono text-xs opacity-80 group-hover:opacity-100 transition-opacity">
                  +94 77 221 5243
                </span>
              </li>
              <li className="flex items-center gap-4 group">
                <Mail
                  className="text-[#F5A623] shrink-0"
                  size={18}
                  strokeWidth={1.5}
                />
                <span className="text-[#A1A1A1] font-mono text-xs lowercase opacity-80 group-hover:opacity-100 transition-opacity">
                  makabasla.garage@gmail.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-[#1A1A1A] flex flex-col md:flex-row justify-between items-center gap-8 text-[#646669] font-mono text-[10px] tracking-[0.3em] uppercase">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#F5A623] rounded-full animate-pulse" />
            © {currentYear} Makabasla (PVT) Ltd. All Rights Reserved.
          </div>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-[#D1D0C5] transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-[#D1D0C5] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import * as React from "react";
import {
  Squares2X2Icon,
  UsersIcon,
  TruckIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";

const adminItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Squares2X2Icon,
    permission: "admin:dashboard", // Default access for all admins
  },
  {
    title: "Customers",
    url: "/admin/customers",
    icon: UsersIcon,
    permission: "admin:customers",
  },
  {
    title: "Vehicles",
    url: "/admin/vehicles",
    icon: TruckIcon,
    permission: "admin:registry",
  },
  {
    title: "Letterhead",
    url: "/admin/letterhead",
    icon: DocumentTextIcon,
    permission: "admin:dashboard",
  },
  {
    title: "Users",
    url: "/admin/profile",
    icon: Cog6ToothIcon,
    permission: "super_admin",
  },
];

export function AdminSidebar({ className }: Readonly<{ className?: string }>) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRoles = session?.roles || [];
  const isSuperAdmin = session?.isSuperAdmin;

  // Filter items based on dynamic permissions
  const filteredItems = adminItems.filter((item) => {
    if (isSuperAdmin) return true;
    if (item.permission === "admin:dashboard") return true;
    return userRoles.includes(item.permission);
  });

  return (
    <Sidebar
      collapsible="icon"
      className={`border-r border-[#1A1A1A] bg-[#0B0B0B] [&_[data-sidebar=sidebar]]:bg-[#0B0B0B] ${className || ""}`}
    >
      <SidebarHeader className="border-b border-[#1A1A1A] p-6 h-16 flex justify-center">
        <div className="flex items-center gap-4">
          <Image
              src="/home/logo1.png"
              alt="Makabasla Logo"
              width={320}
              height={80}
              className="h-10 w-auto object-contain"
              priority
            />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
            <span className="text-xs font-mono uppercase tracking-widest text-[#D1D0C5] line-clamp-1 truncate">
              {isSuperAdmin ? "System Admin" : "Staff Access"}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-6 scrollbar-hide">
        <SidebarGroup>
          <div className="text-[10px] font-mono tracking-widest uppercase text-[#A1A1A1] px-6 mb-6 group-data-[collapsible=icon]:hidden">
            Navigation
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 gap-2">
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className={`font-mono text-xs lowercase px-3 py-6 rounded-sm transition-all focus-visible:ring-1 focus-visible:ring-[#F5A623]
                      ${
                        pathname === item.url
                          ? "bg-[#1A1A1A] text-[#F5A623]"
                          : "text-[#A1A1A1] hover:bg-[#1A1A1A]/50 hover:text-[#D1D0C5]"
                      }
                    `}
                  >
                    <Link href={item.url} className="flex items-center gap-4">
                      <item.icon className="w-5 h-5 stroke-[1.5]" />
                      <span className="font-mono">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#1A1A1A] p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="font-mono text-xs lowercase text-[#A1A1A1] hover:text-[#F5A623] hover:bg-transparent px-3 py-6 transition-colors"
              onClick={() => signOut({ callbackUrl: "/admin" })}
            >
              <ArrowRightStartOnRectangleIcon className="w-5 h-5 stroke-[1.5]" />
              <span className="group-data-[collapsible=icon]:hidden">
                Logout
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

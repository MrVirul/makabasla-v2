"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Car,
  Settings,
  LogOut,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Customers",
    url: "/admin/customers",
    icon: Users,
  },
  {
    title: "Vehicles",
    url: "/admin/vehicles",
    icon: Car,
  },
  {
    title: "My Profile",
    url: "/admin/profile",
    icon: UserIcon,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-white/10 bg-[#0A0A0A]">
      <SidebarHeader className="border-b border-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5A623] text-black shadow-lg shadow-[#F5A623]/20">
            <ShieldCheck size={20} />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-white line-clamp-1">
              Makabasla Admin
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#F5A623] font-bold">
              Owner View
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#CFCFCF]/40 group-data-[collapsible=icon]:hidden px-2">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className={`hover:bg-white/5 data-[active=true]:bg-[#F5A623]/10 data-[active=true]:text-[#F5A623] transition-all py-5 ${pathname === item.url ? "text-[#F5A623]" : "text-gray-400"}`}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/5 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-gray-400 hover:text-white hover:bg-white/5 py-5"
              onClick={() => signOut({ callbackUrl: "/admin" })}
            >
              <LogOut size={20} />
              <span className="font-medium group-data-[collapsible=icon]:hidden">
                Sign Out
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

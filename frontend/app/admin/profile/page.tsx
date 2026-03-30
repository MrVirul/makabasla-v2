"use client";

import { useSession } from "next-auth/react";
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  Key,
  Clock,
  ShieldAlert,
  Edit,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/profile/button";
import { Badge } from "@/components/ui/profile/badge";

export default function AdminProfilePage() {
  const { data: session } = useSession();

  const permissions = [
    "User Management",
    "Vehicle Fleet Control",
    "System Monitoring",
    "Security Policy Editing",
    "Audit Log Access",
  ];

  const recentActions = [
    {
      action: "Updated Security Policy",
      time: "2 hours ago",
      status: "Success",
    },
    {
      action: "Provisioned User: staff-05",
      time: "5 hours ago",
      status: "Success",
    },
    {
      action: "System Backup Initiated",
      time: "Yesterday",
      status: "Completed",
    },
  ];

  return (
    <div className="p-8 pb-20 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Staff Identity
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your internal credentials and permissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - ID Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0B0B0B] rounded-[2.5rem] border border-[#F5A623]/20 overflow-hidden shadow-2xl relative group">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-[#F5A623] to-[#C97A00] flex items-center justify-center text-black shadow-xl shadow-[#F5A623]/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <UserIcon size={48} />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-1.5 rounded-full border-4 border-[#0B0B0B] animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              </div>

              <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                {session?.user?.name}
              </h2>
              <Badge className="mt-2 bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20 font-black tracking-widest uppercase text-[10px] px-3 py-1">
                Administrator
              </Badge>

              <div className="mt-8 w-full space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <Mail size={16} className="text-[#F5A623]/60" />
                  <span className="text-xs text-gray-400 font-medium truncate">
                    {session?.user?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

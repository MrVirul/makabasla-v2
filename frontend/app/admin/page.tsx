"use client";
import {
  Users,
  Activity,
  Database,
  Settings,
  Plus,
  Search,
  ShieldCheck,
  Monitor,
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      label: "Active Sessions",
      value: "1,284",
      icon: <Activity className="w-5 h-5 text-[#F5A623]" />,
      change: "+12%",
    },
    {
      label: "Internal Users",
      value: "48",
      icon: <Users className="w-5 h-5 text-[#F5A623]" />,
      change: "Stable",
    },
    {
      label: "System Uptime",
      value: "99.98%",
      icon: <Monitor className="w-5 h-5 text-[#F5A623]" />,
      change: "+0.01%",
    },
    {
      label: "DB Clusters",
      value: "8",
      icon: <Database className="w-5 h-5 text-[#F5A623]" />,
      change: "Critical",
    },
  ];

  const recentLogs = [
    {
      id: "LOG-001",
      user: "admin-virul",
      action: "Policy Update",
      status: "Success",
      time: "2 mins ago",
    },
    {
      id: "LOG-002",
      user: "system-bot",
      action: "Database Backup",
      status: "Completed",
      time: "15 mins ago",
    },
    {
      id: "LOG-003",
      user: "staff-04",
      action: "New User Provision",
      status: "Pending",
      time: "1 hour ago",
    },
  ];

  return (
    <div className="p-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Ecosystem Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Real-time system health and administration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-10 px-5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center gap-2 text-sm font-medium">
            <Plus className="w-4 h-4" />
            Provision New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/5 rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group hover:border-[#F5A623]/20 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-[#0B0B0B] border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  stat.change === "Critical"
                    ? "bg-red-500/20 text-red-500"
                    : "bg-green-500/20 text-green-500"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="text-3xl font-bold mb-1 tracking-tight">
              {stat.value}
            </div>
            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

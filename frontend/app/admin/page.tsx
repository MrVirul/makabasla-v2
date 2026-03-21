"use client";
import { 
  Users, 
  Activity, 
  Database, 
  Settings, 
  Plus, 
  Search, 
  ShieldCheck, 
  Monitor 
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
          <h1 className="text-3xl font-extrabold tracking-tight">Ecosystem Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time system health and administration.</p>
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
          <div key={stat.label} className="bg-white/5 rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group hover:border-[#F5A623]/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-[#0B0B0B] border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                stat.change === "Critical" ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="text-3xl font-bold mb-1 tracking-tight">{stat.value}</div>
            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
           <div className="bg-[#0B0B0B] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
              <div className="p-7 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <h3 className="font-bold flex items-center gap-3 text-lg">
                  <Activity className="w-5 h-5 text-[#F5A623]" />
                  System Activity Logs
                </h3>
                <div className="relative hidden md:block">
                  <Search className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search logs..." 
                    className="h-9 w-56 pl-10 pr-4 rounded-xl bg-[#050505] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F5A623]/40 transition-all placeholder:text-gray-700"
                  />
                </div>
              </div>
              <div className="overflow-x-auto px-2">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-gray-500">
                      <th className="px-6 py-5 font-bold">ID</th>
                      <th className="px-6 py-5 font-bold">Initiator</th>
                      <th className="px-6 py-5 font-bold">Action</th>
                      <th className="px-6 py-5 font-bold">Status</th>
                      <th className="px-6 py-5 font-bold text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-5 text-[11px] font-mono text-[#F5A623]/70">{log.id}</td>
                        <td className="px-6 py-5 text-sm font-semibold text-gray-200">{log.user}</td>
                        <td className="px-6 py-5 text-sm text-gray-400 font-medium">{log.action}</td>
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-tighter ${
                            log.status === "Success" || log.status === "Completed" 
                            ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20" 
                            : "text-amber-400 bg-amber-400/10 border border-amber-400/20"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right text-xs text-gray-600 font-medium italic">{log.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-5 bg-white/[0.02] text-center border-t border-white/5 mt-2">
                <button className="text-xs text-[#F5A623] font-bold hover:underline transition-all hover:scale-105 active:scale-95">View Full Audit Trail</button>
              </div>
            </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-[#0B0B0B] rounded-[2.5rem] p-8 border border-[#F5A623]/10 bg-gradient-to-br from-white/[0.02] to-transparent shadow-xl relative overflow-hidden group">
              <div className="bg-[#F5A623] w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-[#F5A623]/20 group-hover:rotate-12 transition-transform duration-500">
                <ShieldCheck className="w-7 h-7 text-black" />
              </div>
              <h4 className="text-2xl font-black mb-3 text-white tracking-tighter uppercase italic">IAM Controls</h4>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">
                Manage granular user permissions and security policies across the Makabasla service mesh.
              </p>
              <button className="w-full h-12 rounded-xl border border-white/10 hover:border-[#F5A623]/40 text-[#F5A623] text-sm font-black uppercase tracking-widest transition-all hover:bg-[#F5A623]/5 active:scale-95 shadow-lg">
                Launch IAM Module
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

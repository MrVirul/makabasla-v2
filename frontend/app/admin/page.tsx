"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { 
  Users, 
  Activity, 
  Database, 
  ShieldCheck, 
  Settings, 
  ArrowUpRight,
  Monitor,
  Search,
  Plus,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft
} from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Login states
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    // Redirect authenticated non-internal users
    if (status === "authenticated" && !(session as any)?.isInternal) {
      router.push("/");
    }
  }, [status, session, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid internal credentials.");
      }
      // If success, next-auth will update the status automatically
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated, show the login form
  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] relative overflow-hidden font-sans">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(245,166,35,0.1)_0%,transparent_50%)]" />
        
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-[#CFCFCF]/60 hover:text-white transition-all group z-50 px-4 py-2 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium tracking-tight">Return to Site</span>
        </Link>

        <div className="w-full max-w-[440px] p-6 animate-reveal z-10">
          <div className="flex justify-center mb-10">
            <Image
              src="/home/navBar%20Logo.png"
              alt="Makabasla Logo"
              width={180}
              height={45}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>

          <div className="glass rounded-[2.5rem] p-8 lg:p-10 border border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Staff Portal</h1>
              <p className="text-[#CFCFCF]/50 text-sm font-medium">Enter your internal credentials</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl text-center mb-4 font-medium italic">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CFCFCF]/40 group-focus-within:text-[#F5A623] transition-colors" />
                  <input
                    type="text"
                    placeholder="Username"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm placeholder:text-[#CFCFCF]/30 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623]/40 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CFCFCF]/40 group-focus-within:text-[#F5A623] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 text-white text-sm placeholder:text-[#CFCFCF]/30 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623]/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CFCFCF]/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[#F5A623] text-black font-bold flex items-center justify-center gap-2 hover:bg-[#C97A00] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-[#F5A623]/10"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Access"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated as internal user, show the dashboard
  const stats = [
    { label: "Active Sessions", value: "1,284", icon: <Activity className="w-5 h-5 text-[#F5A623]" />, change: "+12%" },
    { label: "Internal Users", value: "48", icon: <Users className="w-5 h-5 text-[#F5A623]" />, change: "Stable" },
    { label: "System Uptime", value: "99.98%", icon: <Monitor className="w-5 h-5 text-[#F5A623]" />, change: "+0.01%" },
    { label: "DB Clusters", value: "8", icon: <Database className="w-5 h-5 text-[#F5A623]" />, change: "Critical" },
  ];

  const recentLogs = [
    { id: "LOG-001", user: "admin-virul", action: "Policy Update", status: "Success", time: "2 mins ago" },
    { id: "LOG-002", user: "system-bot", action: "Database Backup", status: "Completed", time: "15 mins ago" },
    { id: "LOG-003", user: "staff-04", action: "New User Provision", status: "Pending", time: "1 hour ago" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white font-sans">
      <NavBar />
      
      <main className="flex-grow pt-28 pb-12 px-6 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="px-3 py-1 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/20 text-[#F5A623] text-xs font-bold uppercase tracking-widest">
                Internal Portal
              </div>
              <span className="text-[#CFCFCF]/40 text-xs font-mono select-none">NODE_DC_01</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Ecosystem Dashboard</h1>
            <p className="text-[#CFCFCF]/60 mt-1">Global management and system monitoring for Makabasla.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="h-11 px-5 rounded-xl glass border-white/5 hover:bg-white/10 transition-all flex items-center gap-2 text-sm font-medium">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button className="h-11 px-5 rounded-xl bg-[#F5A623] text-black hover:bg-[#C97A00] transition-all flex items-center gap-2 text-sm font-bold shadow-lg shadow-[#F5A623]/10">
              <Plus className="w-4 h-4" />
              Provision New
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F5A623]/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-[#F5A623]/10 transition-colors" />
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  {stat.icon}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  stat.change === "Critical" ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-[#CFCFCF]/40 text-xs font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area - Activity Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#F5A623]" />
                  System Activity Logs
                </h3>
                <div className="relative">
                  <Search className="w-4 h-4 text-[#CFCFCF]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search logs..." 
                    className="h-9 w-48 pl-9 pr-4 rounded-full bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-[#F5A623]/40 transition-all"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-[#CFCFCF]/40">
                      <th className="px-6 py-4 font-bold">ID</th>
                      <th className="px-6 py-4 font-bold">Initiator</th>
                      <th className="px-6 py-4 font-bold">Action</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 text-xs font-mono text-[#F5A623]/60">{log.id}</td>
                        <td className="px-6 py-4 text-sm font-medium">{log.user}</td>
                        <td className="px-6 py-4 text-sm text-[#CFCFCF]/80">{log.action}</td>
                        <td className="px-6 py-4 text-xs">
                          <span className={`px-2 py-1 rounded-md ${
                            log.status === "Success" || log.status === "Completed" 
                            ? "text-green-400 bg-green-400/10" 
                            : "text-amber-400 bg-amber-400/10"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#CFCFCF]/40">{log.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-white/5 text-center">
                <button className="text-xs text-[#F5A623] font-bold hover:underline py-1">View Full Audit Trail</button>
              </div>
            </div>
          </div>

          {/* Sidebar Area - Security and Quick Links */}
          <div className="space-y-6">
            <div className="glass rounded-[2rem] p-6 border border-white/5">
              <h3 className="font-bold flex items-center gap-2 mb-6">
                <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
                Security Pulse
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  <div className="flex-grow">
                    <div className="text-sm font-bold">Keycloak IDP</div>
                    <div className="text-[10px] text-[#CFCFCF]/40 uppercase">Operational - No Alerts</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <div className="flex-grow">
                    <div className="text-sm font-bold">Aiven Cloud DB</div>
                    <div className="text-[10px] text-[#CFCFCF]/40 uppercase">Encrypted Connection Active</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,166,35,0.5)]" />
                  <div className="flex-grow">
                    <div className="text-sm font-bold">API Gateway</div>
                    <div className="text-[10px] text-[#CFCFCF]/40 uppercase">8080 Process Healthy</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-[2.5rem] p-6 border border-[#F5A623]/10 bg-gradient-to-br from-[#1A1A1A] to-[#050505]">
              <div className="bg-[#F5A623] w-10 h-10 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-[#F5A623]/20">
                <ShieldCheck className="w-6 h-6 text-black" />
              </div>
              <h4 className="text-xl font-bold mb-2">IAM Controls</h4>
              <p className="text-xs text-[#CFCFCF]/60 mb-6 leading-relaxed">
                Manage user permissions and security policies across the entire Makabasla ecosystem.
              </p>
              <button className="w-full h-11 rounded-xl glass border-white/10 hover:border-[#F5A623]/40 text-[#F5A623] text-sm font-bold flex items-center justify-center gap-2 group transition-all">
                Launch IAM Module
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

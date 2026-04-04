"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  UserIcon,
  TruckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/profile/dialog";

interface Vehicle {
  id: number;
  make: string;
  model: string;
  plate_number: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  vehicles?: Vehicle[];
}

export default function AdminCustomersPage() {
  const { data: session, status } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const API_BASE = "http://127.0.0.1:8080/api/auth/api/v1";
  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      setError("unauthorized access. session required.");
      setLoading(false);
      return;
    }

    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

        const res = await fetch(`${API_BASE}/customers`, { headers });
        if (!res.ok) throw new Error("failed to fetch customers");
        const data: Customer[] = await res.json();
        setCustomers(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [status, accessToken]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#D1D0C5] font-sans selection:bg-[#F5A623]/20">
      <div className="max-w-[1240px] mx-auto p-12">
        
        {/* Header & Search */}
        <div className="mb-12 flex flex-col items-start gap-8 md:flex-row md:items-end justify-between border-b border-[#1A1A1A] pb-8">
          <div>
            <h1 className="text-3xl font-medium text-white/90">Identity Directory</h1>
            <p className="font-mono text-[10px] text-[#646669] uppercase tracking-widest mt-2">
              managing all registered nodes
            </p>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#646669] group-focus-within:text-[#F5A623] transition-colors" />
            <input
              autoFocus
              placeholder="filter by name, link, or tel..."
              className="w-full bg-[#1A1A1A]/30 text-[#D1D0C5] pl-12 pr-4 py-3 rounded-sm border-transparent outline-none placeholder:text-[#646669] focus:bg-[#1A1A1A]/50 focus:ring-1 focus:ring-[#F5A623]/30 transition-all font-mono text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="mb-8 font-mono text-rose-400 bg-rose-400/5 px-4 py-3 border border-rose-400/10 rounded-sm text-[10px] uppercase tracking-widest">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 rounded-sm bg-[#1A1A1A]/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-px">
            <div className="grid grid-cols-[1fr_2fr_1.5fr_80px] gap-4 px-8 py-4 font-mono text-[10px] text-[#646669] uppercase tracking-widest border-b border-[#1A1A1A]">
              <span>Name</span>
              <span>Email Link</span>
              <span>Communication</span>
              <span className="text-right">Action</span>
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center text-center">
                <UserIcon className="w-12 h-12 text-[#1A1A1A] mb-4" />
                <p className="font-mono text-[10px] text-[#646669] uppercase tracking-widest">no nodes found matching criteria</p>
              </div>
            ) : (
              filteredCustomers.map((c) => (
                <div
                  key={c.id}
                  className="group grid grid-cols-[1fr_2fr_1.5fr_80px] gap-4 px-8 py-6 items-center bg-[#141414]/20 hover:bg-[#141414] transition-all border-b border-[#1A1A1A]/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-sm bg-[#0B0B0B] flex items-center justify-center text-[#F5A623] font-mono text-xs">
                      {c.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-[#D1D0C5] truncate">{c.name}</span>
                  </div>
                  
                  <span className="font-mono text-xs text-[#646669] truncate lowercase group-hover:text-[#D1D0C5] transition-colors">
                    {c.email}
                  </span>

                  <span className="font-mono text-xs text-[#646669]">
                    {c.phone || "not assigned"}
                  </span>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="p-2 text-[#1A1A1A] group-hover:text-[#646669] hover:!text-[#F5A623] transition-colors"
                      title="View Analysis"
                    >
                      <InformationCircleIcon className="w-5 h-5 stroke-[1.5]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Customer Analysis Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl bg-[#0B0B0B] border-[#1A1A1A] text-[#D1D0C5] p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-8 border-b border-[#1A1A1A] bg-[#0B0B0B]">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl font-medium tracking-tight text-white mb-2">
                  Node Analysis
                </DialogTitle>
                <p className="font-mono text-[10px] text-[#646669] uppercase tracking-widest mt-1">
                  id: {selectedCustomer?.id}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-12">
            {/* Core Info */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <span className="font-mono text-[9px] text-[#646669] uppercase tracking-widest flex items-center gap-2">
                  <UserIcon className="w-3 h-3" /> identity
                </span>
                <p className="text-lg text-[#D1D0C5]">{selectedCustomer?.name}</p>
              </div>
              <div className="space-y-1.5">
                <span className="font-mono text-[9px] text-[#646669] uppercase tracking-widest flex items-center gap-2">
                  <CalendarDaysIcon className="w-3 h-3" /> allocation date
                </span>
                <p className="font-mono text-sm text-[#D1D0C5]">
                  {selectedCustomer?.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString() : "n/a"}
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="font-mono text-[9px] text-[#646669] uppercase tracking-widest flex items-center gap-2">
                  <EnvelopeIcon className="w-3 h-3" /> network link
                </span>
                <p className="font-mono text-sm text-[#D1D0C5] lowercase">{selectedCustomer?.email}</p>
              </div>
              <div className="space-y-1.5">
                <span className="font-mono text-[9px] text-[#646669] uppercase tracking-widest flex items-center gap-2">
                  <PhoneIcon className="w-3 h-3" /> relay device
                </span>
                <p className="font-mono text-sm text-[#D1D0C5]">{selectedCustomer?.phone || "unassigned"}</p>
              </div>
            </div>

            {/* Asset Registry */}
            <div className="space-y-6 pt-8 border-t border-[#1A1A1A]/30">
               <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#646669]">Linked Assets</h4>
               
               <div className="space-y-2">
                  {selectedCustomer?.vehicles && selectedCustomer.vehicles.length > 0 ? (
                    selectedCustomer.vehicles.map(v => (
                       <div key={v.id} className="flex items-center justify-between p-4 bg-[#141414] rounded-sm border-l-2 border-transparent hover:border-[#F5A623]/40 transition-all">
                          <div className="flex items-center gap-4">
                             <TruckIcon className="w-4 h-4 text-[#646669]" />
                             <div>
                                <p className="text-sm text-[#D1D0C5]">{v.make} {v.model}</p>
                                <p className="font-mono text-[9px] text-[#646669] uppercase tracking-widest">PLATE: {v.plate_number}</p>
                             </div>
                          </div>
                          <span className="font-mono text-[10px] text-[#646669] uppercase tracking-widest">ACTIVE</span>
                       </div>
                    ))
                  ) : (
                    <div className="p-8 border border-dashed border-[#1A1A1A] rounded-sm text-center">
                       <p className="font-mono text-[9px] text-[#333] uppercase">no assets currently allocated</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
          
          <div className="p-8 border-t border-[#1A1A1A] flex justify-end">
            <button
               onClick={() => setSelectedCustomer(null)}
               className="font-mono text-[10px] text-[#646669] hover:text-[#D1D0C5] uppercase tracking-widest transition-colors flex items-center gap-2"
            >
               close analysis
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

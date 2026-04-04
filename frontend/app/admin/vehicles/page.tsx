"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  HashtagIcon,
  BanknotesIcon,
  ChevronRightIcon,
  PlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  SwatchIcon,
  TruckIcon
} from "@heroicons/react/24/outline";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/profile/dialog";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  color: string;
  plate_number: string;
  customer?: Customer;
  has_billing?: boolean;
}

export default function AdminVehiclesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [checkingBilling, setCheckingBilling] = useState<Record<number, boolean>>({});
  const [confirmVehicle, setConfirmVehicle] = useState<Vehicle | null>(null);

  const API_BASE = "http://127.0.0.1:8080/api/auth/api/v1";
  const BILLING_BASE = "http://127.0.0.1:8080/api/billing";
  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      setError("unauthorized access. session required.");
      setLoading(false);
      return;
    }

    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

        const res = await fetch(`${API_BASE}/vehicles`, { headers });
        if (!res.ok) throw new Error("failed to fetch vehicles");
        const data: Vehicle[] = await res.json();
        
        // Fetch all billing records in one go to avoid console 404s and improve performance
        let allBillings: { vehicle_id: number }[] = [];
        try {
          const bRes = await fetch(`${BILLING_BASE}/internal/billings`, { headers });
          if (bRes.ok) {
            allBillings = await bRes.json();
          }
        } catch (err) {
          console.error("failed to fetch billing status batch:", err);
        }

        const billingMap = new Set(allBillings.map(b => b.vehicle_id));
        const vehiclesWithBilling = data.map(v => ({
          ...v,
          has_billing: billingMap.has(v.id)
        }));

        setVehicles(vehiclesWithBilling);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [status, accessToken]);

  const startBilling = async (vehicleId: number) => {
    try {
      setCheckingBilling(prev => ({ ...prev, [vehicleId]: true }));
      const res = await fetch(`${BILLING_BASE}/${vehicleId}`, { method: "POST" });
      if (!res.ok) throw new Error("failed to start billing cycle");
      router.push(`/admin/vehicles/${vehicleId}/billing`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCheckingBilling(prev => ({ ...prev, [vehicleId]: false }));
      setConfirmVehicle(null);
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.customer?.name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ),
  );

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#CFCFCF]/50 font-sans tracking-tight">
      <div className="max-w-[1240px] mx-auto p-12 animate-in fade-in duration-700">
        
        {/* Header & Search */}
        <div className="mb-12 flex flex-col items-start gap-8 md:flex-row md:items-end justify-between border-b border-white/5 pb-8">
          <div>
            <h1 className="text-3xl font-medium text-white/90">registry</h1>
            <p className="text-sm mt-3 opacity-60">vehicle and billing management workspace</p>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CFCFCF]/40 group-focus-within:text-[#F5A623] transition-colors" />
            <input
              autoFocus
              placeholder="type to filter..."
              className="w-full bg-white/[0.03] text-white pl-12 pr-4 py-3 rounded-md border-transparent outline-none ring-0 placeholder:text-[#CFCFCF]/30 focus:bg-white/5 focus:border-[#F5A623]/20 focus:ring-1 focus:ring-[#F5A623] transition-all font-mono text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="mb-8 font-mono text-red-400 bg-red-900/10 px-4 py-3 rounded-md text-sm w-fit border border-red-900/20">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-md bg-white/[0.02] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {filteredVehicles.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center text-center">
                <TruckIcon className="w-12 h-12 text-[#CFCFCF]/20 mb-6" />
                <p className="font-mono text-sm text-[#CFCFCF]/40">no vehicles found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((v) => (
                  <div
                    key={v.id}
                    className="group relative flex flex-col bg-white/[0.02] rounded-md transition-all hover:bg-white/[0.04] active:scale-[0.99]"
                  >
                    {/* Status Indicator Bar */}
                    <div className={`absolute top-0 left-0 w-full h-[2px] transition-colors ${v.has_billing ? 'bg-[#F5A623]/20 group-hover:bg-[#F5A623]/80' : 'bg-transparent'}`} />

                    <div className="p-8 pb-6 flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-xl font-medium text-white/80 group-hover:text-white transition-colors">
                            {v.make} {v.model}
                          </h2>
                          <div className="flex gap-4 mt-3 font-mono text-xs opacity-60">
                            <span className="flex items-center gap-1.5 hover:text-[#F5A623] transition-colors cursor-default">
                              <CalendarDaysIcon className="w-4 h-4" /> {v.year}
                            </span>
                            <span className="flex items-center gap-1.5 hover:text-[#F5A623] transition-colors cursor-default lowercase">
                              <SwatchIcon className="w-4 h-4" /> {v.color || "n/a"}
                            </span>
                          </div>
                        </div>
                        
                        <span className="font-mono text-xs text-[#F5A623] bg-[#F5A623]/10 px-2 py-1 rounded-sm border border-[#F5A623]/20 flex items-center gap-1">
                          <HashtagIcon className="w-3 h-3" />
                          {v.plate_number}
                        </span>
                      </div>

                      <div className="mt-8 pt-6 border-t border-white/5">
                        <p className="text-sm font-medium text-white/70 mb-2 truncate">
                          {v.customer?.name || "unknown owner"}
                        </p>
                        <div className="flex flex-col gap-2 font-mono text-xs text-[#CFCFCF]/40">
                          {v.customer?.phone && (
                            <span className="flex items-center gap-2">
                              <PhoneIcon className="w-3.5 h-3.5 opacity-60" /> {v.customer.phone}
                            </span>
                          )}
                          {v.customer?.email && (
                            <span className="flex items-center gap-2 truncate">
                              <EnvelopeIcon className="w-3.5 h-3.5 opacity-60" /> {v.customer.email.toLowerCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-8 pt-0 mt-auto">
                      {v.has_billing ? (
                        <button
                          onClick={() => router.push(`/admin/vehicles/${v.id}/billing`)}
                          className="w-full flex items-center justify-between py-3 px-4 font-mono text-xs text-[#F5A623] bg-transparent border border-[#F5A623]/20 rounded-md hover:bg-[#F5A623] hover:text-black transition-all outline-none focus-visible:ring-1 focus-visible:ring-[#F5A623]"
                        >
                          <span className="flex items-center gap-2">
                            <BanknotesIcon className="w-4 h-4" />
                            billing active
                          </span>
                          <ChevronRightIcon className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmVehicle(v)}
                          disabled={checkingBilling[v.id]}
                          className="w-full flex items-center justify-between py-3 px-4 font-mono text-xs text-white/40 bg-white/[0.02] border border-transparent rounded-md hover:text-white hover:bg-white/[0.05] hover:border-white/10 transition-all outline-none focus-visible:ring-1 focus-visible:ring-white/30 disabled:opacity-50"
                        >
                          <span className="flex items-center gap-2">
                            <PlusIcon className="w-4 h-4 opacity-70" />
                            {checkingBilling[v.id] ? "starting..." : "start billing"}
                          </span>
                          <ChevronRightIcon className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={!!confirmVehicle} onOpenChange={(open) => !open && setConfirmVehicle(null)}>
        <DialogContent className="bg-[#0B0B0B] border-white/5 text-[#CFCFCF]/60 sm:max-w-md rounded-md p-8 shadow-2xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-xl font-medium text-white/90">start billing</DialogTitle>
            <DialogDescription className="sr-only">
              Initialize a new billing cycle for the selected vehicle.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <p className="text-sm">
              initialize a new billing cycle. this action creates a permanent registry record.
            </p>
            
            <div className="bg-white/[0.02] rounded-md p-6 font-mono text-sm space-y-4">
              <div className="flex justify-between items-center text-white/50">
                <span>vehicle</span>
                <span className="text-white/90">{confirmVehicle?.make?.toLowerCase()} {confirmVehicle?.model?.toLowerCase()}</span>
              </div>
              <div className="flex justify-between items-center text-white/50">
                <span>plate</span>
                <span className="text-[#F5A623]">{confirmVehicle?.plate_number}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-10 sm:justify-between items-center">
            <button 
              onClick={() => setConfirmVehicle(null)}
              className="font-mono text-xs text-white/30 hover:text-white/60 transition-colors py-2 outline-none"
            >
              escape to cancel
            </button>
            <button 
              onClick={() => confirmVehicle && startBilling(confirmVehicle.id)}
              disabled={confirmVehicle ? checkingBilling[confirmVehicle.id] : false}
              className="font-mono text-xs bg-[#F5A623] text-black px-6 py-2.5 rounded-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0B]"
            >
              {confirmVehicle && checkingBilling[confirmVehicle.id] ? "processing..." : "confirm"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

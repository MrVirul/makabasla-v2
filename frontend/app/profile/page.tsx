"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";
import NavBar from "@/components/NavBar";
import {
  CheckBadgeIcon,
  XMarkIcon,
  PencilIcon,
  CheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/profile/dialog";

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  color: string;
  plate_number: string;
}

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
}

interface Advance {
  id: string;
  date: string;
  description: string;
  amount: number;
}

interface BillingData {
  id: string;
  vehicle_id: number;
  expenses: Expense[];
  advances: Advance[];
  total_expenses: number;
  total_advances: number;
  balance_due: number;
}

interface CustomerProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  vehicles: Vehicle[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedPhone, setEditedPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const [billings, setBillings] = useState<Record<number, BillingData>>({});
  const [billingVehicleId, setBillingVehicleId] = useState<number | null>(null);
  const [isBillingOpen, setIsBillingOpen] = useState(false);

  const API_BASE = "http://127.0.0.1:8080/api/auth/api/v1";
  const userId = session?.user?.id || (session?.user as any)?.sub;
  const accessToken = (session as any)?.accessToken;
  const hasSyncedRef = useRef(false);

  const fetchVehicleBilling = useCallback(async (vehicleId: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8080/api/billing/${vehicleId}`);
      if (res.ok) {
        const data = await res.json();
        setBillings((prev) => ({ ...prev, [vehicleId]: data }));
      }
    } catch (err) {
      console.error(`failed to fetch billing for vehicle ${vehicleId}`, err);
    }
  }, []);

  const fetchProfile = useCallback(
    async (forced: boolean = false) => {
      if (!userId) return;
      if (hasSyncedRef.current && !forced) return;

      try {
        setLoading(true);
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const roles = (session as any)?.roles || [];
        let userRole = "CUSTOMER";
        if (roles.includes("super_admin") || roles.includes("admin")) {
          userRole = "ADMIN";
        } else if (roles.includes("staff")) {
          userRole = "STAFF";
        }

        const syncRes = await fetch(`${API_BASE}/profile`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            id: userId,
            email: session?.user?.email,
            name: session?.user?.name,
            phone: "", 
            role: userRole,
          }),
        });

        if (!syncRes.ok) throw new Error("failed to sync registry");
        const data = await syncRes.json();
        setProfile(data);
        setEditedPhone(data.phone || "");

        if (data.vehicles && Array.isArray(data.vehicles)) {
          data.vehicles.forEach((v: Vehicle) => fetchVehicleBilling(v.id));
        }

        hasSyncedRef.current = true;
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.email, session?.user?.name, session as any, userId, accessToken],
  );

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, fetchProfile]);

  const handleUpdateProfile = async () => {
    if (!accessToken || !userId) return;
    setSaving(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const res = await fetch(`${API_BASE}/profile`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          id: userId,
          email: session?.user?.email,
          name: session?.user?.name,
          phone: editedPhone,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setIsEditing(false);
      } else {
        setError("update rejected. " + res.statusText);
      }
    } catch (err: any) {
      setError("system error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-8 h-8 border-2 border-[#1A1A1A] border-t-[#F5A623] rounded-full animate-spin" />
          <p className="font-mono text-[9px] text-[#646669] uppercase tracking-widest">establishing uplink...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#D1D0C5] font-sans selection:bg-[#F5A623]/20 selection:text-white">
      <NavBar />

      <main className="pt-32 px-12 max-w-[1240px] mx-auto pb-32">
        {error && (
          <div className="font-mono text-xs text-[#ca4754] bg-[#ca4754]/10 border border-[#ca4754]/20 p-4 rounded-sm mb-12 flex justify-between items-center">
            <span>system error: {error}</span>
            <button onClick={() => setError(null)} className="text-[#ca4754]/60 hover:text-[#ca4754]">
              <XMarkIcon className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        )}

        {/* Identity Section */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8 border-b border-[#1A1A1A] pb-8">
            <div>
              <h1 className="text-3xl font-medium tracking-tight mb-2">
                identity map
              </h1>
              <p className="font-mono text-xs text-[#646669] uppercase tracking-widest">
                user metrics and allocation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 bg-[#1A1A1A] rounded-sm flex items-center justify-center text-[#F5A623] text-2xl font-mono font-medium uppercase border-b-2 border-transparent">
                   {session?.user?.name?.charAt(0) || "U"}
                 </div>
                 <div className="flex flex-col">
                   <h2 className="text-xl font-medium">{profile?.name || session?.user?.name}</h2>
                   <span className="flex items-center gap-2 mt-2 text-[#646669] font-mono text-xs uppercase tracking-widest">
                     <CheckBadgeIcon className="w-4 h-4 stroke-[1.5] text-[#D1D0C5]" /> active node
                   </span>
                 </div>
              </div>
            </div>

            <div className="flex flex-col gap-8 flex-1 justify-center">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] text-[#646669] uppercase tracking-widest flex items-center gap-2">
                  communication link
                </span>
                <p className="font-mono text-sm tracking-tight text-[#D1D0C5]">
                  {profile?.email || session?.user?.email}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] text-[#646669] uppercase tracking-widest flex items-center gap-2">
                  comm. device
                </span>
                {isEditing ? (
                  <div className="flex items-center gap-2 max-w-[240px]">
                    <input
                      autoFocus
                      value={editedPhone}
                      onChange={(e) => {
                        const val = e.target.value.replaceAll(/\D/g, "");
                        if (val.length <= 10) setEditedPhone(val);
                      }}
                      maxLength={10}
                      className="bg-[#1A1A1A] w-full font-mono text-sm px-3 py-2 rounded-sm text-[#D1D0C5] focus:outline-none focus:ring-1 focus:ring-[#F5A623] transition-all"
                      placeholder="number..."
                    />
                    <button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="p-2 text-[#646669] hover:text-[#D1D0C5] transition-colors"
                    >
                      {saving ? (
                        <ArrowPathIcon className="w-5 h-5 animate-spin stroke-[1.5]" />
                      ) : (
                        <CheckIcon className="w-5 h-5 stroke-[1.5]" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 text-[#646669] hover:text-[#ca4754] transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 stroke-[1.5]" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 group">
                    <p className="font-mono text-sm text-[#D1D0C5]">
                      {profile?.phone || "unassigned"}
                    </p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[#1A1A1A] group-hover:text-[#646669] hover:!text-[#F5A623] transition-colors"
                    >
                      <PencilIcon className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8 border-b border-[#1A1A1A] pb-8">
            <div>
              <h1 className="text-3xl font-medium tracking-tight mb-2">
                registry telemetry
              </h1>
              <p className="font-mono text-xs text-[#646669] uppercase tracking-widest">
                active assets and financial tracking
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {profile?.vehicles?.length === 0 ? (
              <div className="bg-[#1A1A1A]/30 border border-dashed border-[#1A1A1A] rounded-sm p-16 flex flex-col items-center justify-center text-center">
                <p className="font-mono text-[10px] text-[#646669] uppercase tracking-widest">
                  no assets assigned to this node
                </p>
              </div>
            ) : (
              profile?.vehicles?.map((vehicle) => {
                const billing = billings[vehicle.id];

                return (
                  <div
                    key={vehicle.id}
                    className="bg-[#141414] border-l-2 border-transparent hover:border-[#F5A623]/40 transition-all rounded-sm overflow-hidden"
                  >
                    <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                      <div className="flex items-center gap-6 min-w-[300px]">
                        <div>
                          <h3 className="text-lg font-medium text-[#D1D0C5]">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="font-mono text-[10px] text-[#646669] uppercase tracking-widest mt-1">
                            {vehicle.plate_number} {"//"} {vehicle.year}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-16 gap-y-8 flex-1 max-w-2xl px-4">
                        <div className="flex flex-col gap-2">
                          <span className="font-mono text-[9px] text-[#646669] uppercase tracking-widest flex items-center gap-2">
                            total payments
                          </span>
                          <p className="font-mono text-sm text-[#D1D0C5] tracking-tight">
                            Rs.{" "}
                            {(billing?.total_advances ?? 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="font-mono text-[9px] text-[#646669] uppercase tracking-widest flex items-center gap-2">
                            outstanding balance
                          </span>
                          <p
                            className={`font-mono text-sm tracking-tight ${
                              (billing?.balance_due ?? 0) > 0
                                ? "text-[#F5A623]"
                                : "text-emerald-400"
                            }`}
                          >
                            Rs.{" "}
                            {(billing?.balance_due ?? 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setBillingVehicleId(vehicle.id);
                          setIsBillingOpen(true);
                        }}
                        className="font-mono text-[10px] text-[#646669] hover:text-[#D1D0C5] uppercase tracking-widest flex items-center gap-2 transition-colors lg:border-l lg:border-[#1A1A1A] lg:pl-12 h-14 group"
                      >
                        analyze logs
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Global Billing Dialog */}
        {billingVehicleId !== null && (
          <Dialog open={isBillingOpen} onOpenChange={setIsBillingOpen}>
            <DialogContent className="max-w-4xl bg-[#0B0B0B] border-[#1A1A1A] text-[#D1D0C5] p-0 overflow-hidden">
              <DialogHeader className="p-10 border-b border-[#1A1A1A] bg-[#0B0B0B]">
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-3xl font-medium tracking-tight text-white mb-2">
                      Billing Statement
                    </DialogTitle>
                    <DialogDescription className="font-mono text-[10px] text-[#646669] uppercase tracking-widest">
                      registry node: {profile?.vehicles.find(v => v.id === billingVehicleId)?.make} {profile?.vehicles.find(v => v.id === billingVehicleId)?.model} {"//"} {profile?.vehicles.find(v => v.id === billingVehicleId)?.plate_number}
                    </DialogDescription>
                  </div>
                  <div className="text-right">
                     <p className="font-mono text-[10px] text-[#646669] uppercase tracking-widest">Statement Date</p>
                     <p className="font-mono text-xs text-[#D1D0C5] mt-1">{new Date().toISOString().split('T')[0]}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-16">
                  {/* Expenses Section */}
                  <div className="space-y-8">
                    <div className="flex justify-between items-end border-b border-[#1A1A1A] pb-4">
                       <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[#646669]">Expenses</h4>
                       <div className="text-right">
                          <span className="font-mono text-[9px] text-[#646669] uppercase block mb-1">Total Expenses</span>
                          <span className="text-2xl font-mono text-white">Rs. {(billings[billingVehicleId]?.total_expenses ?? 0).toLocaleString()}</span>
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                      {billings[billingVehicleId]?.expenses?.length > 0 ? (
                        billings[billingVehicleId].expenses.map(e => (
                          <div key={e.id} className="grid grid-cols-[100px_1fr_120px] gap-8 py-4 border-b border-[#1A1A1A]/20 font-mono text-[11px] hover:bg-white/[0.02] px-4 transition-colors">
                            <span className="text-[#646669]">{e.date}</span>
                            <span className="text-[#D1D0C5] uppercase">{e.description}</span>
                            <span className="text-[#D1D0C5] text-right">Rs. {e.amount.toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <p className="font-mono text-[10px] text-[#333] italic text-center py-8">no expenses recorded on this registry</p>
                      )}
                    </div>
                  </div>

                  {/* Payments Section */}
                  <div className="space-y-8">
                    <div className="flex justify-between items-end border-b border-[#1A1A1A] pb-4">
                       <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[#646669]">Payments</h4>
                    </div>
                    
                    <div className="space-y-4">
                      {billings[billingVehicleId]?.advances?.length > 0 ? (
                        billings[billingVehicleId].advances.map(a => (
                          <div key={a.id} className="grid grid-cols-[100px_1fr_120px] gap-8 py-4 border-b border-[#1A1A1A]/20 font-mono text-[11px] hover:bg-white/[0.02] px-4 transition-colors">
                            <span className="text-[#646669]">{a.date}</span>
                            <span className="text-emerald-400/70 uppercase">Payment - {a.description}</span>
                            <span className="text-emerald-400 text-right">Rs. {a.amount.toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <p className="font-mono text-[10px] text-[#333] italic text-center py-8">no payment history found</p>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                       <div className="text-right">
                          <span className="font-mono text-[9px] text-[#646669] uppercase block mb-1">Total Payments</span>
                          <span className="text-2xl font-mono text-emerald-400">Rs. {(billings[billingVehicleId]?.total_advances ?? 0).toLocaleString()}</span>
                       </div>
                    </div>
                  </div>

                  {/* Final Balance Settle */}
                  <div className="pt-12 mt-12 border-t-2 border-[#1A1A1A] flex justify-between items-center bg-[#141414]/50 p-8 rounded-sm">
                     <div>
                        <h5 className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#646669]">Outstanding Balance</h5>
                        <p className="font-mono text-[9px] text-[#333] uppercase mt-1 italic font-medium">Final adjustment telemetry</p>
                     </div>
                     <p className={`text-4xl font-mono tracking-tighter ${(billings[billingVehicleId]?.balance_due ?? 0) > 0 ? "text-[#F5A623]" : "text-emerald-400"}`}>
                        Rs. {(billings[billingVehicleId]?.balance_due ?? 0).toLocaleString()}
                     </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

      </main>
    </div>
  );
}

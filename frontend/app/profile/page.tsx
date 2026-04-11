"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import {
  CheckBadgeIcon,
  XMarkIcon,
  PencilIcon,
  CheckIcon,
  ArrowPathIcon,
  PlusIcon,
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
  image_url: string;
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
  image_url: string;
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

  const [mounted, setMounted] = useState(false);
  
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    plate_number: "",
    image_url: ""
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            image: session?.user?.image,
          }),
        });

        if (!syncRes.ok) throw new Error("failed to sync profile");
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
    [session?.user?.email, session?.user?.name, session?.user?.image, session as any, userId, accessToken],
  );

  const handleImageUpload = async (file: File, type: "profile" | "vehicle", vehicleId?: number) => {
    if (!userId) return;
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError("Cloudinary configuration missing in .env.local");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!cloudRes.ok) throw new Error("Cloudinary upload failed");
      const cloudData = await cloudRes.json();
      const imageUrl = cloudData.secure_url;

      // Update backend
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      if (type === "profile") {
        const res = await fetch(`${API_BASE}/profile`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            id: userId,
            email: session?.user?.email,
            name: session?.user?.name,
            phone: profile?.phone || "",
            image: imageUrl,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } else if (type === "vehicle" && vehicleId) {
        // Vehicle image update logic - usually we'd have a specific vehicle update endpoint
        // For now, I'll update the profile which should sync vehicles if the backend supports it
        // Or if there's a specific vehicle endpoint, use that. 
        // Let's assume there's a POST /vehicle update or we just re-fetch profile.
        const res = await fetch(`${API_BASE}/vehicle`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            id: vehicleId,
            image_url: imageUrl,
            customer_id: userId
          }),
        });
        if (res.ok) {
          fetchProfile(true);
        }
      }
    } catch (err: any) {
      setError("upload error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatPhoneNumber = (phone: string | null | undefined) => {
    if (!phone) return "unassigned";
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return phone;
  };

  const handleAddVehicle = async () => {
    if (!userId) return;
    setAdding(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const res = await fetch(`http://127.0.0.1:8080/api/auth/api/v1/vehicle`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...newVehicle,
          customer_id: userId
        }),
      });

      if (res.ok) {
        setIsAddVehicleOpen(false);
        setNewVehicle({
          make: "",
          model: "",
          year: new Date().getFullYear(),
          color: "",
          plate_number: "",
          image_url: ""
        });
        fetchProfile(true);
      } else {
        const data = await res.json();
        setError("failed to add vehicle: " + (data.message || res.statusText));
      }
    } catch (err: any) {
      setError("system error: " + err.message);
    } finally {
      setAdding(false);
    }
  };

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
          image: session?.user?.image,
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
          <p className="font-mono text-[9px] text-[#A1A1A1] uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  const sImage = session?.user?.image;
  const pImage = profile?.image_url;
  
  let userImage: string | null = null;
  if (sImage && sImage !== "null" && sImage !== "") {
    userImage = sImage;
  } else if (pImage && pImage !== "null" && pImage !== "") {
    userImage = pImage;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#D1D0C5] font-sans selection:bg-[#F5A623]/20 selection:text-white">
      <NavBar />

      <main className="pt-32 px-12 max-w-[1240px] mx-auto pb-32">
        {error && (
          <div className="font-mono text-xs text-[#ca4754] bg-[#ca4754]/10 border border-[#ca4754]/20 p-4 rounded-sm mb-12 flex justify-between items-center">
            <span>Error: {error}</span>
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
                User Profile
              </h1>
              <p className="font-mono text-xs text-[#A1A1A1] uppercase tracking-widest">
                Your account information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-[#1A1A1A] rounded-sm flex items-center justify-center text-[#F5A623] text-2xl font-mono font-medium uppercase border-b-2 border-transparent overflow-hidden relative group cursor-pointer">
                    {mounted && userImage ? (
                      <Image
                        src={userImage}
                        alt={profile?.name || session?.user?.name || "User profile image"}
                        fill
                        className="object-cover group-hover:opacity-50 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      (profile?.name || session?.user?.name || "U").charAt(0)
                    )}
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, "profile");
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <PencilIcon className="w-5 h-5 text-white stroke-[2]" />
                    </div>
                  </div>
                 <div className="flex flex-col">
                   <h2 className="text-xl font-medium">{profile?.name || session?.user?.name}</h2>
                   <span className="flex items-center gap-2 mt-2 text-[#F5A623] font-mono text-xs uppercase tracking-widest">
                     <CheckBadgeIcon className="w-4 h-4 stroke-[1.5] text-[#F5A623]" /> active user
                   </span>
                 </div>
              </div>
            </div>

            <div className="flex flex-col gap-8 flex-1 justify-center">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] text-[#D1D0C5] tracking-widest flex items-center gap-2">
                  E-mail
                </span>
                <p className="font-mono text-sm tracking-tight text-[#F5A623]">
                  {profile?.email || session?.user?.email}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] text-[#A1A1A1] tracking-widest flex items-center gap-2">
                  Phone Number
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
                      className="bg-[#1A1A1A] w-full font-mono text-sm px-3 py-2 rounded-sm text-[#F5A623] focus:outline-none focus:ring-1 focus:ring-[#D1D0C5] transition-all"
                      placeholder="number..."
                    />
                    <button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="p-2 text-[#F5A623] hover:text-[#D1D0C5] transition-colors"
                    >
                      {saving ? (
                        <ArrowPathIcon className="w-5 h-5 animate-spin stroke-[1.5]" />
                      ) : (
                        <CheckIcon className="w-5 h-5 stroke-[1.5]" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 text-[#A1A1A1] hover:text-[#ca4754] transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 stroke-[1.5]" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 group">
                    <p className="font-mono text-sm text-[#F5A623]">
                      {formatPhoneNumber(profile?.phone)}
                    </p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-white hover:text-[#F5A623] transition-colors"
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
                Your Vehicles
              </h1>
              <p className="font-mono text-xs text-[#D1D0C5] tracking-widest">
                Track your vehicle repairs and expenses
              </p>
            </div>
            <button
              onClick={() => setIsAddVehicleOpen(true)}
              className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 hover:border-[#F5A623]/30 transition-all font-mono text-[10px] uppercase tracking-widest text-[#D1D0C5] group"
            >
              <PlusIcon className="w-4 h-4 group-hover:text-[#F5A623] transition-colors" />
              Add a New Vehicle
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {profile?.vehicles?.length === 0 ? (
              <div className="bg-[#1A1A1A]/30 border border-dashed border-[#1A1A1A] rounded-sm p-16 flex flex-col items-center justify-center text-center">
                <p className="font-mono text-[10px] text-[#A1A1A1] uppercase tracking-widest">
                  No vehicles registered to your account
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
                        <div className="w-16 h-16 bg-[#0B0B0B] rounded-sm border border-[#1A1A1A] overflow-hidden relative group cursor-pointer">
                          {vehicle.image_url ? (
                            <Image
                              src={vehicle.image_url}
                              alt={vehicle.make}
                              fill
                              className="object-cover group-hover:opacity-40 transition-opacity"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#A1A1A1]">
                              <ArrowPathIcon className="w-5 h-5 stroke-[1.5]" />
                            </div>
                          )}
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, "vehicle", vehicle.id);
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-[#D1D0C5]">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="font-mono text-[10px] text-[#A1A1A1] uppercase tracking-widest mt-1">
                            {vehicle.plate_number} {"//"} {vehicle.year}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-16 gap-y-8 flex-1 max-w-2xl px-4">
                        <div className="flex flex-col gap-2">
                          <span className="font-mono text-[9px] text-[#A1A1A1] uppercase tracking-widest flex items-center gap-2">
                            total payments
                          </span>
                          <p className="font-mono text-sm text-[#D1D0C5] tracking-tight">
                            Rs.{" "}
                            {(billing?.total_advances ?? 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="font-mono text-[9px] text-[#A1A1A1] uppercase tracking-widest flex items-center gap-2">
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
                        className="font-mono text-[10px] text-[#A1A1A1] hover:text-[#D1D0C5] uppercase tracking-widest flex items-center gap-2 transition-colors lg:border-l lg:border-[#1A1A1A] lg:pl-12 h-14 group"
                      >
                        View Full Statement
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
                    <DialogDescription className="font-mono text-[10px] text-[#A1A1A1] uppercase tracking-widest">
                      Vehicle: {profile?.vehicles.find(v => v.id === billingVehicleId)?.make} {profile?.vehicles.find(v => v.id === billingVehicleId)?.model} {"//"} {profile?.vehicles.find(v => v.id === billingVehicleId)?.plate_number}
                    </DialogDescription>
                  </div>
                  <div className="text-right">
                     <p className="font-mono text-[10px] text-[#A1A1A1] uppercase tracking-widest">Statement Date</p>
                     <p className="font-mono text-xs text-[#D1D0C5] mt-1">{new Date().toISOString().split('T')[0]}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-16">
                  {/* Expenses Section */}
                  <div className="space-y-8">
                    <div className="flex justify-between items-end border-b border-[#1A1A1A] pb-4">
                       <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[#A1A1A1]">Expenses</h4>
                       <div className="text-right">
                          <span className="font-mono text-[9px] text-[#A1A1A1] uppercase block mb-1">Total Expenses</span>
                          <span className="text-2xl font-mono text-white">Rs. {(billings[billingVehicleId!]?.total_expenses ?? 0).toLocaleString()}</span>
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                      {billings[billingVehicleId!]?.expenses?.length > 0 ? (
                        billings[billingVehicleId!].expenses.map((e: any) => (
                          <div key={e.id} className="grid grid-cols-[100px_1fr_120px] gap-8 py-4 border-b border-[#1A1A1A]/20 font-mono text-[11px] hover:bg-white/[0.02] px-4 transition-colors">
                            <span className="text-[#A1A1A1]">{e.date}</span>
                            <span className="text-[#D1D0C5] uppercase">{e.description}</span>
                            <span className="text-[#D1D0C5] text-right">Rs. {e.amount.toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <p className="font-mono text-[10px] text-[#666] italic text-center py-8">No expenses recorded yet</p>
                      )}
                    </div>
                  </div>

                  {/* Payments Section */}
                  <div className="space-y-8">
                    <div className="flex justify-between items-end border-b border-[#1A1A1A] pb-4">
                       <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[#A1A1A1]">Payments</h4>
                    </div>
                    
                    <div className="space-y-4">
                      {billings[billingVehicleId!]?.advances?.length > 0 ? (
                        billings[billingVehicleId!].advances.map((a: any) => (
                          <div key={a.id} className="grid grid-cols-[100px_1fr_120px] gap-8 py-4 border-b border-[#1A1A1A]/20 font-mono text-[11px] hover:bg-white/[0.02] px-4 transition-colors">
                            <span className="text-[#A1A1A1]">{a.date}</span>
                            <span className="text-emerald-400/70 uppercase">Payment - {a.description}</span>
                            <span className="text-emerald-400 text-right">Rs. {a.amount.toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <p className="font-mono text-[10px] text-[#666] italic text-center py-8">no payment history found</p>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                       <div className="text-right">
                          <span className="font-mono text-[9px] text-[#A1A1A1] uppercase block mb-1">Total Payments</span>
                          <span className="text-2xl font-mono text-emerald-400">Rs. {(billings[billingVehicleId!]?.total_advances ?? 0).toLocaleString()}</span>
                       </div>
                    </div>
                  </div>

                  {/* Final Balance Settle */}
                  <div className="pt-12 mt-12 border-t-2 border-[#1A1A1A] flex justify-between items-center bg-[#141414]/50 p-8 rounded-sm">
                     <div>
                        <h5 className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#A1A1A1]">Outstanding Balance</h5>
                        <p className="font-mono text-[9px] text-[#666] uppercase mt-1 italic font-medium">Monthly total</p>
                     </div>
                     <p className={`text-4xl font-mono tracking-tighter ${(billings[billingVehicleId!]?.balance_due ?? 0) > 0 ? "text-[#F5A623]" : "text-emerald-400"}`}>
                        Rs. {(billings[billingVehicleId!]?.balance_due ?? 0).toLocaleString()}
                     </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Vehicle Dialog */}
        <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
          <DialogContent className="max-w-xl bg-[#0B0B0B] border-[#1A1A1A] text-[#D1D0C5] p-0 overflow-hidden shadow-2xl">
            <DialogHeader className="p-8 border-b border-[#1A1A1A] bg-[#0B0B0B]">
              <DialogTitle className="text-2xl font-medium tracking-tight text-white mb-2">
                Add a New Vehicle
              </DialogTitle>
              <p className="font-mono text-[10px] text-[#A1A1A1] uppercase tracking-widest">
                Register a new vehicle to your account
              </p>
            </DialogHeader>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-mono text-[9px] text-[#A1A1A1] uppercase tracking-widest">Make</label>
                  <input
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-transparent focus:border-[#F5A623]/30 px-4 py-3 rounded-sm font-mono text-xs outline-none transition-all"
                    placeholder="e.g. Toyota"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[9px] text-[#A1A1A1] uppercase tracking-widest">Model</label>
                  <input
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-transparent focus:border-[#F5A623]/30 px-4 py-3 rounded-sm font-mono text-xs outline-none transition-all"
                    placeholder="e.g. Camry"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[9px] text-[#A1A1A1] uppercase tracking-widest">Year</label>
                  <input
                    type="number"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                    className="w-full bg-[#1A1A1A] border border-transparent focus:border-[#F5A623]/30 px-4 py-3 rounded-sm font-mono text-xs outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[9px] text-[#A1A1A1] uppercase tracking-widest">Plate Number</label>
                  <input
                    value={newVehicle.plate_number}
                    onChange={(e) => setNewVehicle({ ...newVehicle, plate_number: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-transparent focus:border-[#F5A623]/30 px-4 py-3 rounded-sm font-mono text-xs outline-none transition-all"
                    placeholder="ABC-1234"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[9px] text-[#A1A1A1] uppercase tracking-widest">Vehicle Image (Link or Upload)</label>
                <div className="flex gap-4">
                  <input
                    value={newVehicle.image_url}
                    onChange={(e) => setNewVehicle({ ...newVehicle, image_url: e.target.value })}
                    className="flex-1 bg-[#1A1A1A] border border-transparent focus:border-[#F5A623]/30 px-4 py-3 rounded-sm font-mono text-xs outline-none transition-all"
                    placeholder="https://..."
                  />
                  <div className="relative group">
                    <button className="px-6 h-full bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-all font-mono text-[10px] uppercase tracking-widest">
                      Upload
                    </button>
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAdding(true);
                          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                          const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
                          if (cloudName && uploadPreset) {
                            const formData = new FormData();
                            formData.append("file", file);
                            formData.append("upload_preset", uploadPreset);
                            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                              method: "POST",
                              body: formData,
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setNewVehicle({ ...newVehicle, image_url: data.secure_url });
                            }
                          }
                          setAdding(false);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-[#1A1A1A] flex justify-end gap-6">
              <button
                onClick={() => setIsAddVehicleOpen(false)}
                className="font-mono text-[10px] text-[#A1A1A1] hover:text-[#D1D0C5] uppercase tracking-widest transition-colors"
                disabled={adding}
              >
                Cancel
              </button>
              <button
                onClick={handleAddVehicle}
                disabled={adding}
                className="flex items-center gap-2 px-8 py-3 bg-[#D1D0C5] text-[#0B0B0B] font-mono text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-white transition-all disabled:opacity-50"
              >
                {adding ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : null}
                Save Vehicle
              </button>
            </div>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
  }
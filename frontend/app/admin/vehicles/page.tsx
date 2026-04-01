"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Car,
  Phone,
  Mail,
  Calendar,
  Palette,
  Search,
  Hash,
  Receipt,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/profile/input";
import { Button } from "@/components/ui/profile/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/profile/card";
import { Badge } from "@/components/ui/profile/badge";
import { Skeleton } from "@/components/ui/profile/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/profile/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/profile/dialog";
import { Label } from "@/components/ui/profile/label";

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
    // Wait for the session to be loaded.
    if (status === "loading") return;

    if (status === "unauthenticated") {
      setError("You must be logged in to view this page.");
      setLoading(false);
      return;
    }

    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

        const res = await fetch(`${API_BASE}/vehicles`, { headers });
        if (!res.ok) throw new Error("Failed to fetch vehicles");
        const data: Vehicle[] = await res.json();
        
        // After fetching vehicles, check billing status for each
        const vehiclesWithBilling = await Promise.all(
          data.map(async (v) => {
            try {
              const bRes = await fetch(`${BILLING_BASE}/${v.id}`);
              return { ...v, has_billing: bRes.ok };
            } catch {
              return { ...v, has_billing: false };
            }
          })
        );

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
      if (!res.ok) throw new Error("Failed to start billing");
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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className="h-56 w-full rounded-[1.5rem] bg-white/5 border border-white/5"
            />
          ))}
        </div>
      );
    }

    if (filteredVehicles.length === 0) {
      return (
        <div className="glass border-dashed border-white/10 py-20 rounded-[2rem] flex flex-col items-center justify-center text-gray-500">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Car className="opacity-20 w-8 h-8" />
          </div>
          <p className="text-sm font-medium text-[#CFCFCF]/60">
            No vehicles found.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((v) => (
          <Card
            key={v.id}
            className="glass border-white/5 bg-transparent overflow-hidden hover:border-[#F5A623]/30 hover:bg-white/[0.02] transition-all group"
          >
            <CardHeader className="pb-3 border-b border-white/5 bg-black/20">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    {v.make} {v.model}
                  </CardTitle>
                  <div className="flex gap-3 mt-1.5 opacity-60">
                    <span className="flex items-center gap-1 text-xs">
                      <Calendar size={12} /> {v.year}
                    </span>
                    <span className="flex items-center gap-1 text-xs uppercase">
                      <Palette size={12} /> {v.color || "N/A"}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20 font-mono text-[11px] tracking-tight px-2 py-0.5 rounded-md"
                >
                  <Hash size={10} className="mr-1 inline-block -mt-0.5" />
                  {v.plate_number}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-5">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-white/10 bg-[#1A1A1A]">
                  <AvatarFallback className="text-[#F5A623] font-bold text-sm bg-transparent">
                    {v.customer?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {v.customer?.name || "Unknown Owner"}
                  </p>
                  <div className="flex items-center gap-3 mt-1 opacity-50">
                    {v.customer?.phone && (
                      <span className="flex items-center gap-1 text-[10px]">
                        <Phone size={10} /> {v.customer.phone}
                      </span>
                    )}
                    {v.customer?.email && (
                      <span className="flex items-center gap-1 text-[10px] truncate">
                        <Mail size={10} /> {v.customer.email.split("@")[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-5 px-6">
              {v.has_billing ? (
                <Button
                  variant="outline"
                  className="w-full bg-[#F5A623]/5 border-[#F5A623]/20 text-[#F5A623] hover:bg-[#F5A623] hover:text-black transition-all font-bold rounded-xl h-11 group/btn"
                  onClick={() => router.push(`/admin/vehicles/${v.id}/billing`)}
                >
                  <Receipt size={16} className="mr-2" />
                  View Billing
                  <ChevronRight size={14} className="ml-auto opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full bg-white/5 border-white/10 text-white/60 hover:bg-[#F5A623] hover:text-black hover:border-[#F5A623] transition-all font-bold rounded-xl h-11 group/btn"
                  onClick={() => setConfirmVehicle(v)}
                  disabled={checkingBilling[v.id]}
                >
                  <Plus size={16} className="mr-2" />
                  {checkingBilling[v.id] ? "Starting..." : "Start Billing"}
                  <ChevronRight size={14} className="ml-auto opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}

        <Dialog open={!!confirmVehicle} onOpenChange={(open) => !open && setConfirmVehicle(null)}>
          <DialogContent className="bg-[#1A1A1A] border-white/10 text-white sm:max-w-md rounded-[2.5rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <Receipt className="text-[#F5A623]" /> Confirm Billing Initialization
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 space-y-6">
              <p className="text-[#CFCFCF]/60">
                Are you sure you want to start a new billing lifecycle for this vehicle? This will create a permanent registry entry.
              </p>
              
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold tracking-widest text-[#CFCFCF]/30">Vehicle</span>
                  <span className="text-sm font-bold text-white">{confirmVehicle?.make} {confirmVehicle?.model} ({confirmVehicle?.year})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold tracking-widest text-[#CFCFCF]/30">Plate Number</span>
                  <span className="text-sm font-mono font-bold text-[#F5A623]">{confirmVehicle?.plate_number}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-1">
                  <span className="text-xs uppercase font-bold tracking-widest text-[#CFCFCF]/30">Owner</span>
                  <span className="text-sm font-bold text-white/80">{confirmVehicle?.customer?.name}</span>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setConfirmVehicle(null)}
                className="rounded-xl h-12 text-white/40 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => confirmVehicle && startBilling(confirmVehicle.id)}
                disabled={confirmVehicle ? checkingBilling[confirmVehicle.id] : false}
                className="bg-[#F5A623] hover:bg-[#D48B0E] text-black font-bold rounded-xl h-12 px-8 transition-all"
              >
                {confirmVehicle && checkingBilling[confirmVehicle.id] ? "Processing..." : "Confirm & Start"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Vehicle Registry
          </h1>
          <p className="text-[#CFCFCF]/60 mt-1">
            Manage and view all customer vehicles in the system.
          </p>
        </div>

        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CFCFCF]/40 group-focus-within:text-[#F5A623] transition-colors" />
          <Input
            placeholder="Search by plate, make, owner..."
            className="pl-9 bg-white/5 border-white/10 rounded-xl focus:border-[#F5A623]/50 focus:ring-[#F5A623]/20 h-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 font-medium">
          <span className="bg-red-500/20 p-1.5 rounded-lg">!</span> {error}
        </div>
      )}

      {renderContent()}

      <style jsx global>{`
        .glass {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
      `}</style>
    </div>
  );
}

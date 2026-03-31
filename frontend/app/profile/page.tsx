"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";
import NavBar from "@/components/NavBar";
import {
  Phone,
  Car,
  Mail,
  CheckCircle,
  Plus,
  Loader2,
  Edit2,
  Save,
  X,
  Calendar,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/profile/button";
import { Input } from "@/components/ui/profile/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/profile/card";
import { Badge } from "@/components/ui/profile/badge";
import { Skeleton } from "@/components/ui/profile/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/profile/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/profile/avatar";
import { Label } from "@/components/ui/profile/label";

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  color: string;
  plate_number: string;
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

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editedPhone, setEditedPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // Vehicle Dialog State
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    plate_number: "",
  });

  // Use 127.0.0.1 to avoid localhost IPv6 resolution issues on Mac
  const API_BASE = "http://127.0.0.1:8080/api/auth/api/v1";

  // Safely get user ID and token from session
  const userId = session?.user?.id || (session?.user as any)?.sub;
  const accessToken = (session as any)?.accessToken;

  // Use a ref to prevent re-fetching when typing in editedPhone
  const hasSyncedRef = useRef(false);

  const fetchProfile = useCallback(
    async (forced: boolean = false) => {
      if (!userId || !accessToken) return;

      // Don't re-sync automatically if we already have a session, unless forced
      if (hasSyncedRef.current && !forced) return;

      try {
        setLoading(true);
        console.log("Fetching profile for:", userId);

        const syncRes = await fetch(`${API_BASE}/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            id: userId,
            email: session?.user?.email,
            name: session?.user?.name,
            phone: "", // Don't send edited phone during auto-load sync
          }),
        });

        if (!syncRes.ok) throw new Error("Failed to sync profile");
        const data = await syncRes.json();
        console.log("Profile data received:", data);
        setProfile(data);
        setEditedPhone(data.phone || "");
        hasSyncedRef.current = true;
      } catch (err: any) {
        console.error("Fetch profile error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.email, session?.user?.name, userId, accessToken],
  );

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, fetchProfile]);

  const handleUpdateProfile = async () => {
    if (!accessToken || !userId) return;
    setSaving(true);
    console.log("Saving phone number:", editedPhone);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: userId,
          email: session?.user?.email,
          name: session?.user?.name,
          phone: editedPhone,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Phone updated:", data.phone);
        setProfile(data);
        setIsEditing(false);
      } else {
        const errText = await res.text();
        console.error("Update failed:", errText);
        setError("Update failed: " + res.statusText);
      }
    } catch (err: any) {
      console.error("Save error:", err);
      setError("Network Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!accessToken || !userId) return;
    console.log("Submitting new vehicle...");
    try {
      const res = await fetch(`${API_BASE}/vehicle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...newVehicle,
          year: Number(newVehicle.year),
          customer_id: userId,
        }),
      });
      if (res.ok) {
        console.log("Vehicle Added!");
        setIsVehicleDialogOpen(false);
        setNewVehicle({
          make: "",
          model: "",
          year: new Date().getFullYear(),
          color: "",
          plate_number: "",
        });
        fetchProfile(true); // Force refresh list
      } else {
        const errText = await res.text();
        console.error("Failed to add vehicle:", errText);
      }
    } catch (err) {
      console.error("Network error adding vehicle:", err);
    }
  };

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <h1 className="text-2xl font-bold mb-4">You are not logged in</h1>
        <p className="text-gray-400 mb-8">
          Please sign in to view your profile.
        </p>
        <Button
          onClick={() => (globalThis.location.href = "/login")}
          className="bg-[#F5A623] hover:bg-[#D48F1E] text-black font-bold"
        >
          Sign In
        </Button>
      </div>
    );
  }

  const renderVehicles = () => {
    if (loading) {
      return [1, 2].map((i) => (
        <Skeleton key={i} className="h-40 w-full rounded-3xl bg-white/5" />
      ));
    }

    if (profile?.vehicles && profile.vehicles.length > 0) {
      return profile.vehicles.map((v) => (
        <Card
          key={v.id}
          className="glass border-white/5 bg-transparent group hover:border-[#F5A623]/40 hover:bg-white/[0.02] transition-all cursor-pointer"
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-[#F5A623]/10 rounded-xl text-[#F5A623] group-hover:scale-110 transition-transform">
                <Car size={20} />
              </div>
              <Badge
                variant="secondary"
                className="bg-white/5 font-mono text-[10px] tracking-tighter"
              >
                {v.plate_number}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-bold">
              {v.make} {v.model}
            </h3>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar size={12} /> {v.year}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 uppercase">
                <Palette size={12} /> {v.color || "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      ));
    }

    return (
      <div className="col-span-2 glass border-dashed border-white/10 py-16 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-500">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Car className="opacity-20" size={32} />
        </div>
        <p className="text-sm">No vehicles found in your garage.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <NavBar />

      <main className="pt-32 px-6 max-w-6xl mx-auto pb-24">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-8 flex justify-between items-center">
            <p>Error: {error}</p>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              My Profile
            </h1>
            <p className="text-gray-400">
              Manage your account and registered vehicles.
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-[#F5A623]/30 text-[#F5A623] bg-[#F5A623]/5 px-3 py-1"
          >
            Registered Customer
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <Card className="glass border-white/5 bg-transparent overflow-hidden">
              <CardHeader className="relative pb-0 text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5A623]/10 blur-3xl -z-10" />
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24 border-2 border-[#F5A623]/20">
                    <AvatarImage
                      src={session?.user?.image || ""}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="bg-[#1A1A1A] text-[#F5A623] text-2xl font-bold">
                      {session?.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      {profile?.name || session?.user?.name}
                    </CardTitle>
                    <CardDescription className="flex items-center justify-center gap-1 mt-1 text-green-500 font-medium">
                      <CheckCircle size={14} /> Verified via Google
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-8">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
                    <Mail size={12} /> Email Address
                  </Label>
                  <p className="text-sm font-medium">
                    {profile?.email || session?.user?.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
                    <Phone size={12} /> Phone Contact
                  </Label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        value={editedPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 10) {
                            setEditedPhone(val);
                          }
                        }}
                        maxLength={10}
                        className="bg-black/50 border-white/10 h-9"
                        placeholder="0712345678"
                      />
                      <Button
                        size="icon"
                        className="h-9 w-9 bg-green-600 hover:bg-green-700"
                        onClick={handleUpdateProfile}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <p className="text-sm font-medium">
                        {profile?.phone || "Add phone number"}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 size={12} />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Car className="text-[#F5A623]" /> Vehicles
              </h2>

              <Dialog
                open={isVehicleDialogOpen}
                onOpenChange={setIsVehicleDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-[#F5A623] hover:bg-[#D48F1E] text-black font-bold rounded-xl h-10 px-6 active:scale-95 transition-all">
                    <Plus className="w-4 h-4 mr-2" /> Add Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1A1A1A] border-white/10 text-white sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Vehicle</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Enter the details of your vehicle to register it.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="make" className="text-right text-sm">
                        Make
                      </Label>
                      <Input
                        id="make"
                        value={newVehicle.make}
                        onChange={(e) =>
                          setNewVehicle({ ...newVehicle, make: e.target.value })
                        }
                        placeholder="Toyota"
                        className="col-span-3 bg-black border-white/10"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="model" className="text-right text-sm">
                        Model
                      </Label>
                      <Input
                        id="model"
                        value={newVehicle.model}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            model: e.target.value,
                          })
                        }
                        placeholder="Prius"
                        className="col-span-3 bg-black border-white/10"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="year" className="text-right text-sm">
                        Year
                      </Label>
                      <Input
                        id="year"
                        type="number"
                        value={newVehicle.year}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            year: Number.parseInt(e.target.value, 10),
                          })
                        }
                        placeholder="2022"
                        className="col-span-3 bg-black border-white/10"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="color" className="text-right text-sm">
                        Color
                      </Label>
                      <Input
                        id="color"
                        value={newVehicle.color}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            color: e.target.value,
                          })
                        }
                        placeholder="Red"
                        className="col-span-3 bg-black border-white/10"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="plate" className="text-right text-sm">
                        Number
                      </Label>
                      <Input
                        id="plate"
                        value={newVehicle.plate_number}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            plate_number: e.target.value,
                          })
                        }
                        placeholder="WP CAS-1234"
                        className="col-span-3 bg-black border-white/10"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => setIsVehicleDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddVehicle}
                      className="bg-[#F5A623] text-black hover:bg-[#D48F1E]"
                    >
                      Save Vehicle
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderVehicles()}
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}</style>
    </div>
  );
}

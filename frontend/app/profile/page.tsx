"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";
import NavBar from "@/components/NavBar";
import {
  PhoneIcon,
  EnvelopeIcon,
  CheckBadgeIcon,
  XMarkIcon,
  PencilIcon,
  CheckIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

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

  const [isEditing, setIsEditing] = useState(false);
  const [editedPhone, setEditedPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const API_BASE = "http://127.0.0.1:8080/api/auth/api/v1";
  const userId = session?.user?.id || (session?.user as any)?.sub;
  const accessToken = (session as any)?.accessToken;
  const hasSyncedRef = useRef(false);

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
                  <EnvelopeIcon className="w-3.5 h-3.5 stroke-[1.5]" /> communication link
                </span>
                <p className="font-mono text-sm tracking-tight text-[#D1D0C5]">
                  {profile?.email || session?.user?.email}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] text-[#646669] uppercase tracking-widest flex items-center gap-2">
                  <PhoneIcon className="w-3.5 h-3.5 stroke-[1.5]" /> comm. device
                </span>
                {isEditing ? (
                  <div className="flex items-center gap-2 max-w-[240px]">
                    <input
                      autoFocus
                      value={editedPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
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

      </main>
    </div>
  );
}

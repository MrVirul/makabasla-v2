"use client";
import { useSession } from "next-auth/react";
import NavBar from "@/components/NavBar";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <main className="pt-24 px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">User Profile</h1>
        <div className="glass p-8 rounded-3xl border border-white/10">
          <p className="text-gray-400">
            Name: <span className="text-white">{session?.user?.name}</span>
          </p>
          <p className="text-gray-400">
            Email: <span className="text-white">{session?.user?.email}</span>
          </p>
        </div>
      </main>
    </div>
  );
}

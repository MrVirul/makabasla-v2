"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  UserPlusIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  KeyIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/profile/dialog";
import Image from "next/image";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

const AVAILABLE_PERMISSIONS = [
  { id: "admin:registry", label: "Registry Access", icon: IdentificationIcon },
  { id: "admin:billing", label: "Billing Access", icon: IdentificationIcon },
  { id: "admin:customers", label: "Customer Map Access", icon: IdentificationIcon },
];

export default function UserManagementPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([
    { id: "1", username: "super.admin", email: "root@makabasla.com", roles: ["super_admin"] },
    { id: "2", username: "staff.john", email: "john@makabasla.com", roles: ["admin:registry"] },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    roles: [] as string[],
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isSuperAdmin = (session as any)?.isSuperAdmin;

  const toggleRole = (role: string) => {
    setNewUser((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleCreateUser = () => {
    // API logic will go here
    setIsCreateOpen(false);
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-12 font-mono text-xs text-[#646669] uppercase tracking-widest">
        access restricted. super_node credentials required.
      </div>
    );
  }

  return (
    <div className="max-w-[1240px] p-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b border-[#1A1A1A] pb-12">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 bg-[#1A1A1A] rounded-sm flex items-center justify-center text-[#F5A623] text-2xl font-mono font-medium uppercase border-b-2 border-transparent overflow-hidden relative">
            {mounted && session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User profile image"}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              (session?.user?.name || "U").charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-[#D1D0C5]">
              user management
            </h1>
            <p className="font-mono text-xs text-[#646669] tracking-widest uppercase mt-4">
              manage accounts and access permissions
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="font-mono text-xs flex items-center gap-2 text-[#646669] hover:text-[#F5A623] transition-colors uppercase tracking-widest py-2 active:scale-95"
        >
          <UserPlusIcon className="w-4 h-4 stroke-[1.5]" /> create new user
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map((user) => (
          <div
            key={user.id}
            className="group p-8 flex flex-col bg-[#1A1A1A] rounded-sm transition-colors border-l-[3px] border-transparent hover:border-[#F5A623]"
          >
            <div className="flex justify-between items-start mb-10">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#646669]">
                {user.roles.includes("super_admin") ? "super_admin" : "standard_admin"}
              </span>
              <div className="flex gap-4">
                 {user.roles.includes("super_admin") ? (
                   <ShieldCheckIcon className="w-4 h-4 text-[#F5A623] stroke-[1.5]" />
                 ) : (
                   <button className="text-[#1A1A1A] group-hover:text-[#646669] hover:!text-rose-400 transition-colors">
                     <TrashIcon className="w-4 h-4 stroke-[1.5]" />
                   </button>
                 )}
              </div>
            </div>

            <h3 className="text-xl font-medium text-[#D1D0C5] mb-2">{user.username}</h3>
            <p className="font-mono text-xs text-[#646669] mb-8 lowercase tracking-tight">
              {user.email}
            </p>

            <div className="mt-auto space-y-3">
              <span className="font-mono text-[10px] text-[#222] uppercase tracking-[0.2em] mb-2 block">access_permissions</span>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="font-mono text-[9px] px-2 py-0.5 rounded-sm bg-[#0B0B0B] text-[#646669] border border-[#1A1A1A]"
                  >
                    {role.replace("admin:", "")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#0B0B0B] border-[#1A1A1A] text-[#D1D0C5] p-10 max-w-[480px] rounded-sm shadow-2xl">
          <DialogHeader className="mb-10">
            <DialogTitle className="text-xl font-medium tracking-tight">
              create account
            </DialogTitle>
            <p className="font-mono text-[10px] text-[#646669] uppercase tracking-widest mt-2">
              setting up new user access
            </p>
          </DialogHeader>

          <div className="flex flex-col gap-6 font-mono text-xs">
            <div className="flex flex-col gap-2 group">
              <span className="text-[#646669] uppercase tracking-widest group-focus-within:text-[#F5A623] transition-colors">
                username
              </span>
              <input
                placeholder="username..."
                className="bg-transparent border-b border-[#1A1A1A] py-2 focus:outline-none focus:border-[#F5A623] transition-colors text-[#D1D0C5] placeholder:text-[#1A1A1A]"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2 group">
              <span className="text-[#646669] uppercase tracking-widest group-focus-within:text-[#F5A623] transition-colors">
                email address
              </span>
              <input
                placeholder="email@makabasla.com"
                className="bg-transparent border-b border-[#1A1A1A] py-2 focus:outline-none focus:border-[#F5A623] transition-colors text-[#D1D0C5] placeholder:text-[#1A1A1A]"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2 group">
              <span className="text-[#646669] uppercase tracking-widest group-focus-within:text-[#F5A623] transition-colors">
                password
              </span>
              <input
                type="password"
                placeholder="************"
                className="bg-transparent border-b border-[#1A1A1A] py-2 focus:outline-none focus:border-[#F5A623] transition-colors text-[#D1D0C5] placeholder:text-[#1A1A1A]"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <span className="text-[#646669] uppercase tracking-widest">assigned permissions</span>
              <div className="grid grid-cols-1 gap-2">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <button
                    key={perm.id}
                    onClick={() => toggleRole(perm.id)}
                    className={`flex items-center justify-between p-3 rounded-sm border transition-all ${
                      newUser.roles.includes(perm.id)
                        ? "bg-[#1A1A1A] border-[#F5A623] text-[#F5A623]"
                        : "bg-transparent border-[#1A1A1A] text-[#646669] hover:border-[#333]"
                    }`}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-widest">{perm.label}</span>
                    <KeyIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-12 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="text-[#646669] hover:text-[#D1D0C5] transition-colors px-4 py-2"
            >
              cancel
            </button>
            <button
              onClick={handleCreateUser}
              className="bg-[#D1D0C5] text-black px-6 py-2.5 hover:bg-[#F5A623] transition-colors active:scale-98"
            >
              create account
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

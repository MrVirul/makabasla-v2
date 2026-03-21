"use client";

import { Search, Filter, Plus, Mail, Phone, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/profile/badge";
import { Button } from "@/components/ui/profile/button";
import { Input } from "@/components/ui/profile/input";

export default function CustomersPage() {
  const customers = [
    {
      id: "1",
      name: "Virul Meemana",
      email: "virul@example.com",
      phone: "+94 71 234 5678",
      joined: "2024-03-21",
      status: "Active",
    },
    {
      id: "2",
      name: "John Doe",
      email: "john@example.com",
      phone: "+94 77 111 2222",
      joined: "2024-03-20",
      status: "New",
    },
  ];

  return (
    <div className="p-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Customer Directory
          </h1>
          <p className="text-gray-400 mt-1">
            Manage all registered workshop customers.
          </p>
        </div>

        {/* <div className="flex items-center gap-3">
           <Button className="bg-[#F5A623] hover:bg-[#D48F1E] text-black font-bold h-10 px-6 rounded-xl">
             <Plus className="w-4 h-4 mr-2" /> New Customer
           </Button>
        </div> */}
      </div>
    </div>
  );
}

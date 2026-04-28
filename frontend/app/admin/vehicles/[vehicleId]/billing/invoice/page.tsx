"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LetterheadTemplate from "@/components/templates/LetterheadTemplate";

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
  plate_number?: string;
  expenses: Expense[];
  advances: Advance[];
  total_expenses: number;
  total_advances: number;
  balance_due: number;
}

export default function VehicleInvoicePage() {
  const { vehicleId } = useParams();
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://127.0.0.1:8080/api/billing";

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/${vehicleId}`);
        if (!res.ok) throw new Error("Failed to load billing data");
        const data = await res.json();
        setBilling(data);
      } catch (err: any) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBilling();
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] p-12 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1A1A1A] border-t-[#F5A623] rounded-full animate-spin" />
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] p-12 text-white">
        Billing data not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <LetterheadTemplate billingData={billing} />
    </div>
  );
}

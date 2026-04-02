"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BanknotesIcon,
  PlusIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  WalletIcon,
  ChevronLeftIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/profile/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/profile/dialog";

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
  plate_number: string;
  expenses: Expense[];
  advances: Advance[];
  total_expenses: number;
  total_advances: number;
  balance_due: number;
}

export default function VehicleBillingPage() {
  const { vehicleId } = useParams();
  const router = useRouter();

  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogType, setDialogType] = useState<"expense" | "advance">(
    "expense",
  );
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = "http://127.0.0.1:8080/api/billing";

  useEffect(() => {
    fetchBilling();
  }, [vehicleId]);

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

  const deleteBilling = async () => {
    try {
      setDeleting(true);
      const res = await fetch(`${API_BASE}/${vehicleId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete billing");
      router.push("/admin/vehicles");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.description || !formData.amount) return;

    try {
      setSubmitting(true);
      const endpoint = dialogType === "expense" ? "expense" : "advance";
      const res = await fetch(`${API_BASE}/${vehicleId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,
          description: formData.description,
          amount: Number.parseFloat(formData.amount),
        }),
      });

      if (!res.ok) throw new Error(`Failed to add ${dialogType}`);
      const updatedData = await res.json();
      setBilling(updatedData);
      setIsDialogOpen(false);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] p-12 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1A1A1A] border-t-[#F5A623] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#D1D0C5] p-12 selection:bg-[#F5A623]/20">
      <div className="max-w-[1240px] mx-auto space-y-16 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-[#1A1A1A] pb-12">
          <div>
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-[#646669] hover:text-[#D1D0C5] transition-colors mb-6 font-mono text-[10px] tracking-widest uppercase"
            >
              <ChevronLeftIcon className="w-4 h-4 stroke-[1.5] group-hover:-translate-x-1 transition-transform" />
              return to registry
            </button>
            <h1 className="text-3xl font-medium tracking-tight text-white flex items-center gap-4">
              Billing Report
            </h1>
            <p className="font-mono text-xs text-[#646669] mt-4 uppercase tracking-widest">
              allocation telemetry for vehicle #{vehicleId}
            </p>
          </div>

          <div className="flex gap-6 font-mono text-[11px] tracking-widest uppercase">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-[#646669] hover:text-white transition-colors py-2 active:scale-95 flex items-center gap-2 h-auto px-0 bg-transparent"
            >
              <TrashIcon className="w-4 h-4 stroke-[1.5]" /> terminate session
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setDialogType("expense");
                setIsDialogOpen(true);
              }}
              className="text-[#646669] hover:text-white transition-colors py-2 active:scale-95 flex items-center gap-2 h-auto px-0 bg-transparent"
            >
              <PlusIcon className="w-4 h-4 stroke-[1.5]" /> allocate expense
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setDialogType("advance");
                setIsDialogOpen(true);
              }}
              className="text-[#646669] hover:text-white transition-colors py-2 active:scale-95 flex items-center gap-2 h-auto px-0 bg-transparent"
            >
              <PlusIcon className="w-4 h-4 stroke-[1.5]" /> add advance
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#1A1A1A] rounded-sm p-8 flex flex-col border-l-[3px] border-transparent hover:border-rose-400/30 transition-colors">
            <div className="flex justify-between items-start mb-8">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#646669]">
                gross expenses
              </span>
              <ArrowTrendingDownIcon className="w-5 h-5 text-rose-400/60 stroke-[1.5]" />
            </div>
            <h3 className="text-3xl font-mono tracking-tighter text-rose-400/80">
              Rs. {(billing?.total_expenses ?? 0).toLocaleString()}
            </h3>
          </div>

          <div className="bg-[#1A1A1A] rounded-sm p-8 flex flex-col border-l-[3px] border-transparent hover:border-emerald-400/30 transition-colors">
            <div className="flex justify-between items-start mb-8">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#646669]">
                advance input
              </span>
              <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-400/60 stroke-[1.5]" />
            </div>
            <h3 className="text-3xl font-mono tracking-tighter text-emerald-400/80">
              Rs. {(billing?.total_advances ?? 0).toLocaleString()}
            </h3>
          </div>

          <div className="bg-[#1A1A1A] rounded-sm p-8 flex flex-col border-l-[3px] border-transparent hover:border-[#F5A623]/30 transition-colors">
            <div className="flex justify-between items-start mb-8">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#F5A623]/60">
                net balance
              </span>
              <WalletIcon className="w-5 h-5 text-[#F5A623]/60 stroke-[1.5]" />
            </div>
            <h3 className="text-4xl font-mono tracking-tighter text-[#F5A623]">
              Rs. {(billing?.balance_due ?? 0).toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Expense Section */}
        <div className="space-y-12">
          <h2 className="text-2xl font-medium tracking-tight text-[#D1D0C5] flex items-center gap-4">
            expenses
          </h2>
          <div className="bg-[#1A1A1A] rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-[#0B0B0B] text-[10px] uppercase tracking-widest text-[#646669]">
                  <th className="px-8 py-6 font-medium">timestamp</th>
                  <th className="px-8 py-6 font-medium">description</th>
                  <th className="px-8 py-6 font-medium text-right">quota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0B0B0B]">
                {billing?.expenses?.map((e) => (
                  <tr
                    key={e.id}
                    className="group hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-8 py-6 text-[#646669]">{e.date}</td>
                    <td className="px-8 py-6 text-[#D1D0C5] lowercase">
                      {e.description}
                    </td>
                    <td className="px-8 py-6 text-rose-400/60 text-right">
                      Rs. {(e.amount ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {(!billing?.expenses || billing.expenses.length === 0) && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-8 py-16 text-center text-[#646669]"
                    >
                      no active expenses recorded.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-[#0B0B0B]/40">
                <tr className="border-t border-[#1A1A1A]">
                  <td
                    colSpan={2}
                    className="px-8 py-6 text-[10px] uppercase tracking-widest text-[#646669] text-right font-medium"
                  >
                    cumulative loss
                  </td>
                  <td className="px-8 py-6 text-xl text-rose-400/80 text-right tracking-tighter">
                    Rs. {(billing?.total_expenses ?? 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Advance Section */}
        <div className="space-y-12 pb-24">
          <h2 className="text-2xl font-medium tracking-tight text-[#D1D0C5] flex items-center gap-4">
            advances and income
          </h2>
          <div className="bg-[#1A1A1A] rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-[#0B0B0B] text-[10px] uppercase tracking-widest text-[#646669]">
                  <th className="px-8 py-6 font-medium">timestamp</th>
                  <th className="px-8 py-6 font-medium">description</th>
                  <th className="px-8 py-6 font-medium text-right">credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0B0B0B]">
                {billing?.advances?.map((a) => (
                  <tr
                    key={a.id}
                    className="group hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-8 py-6 text-[#646669]">{a.date}</td>
                    <td className="px-8 py-6 text-[#D1D0C5] lowercase">
                      {a.description}
                    </td>
                    <td className="px-8 py-6 text-emerald-400/60 text-right">
                      Rs. {(a.amount ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {(!billing?.advances || billing.advances.length === 0) && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-8 py-16 text-center text-[#646669]"
                    >
                      no advance history.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-[#0B0B0B]/40">
                <tr className="border-t border-[#1A1A1A]">
                  <td
                    colSpan={2}
                    className="px-8 py-6 text-[10px] uppercase tracking-widest text-[#646669] text-right font-medium"
                  >
                    cumulative gain
                  </td>
                  <td className="px-8 py-6 text-xl text-emerald-400/80 text-right tracking-tighter">
                    Rs. {(billing?.total_advances ?? 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Dialog for Add Entry */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0B0B0B] border-[#1A1A1A] text-[#D1D0C5] p-10 max-w-[440px] rounded-sm shadow-2xl">
          <DialogHeader className="mb-10">
            <DialogTitle className="text-xl font-medium tracking-tight">
              {dialogType === "expense"
                ? "allocate expense"
                : "add advance input"}
            </DialogTitle>
            <p className="font-mono text-[10px] text-[#646669] uppercase tracking-widest mt-2">
              modification of billing registry
            </p>
          </DialogHeader>

          <div className="flex flex-col gap-8 font-mono text-xs">
            <div className="flex flex-col gap-2">
              <span className="text-[#646669] uppercase tracking-widest">
                timestamp
              </span>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="bg-transparent border-b border-[#1A1A1A] py-2 focus:outline-none focus:border-[#F5A623] transition-colors text-[#D1D0C5]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[#646669] uppercase tracking-widest">
                variable description
              </span>
              <input
                placeholder={
                  dialogType === "expense"
                    ? "quota allocation..."
                    : "credit input..."
                }
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-transparent border-b border-[#1A1A1A] py-2 focus:outline-none focus:border-[#F5A623] transition-colors text-[#D1D0C5] placeholder:text-[#1A1A1A]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[#646669] uppercase tracking-widest">
                quota (lkr)
              </span>
              <input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="bg-transparent border-b border-[#1A1A1A] py-2 focus:outline-none focus:border-[#F5A623] transition-colors text-[#D1D0C5] placeholder:text-[#1A1A1A]"
              />
            </div>
          </div>

          <DialogFooter className="mt-12 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="text-[#646669] hover:text-[#D1D0C5] transition-colors px-4 py-2"
            >
              terminate
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#D1D0C5] text-black px-6 py-2.5 hover:bg-[#F5A623] transition-colors active:scale-98 disabled:opacity-50"
            >
              {submitting ? "processing..." : "commit sequence"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-[#0B0B0B] border-[#1A1A1A] text-[#D1D0C5] p-10 max-w-[440px] rounded-sm shadow-2xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-xl font-medium tracking-tight text-rose-400/80">
              terminate billing session
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="font-mono text-xs text-[#646669] leading-relaxed uppercase tracking-widest">
              are you sure you want to purge registry node #{vehicleId}? this
              action is permanent and unrecoverable.
            </p>
            <div className="bg-rose-400/5 border border-rose-400/10 p-6 rounded-sm">
              <p className="font-mono text-[10px] text-rose-400/60 uppercase tracking-widest leading-relaxed">
                critical: all associated quotas and payment logs will be
                destroyed.
              </p>
            </div>
          </div>
          <DialogFooter className="mt-12 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-[#646669] hover:text-[#D1D0C5] transition-colors px-4 py-2"
            >
              abort
            </button>
            <button
              onClick={deleteBilling}
              disabled={deleting}
              className="bg-rose-600/80 hover:bg-rose-600 text-white px-6 py-2.5 active:scale-98 transition-all disabled:opacity-50"
            >
              {deleting ? "purging..." : "confirm purge"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Receipt,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
  ChevronLeft,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/profile/button";
import { Input } from "@/components/ui/profile/input";
import {
  Card,
  CardContent,
} from "@/components/ui/profile/card";
import { Skeleton } from "@/components/ui/profile/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/profile/dialog";
import { Label } from "@/components/ui/profile/label";

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

export default function VehicleBillingPage() {
  const { vehicleId } = useParams();
  const router = useRouter();
  
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogType, setDialogType] = useState<"expense" | "advance">("expense");
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
      <div className="p-8 space-y-8 animate-pulse max-w-5xl mx-auto">
        <Skeleton className="h-12 w-64 bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 bg-white/5 rounded-3xl" />
          <Skeleton className="h-32 bg-white/5 rounded-3xl" />
          <Skeleton className="h-32 bg-white/5 rounded-3xl" />
        </div>
        <Skeleton className="h-96 bg-white/5 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#CFCFCF]/40 hover:text-[#F5A623] transition-colors mb-2 text-sm font-medium"
          >
            <ChevronLeft size={16} /> Back to Vehicles
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Receipt className="text-[#F5A623] w-8 h-8" /> Vehicle Billing
          </h1>
          <p className="text-[#CFCFCF]/60 mt-1">
            Manage expenses and track payments for Vehicle ID #{vehicleId}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl px-4 py-2 mt-0"
          >
            <Trash2 size={18} className="mr-2" /> Delete
          </Button>
          <Button 
            onClick={() => { setDialogType("expense"); setIsDialogOpen(true); }}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl px-4 py-2 mt-0"
          >
            <Plus size={18} className="mr-2" /> Add Expense
          </Button>
          <Button 
            onClick={() => { setDialogType("advance"); setIsDialogOpen(true); }}
            className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 rounded-xl px-4 py-2 mt-0"
          >
            <Plus size={18} className="mr-2" /> Add Advance
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-white/5 bg-transparent">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#CFCFCF]/40 mb-1">Total Expenses</p>
                <h3 className="text-2xl font-bold text-red-500">Rs. {(billing?.total_expenses ?? 0).toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-red-400/10 text-red-500 rounded-2xl">
                <TrendingDown size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 bg-transparent">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#CFCFCF]/40 mb-1">Total Advances</p>
                <h3 className="text-2xl font-bold text-green-500">Rs. {(billing?.total_advances ?? 0).toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-green-400/10 text-green-500 rounded-2xl">
                <TrendingUp size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-[#F5A623]/20 bg-[#F5A623]/5">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#F5A623]/60 mb-1">Balance Due</p>
                <h3 className="text-3xl font-black text-[#F5A623]">Rs. {(billing?.balance_due ?? 0).toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-[#F5A623]/20 text-[#F5A623] rounded-2xl">
                <Wallet size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white/90 border-l-4 border-red-500 pl-4 py-1">Expenses</h2>
        <Card className="glass border-white/5 bg-transparent overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-right">Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {billing?.expenses?.map((e) => (
                    <tr key={e.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-gray-400">{e.date}</td>
                      <td className="px-6 py-4 text-sm font-medium text-white/80">{e.description}</td>
                      <td className="px-6 py-4 text-sm font-bold text-red-400 text-right">Rs. {(e.amount ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  {(!billing?.expenses || billing.expenses.length === 0) && (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500 text-sm">No expenses recorded yet.</td></tr>
                  )}
                </tbody>
                <tfoot className="bg-red-500/5">
                    <tr>
                        <td colSpan={2} className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-right">Total Expenses</td>
                        <td className="px-6 py-4 text-xl font-black text-red-400 text-right underline decoration-double">Rs. {(billing?.total_expenses ?? 0).toLocaleString()}</td>
                    </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advance Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white/90 border-l-4 border-green-500 pl-4 py-1">Advances / Income</h2>
        <Card className="glass border-white/5 bg-transparent overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-right">Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {billing?.advances?.map((a) => (
                    <tr key={a.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-gray-400">{a.date}</td>
                      <td className="px-6 py-4 text-sm font-medium text-white/80">{a.description}</td>
                      <td className="px-6 py-4 text-sm font-bold text-green-400 text-right">Rs. {(a.amount ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  {(!billing?.advances || billing.advances.length === 0) && (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500 text-sm">No payments recorded yet.</td></tr>
                  )}
                </tbody>
                <tfoot className="bg-green-500/5">
                    <tr>
                        <td colSpan={2} className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-right">Total Payments</td>
                        <td className="px-6 py-4 text-xl font-black text-green-400 text-right underline decoration-double">Rs. {(billing?.total_advances ?? 0).toLocaleString()}</td>
                    </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1A1A1A] border-white/10 text-white sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              {dialogType === "expense" ? (
                <><TrendingDown className="text-red-500" /> Add New Expense</>
              ) : (
                <><TrendingUp className="text-green-500" /> Add Advance Payment</>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs uppercase font-bold tracking-widest text-gray-500">Date</Label>
              <Input 
                id="date" 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="bg-black/50 border-white/10 h-12 rounded-xl focus:border-[#F5A623]/50 w-full px-4" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc" className="text-xs uppercase font-bold tracking-widest text-gray-500">Description</Label>
              <Input 
                id="desc" 
                placeholder={dialogType === "expense" ? "e.g. Engine Oil, Brake Pads" : "e.g. Initial Deposit"}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-black/50 border-white/10 h-12 rounded-xl focus:border-[#F5A623]/50 w-full px-4" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs uppercase font-bold tracking-widest text-gray-500">Amount (LKR)</Label>
              <Input 
                id="amount" 
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="bg-black/50 border-white/10 h-12 rounded-xl focus:border-[#F5A623]/50 w-full px-4" 
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-12">Cancel</Button>
            <Button 
                onClick={handleSubmit} 
                disabled={submitting}
                className={`rounded-xl h-12 font-bold px-8 ${dialogType === 'expense' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-all`}
            >
              {submitting ? <Loader2 className="animate-spin" /> : "Save Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-[#1A1A1A] border-white/10 text-white sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Trash2 className="text-red-500" /> Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <p className="text-[#CFCFCF]/60">
              Are you absolutely sure you want to delete the billing record for vehicle #{vehicleId}?
            </p>
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3">
              <div className="bg-red-500/20 p-1.5 rounded-lg text-red-400 mt-0.5">!</div>
              <p className="text-xs text-red-400/80 leading-relaxed font-medium">
                This action is permanent and will delete all expenses, payments, and history associated with this record.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-xl h-12 text-white/40 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={deleteBilling}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl h-12 px-8 transition-all"
            >
              {deleting ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  Calendar as CalendarIcon,
  ChevronRight,
  Filter,
  RefreshCcw,
  Search,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Pie,
  PieChart,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, startOfMonth, subMonths, subDays } from "date-fns";
import { cn } from "@/lib/utils";

// Types based on the system
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

interface Billing {
  id: string;
  vehicle_id: number;
  expenses: Expense[];
  advances: Advance[];
  total_expenses: number;
  total_advances: number;
  balance_due: number;
  created_at: string;
}

const API_BASE = "http://localhost:8080/api/auth/api/v1";
const BILLING_BASE = "http://localhost:8080/api/billing";
const COLORS = ["#F5A623", "#646669", "#D1D0C5", "#ca4754", "#1A1A1A"];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [billings, setBillings] = useState<Billing[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: new Date(),
  });

  const accessToken = (session as any)?.accessToken as string | undefined;

  const fetchData = useCallback(async () => {
    console.info(
      "[Dashboard] Starting data fetch. Token present:",
      !!accessToken,
      "Status:",
      status,
    );
    setError(null);
    setLoading(true);

    // Build headers — auth is optional; internal billing endpoint works without it
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    // Run vehicles and billings fetches in parallel, independently
    const [vehicleResult, billingResult] = await Promise.allSettled([
      // ── Vehicles ──────────────────────────────────────────────
      fetch(`${API_BASE}/vehicles`, { headers }).then(async (res) => {
        console.info("[Dashboard] Vehicles response status:", res.status);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Vehicles fetch failed (${res.status}): ${text.slice(0, 200)}`,
          );
        }
        const raw = await res.json();
        console.info(
          "[Dashboard] Vehicles raw — isArray:",
          Array.isArray(raw),
          "length:",
          Array.isArray(raw) ? raw.length : "n/a",
        );
        return Array.isArray(raw) ? (raw as Vehicle[]) : [];
      }),

      // ── All billings from the internal aggregate REST endpoint ──
      fetch(`${BILLING_BASE}/internal/billings`, { headers }).then(
        async (res) => {
          console.info("[Dashboard] Billings response status:", res.status);
          if (!res.ok) {
            const text = await res.text();
            throw new Error(
              `Billings fetch failed (${res.status}): ${text.slice(0, 200)}`,
            );
          }
          const raw = await res.json();
          console.info(
            "[Dashboard] Billings raw — isArray:",
            Array.isArray(raw),
            "length:",
            Array.isArray(raw) ? raw.length : "n/a",
          );
          return Array.isArray(raw) ? (raw as Billing[]) : [];
        },
      ),
    ]);

    // Apply vehicles result
    if (vehicleResult.status === "fulfilled") {
      console.info(
        `[Dashboard] ✅ ${vehicleResult.value.length} vehicles loaded.`,
      );
      setVehicles(vehicleResult.value);
    } else {
      console.error("[Dashboard] ❌ Vehicles error:", vehicleResult.reason);
      setError(`Could not load fleet data: ${vehicleResult.reason}`);
    }

    // Apply billings result
    if (billingResult.status === "fulfilled") {
      console.info(
        `[Dashboard] ✅ ${billingResult.value.length} billing records loaded.`,
      );
      setBillings(billingResult.value);
    } else {
      console.error("[Dashboard] ❌ Billings error:", billingResult.reason);
    }

    setLoading(false);
  }, [accessToken, status]);

  useEffect(() => {
    // Wait for session to resolve — then always fetch (admin page is auth-protected by layout)
    if (status === "loading") return;
    fetchData();
  }, [status, fetchData]);

  // Derived stats
  const stats = useMemo(() => {
    const totalRevenue = billings.reduce((sum, b) => sum + b.total_expenses, 0);
    const totalAdvances = billings.reduce(
      (sum, b) => sum + b.total_advances,
      0,
    );
    const totalBalance = billings.reduce((sum, b) => sum + b.balance_due, 0);

    return {
      revenue: totalRevenue,
      advances: totalAdvances,
      balance: totalBalance,
      activeCycles: billings.length,
      totalVehicles: vehicles.length,
    };
  }, [billings, vehicles]);

  // Chart data: Revenue over time
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly" | "yearly">("monthly");

  const chartData = useMemo(() => {
    const dataMap: Record<string, { name: string; income: number; expenses: number; date: Date }> = {};
    const now = new Date();
    
    let startDate: Date;
    let formatStr: string;
    
    if (timeRange === "weekly") {
      startDate = subDays(now, 6);
      formatStr = "EEE"; 
    } else if (timeRange === "monthly") {
      startDate = subDays(now, 29);
      formatStr = "dd MMM";
    } else {
      startDate = subMonths(now, 11);
      formatStr = "MMM";
    }

    // Initialize the range with 0s to avoid gaps
    if (timeRange === "weekly" || timeRange === "monthly") {
      const iterations = timeRange === "weekly" ? 7 : 30;
      for (let i = iterations - 1; i >= 0; i--) {
        const d = subDays(now, i);
        const key = format(d, formatStr);
        dataMap[key] = { name: key, income: 0, expenses: 0, date: d };
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = subMonths(now, i);
        const key = format(d, formatStr);
        dataMap[key] = { name: key, income: 0, expenses: 0, date: d };
      }
    }

    billings.forEach((b) => {
      // 1. Process individual expenses
      b.expenses?.forEach((exp) => {
        if (!exp.date) return;
        const eDate = new Date(exp.date);
        if (Number.isNaN(eDate.getTime()) || eDate < startDate) return;

        const key = format(eDate, formatStr);
        if (dataMap[key]) {
          dataMap[key].expenses += exp.amount || 0;
        }
      });

      // 2. Process individual advances (income)
      b.advances?.forEach((adv) => {
        if (!adv.date) return;
        const aDate = new Date(adv.date);
        if (Number.isNaN(aDate.getTime()) || aDate < startDate) return;

        const key = format(aDate, formatStr);
        if (dataMap[key]) {
          dataMap[key].income += adv.amount || 0;
        }
      });
    });

    return Object.values(dataMap).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [billings, timeRange]);

  // Distribution data
  const distributionData = useMemo(() => {
    const makes: Record<string, number> = {};
    vehicles.forEach((v) => {
      makes[v.make] = (makes[v.make] || 0) + 1;
    });
    return Object.entries(makes).map(([name, value], index) => ({
      name,
      value,
      fill: COLORS[index % COLORS.length],
    }));
  }, [vehicles]);

  if (loading) {
    return (
      <div className="p-12 space-y-12 animate-pulse bg-[#0B0B0B] min-h-screen">
        <div className="h-10 bg-white/5 rounded-md w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-white/5 rounded-md border border-white/5"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 bg-white/5 rounded-md border border-white/5" />
          <div className="h-80 bg-white/5 rounded-md border border-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-12 space-y-12 bg-[#0B0B0B] min-h-screen text-[#D1D0C5] selection:bg-[#F5A623]/30">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-medium tracking-tight text-white/90">
            Dashboard Overview
          </h1>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="font-mono text-[10px] text-[#A1A1A1] tracking-widest uppercase">
              Live system monitoring active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 font-mono text-[10px] tracking-widest uppercase border-white/5 bg-white/[0.02] text-[#646669] hover:text-[#F5A623] hover:bg-white/5 active:scale-95 transition-all"
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {dateRange.from
                  ? format(dateRange.from, "dd MMM")
                  : "Start"} —{" "}
                {dateRange.to ? format(dateRange.to, "dd MMM") : "End"}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-[#0B0B0B] border-white/10 shadow-2xl"
              align="end"
            >
              <Calendar
                mode="range"
                selected={dateRange as any}
                onSelect={(range: any) => range && setDateRange(range)}
                className="bg-[#0B0B0B] text-[#D1D0C5]"
              />
            </PopoverContent>
          </Popover>

          <Button
            onClick={fetchData}
            variant="outline"
            size="icon"
            className="h-10 w-10 border-white/5 bg-white/[0.02] text-[#646669] hover:text-[#F5A623] hover:bg-white/5 active:rotate-180 transition-all duration-500"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-sm">
          <p className="font-mono text-xs text-red-400">
            SYSTEM_ERROR: {error.toUpperCase()}
          </p>
          <button
            onClick={fetchData}
            className="mt-2 font-mono text-[10px] text-white/40 hover:text-white underline uppercase tracking-widest"
          >
            Try Again
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#141414] border-none shadow-sm group hover:bg-[#1A1A1A] transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#646669]">
              Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#F5A623] opacity-50 group-hover:opacity-100 transition-opacity" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-mono tracking-tighter text-[#D1D0C5]">
              Rs {stats.revenue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-[10px] text-green-500/80 font-mono">
                +12.4%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-none shadow-sm group hover:bg-[#1A1A1A] transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#A1A1A1]">
              Outstanding Payments
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-[#ca4754] opacity-50 group-hover:opacity-100 transition-opacity" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-mono tracking-tighter text-[#D1D0C5]">
              Rs {stats.balance.toLocaleString()}
            </div>
            <p className="text-[10px] text-[#A1A1A1] font-mono mt-2 tracking-wide uppercase">
              Total balance due
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-none shadow-sm group hover:bg-[#1A1A1A] transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#A1A1A1]">
              Velocity
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-mono tracking-tighter text-[#D1D0C5]">
              {stats.activeCycles}
            </div>
            <p className="text-[10px] text-[#A1A1A1] font-mono mt-2 tracking-wide uppercase">
              Open billing cycles
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-none shadow-sm group hover:bg-[#1A1A1A] transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#A1A1A1]">
              Total Vehicles
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-mono tracking-tighter text-[#D1D0C5]">
              {stats.totalVehicles}
            </div>
            <p className="text-[10px] text-[#A1A1A1] font-mono mt-2 tracking-wide uppercase">
              Vehicles in system
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Sections */}
      <Tabs defaultValue="analytics" className="w-full space-y-10">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <TabsList className="bg-transparent gap-8 p-0">
            <TabsTrigger
              value="analytics"
              className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-[#F5A623] data-[state=active]:bg-transparent data-[state=active]:text-white px-0 py-4 font-mono text-[10px] tracking-[0.2em] uppercase transition-all"
            >
              Statistics
            </TabsTrigger>
            <TabsTrigger
              value="registry"
              className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-[#F5A623] data-[state=active]:bg-transparent data-[state=active]:text-white px-0 py-4 font-mono text-[10px] tracking-[0.2em] uppercase transition-all"
            >
              Billing History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="analytics"
          className="space-y-8 m-0 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue Trend Chart */}
            <Card className="lg:col-span-2 bg-[#141414] border-none p-8">
              <CardHeader className="px-0 pt-0 mb-8 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg font-medium text-white/90">
                    Financial Trajectory
                  </CardTitle>
                  <CardDescription className="text-xs text-[#646669] font-mono uppercase tracking-wider">
                    Income vs Expenses over {timeRange}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {(["weekly", "monthly", "yearly"] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={cn(
                        "px-3 py-1 font-mono text-[9px] uppercase tracking-widest transition-all rounded-sm",
                        timeRange === range
                          ? "bg-[#F5A623] text-[#0B0B0B] font-bold"
                          : "bg-white/5 text-[#646669] hover:text-white"
                      )}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="h-[350px] w-full min-h-0 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#1A1A1A"
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#FFFFFF"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        fontFamily="monospace"
                        dy={10}
                      />
                      <YAxis
                        stroke="#FFFFFF"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        fontFamily="monospace"
                        tickFormatter={(value) => `Rs ${value}`}
                      />
                      <RechartsTooltip
                        cursor={{ stroke: '#F5A623', strokeWidth: 1 }}
                        contentStyle={{
                          backgroundColor: "#1A1A1A",
                          border: "1px solid #333",
                          fontSize: "10px",
                          borderRadius: "4px",
                        }}
                        itemStyle={{ padding: '2px 0' }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        align="right"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-[10px] font-mono uppercase tracking-widest text-[#646669] ml-2">{value}</span>}
                      />
                      <Line
                        type="monotone"
                        dataKey="income"
                        name="Income"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                        animationDuration={1500}
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        name="Expenses"
                        stroke="#ca4754"
                        strokeWidth={2}
                        dot={{ fill: '#ca4754', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribution Chart */}
            <Card className="bg-[#141414] border-none p-8">
              <CardHeader className="px-0 pt-0 mb-8">
                <CardTitle className="text-lg font-medium text-white/90">
                  Composition
                </CardTitle>
                <CardDescription className="text-xs text-[#646669] font-mono uppercase tracking-wider">
                  Registry by manufacturer
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0 flex flex-col items-center">
                <div className="h-[280px] w-full min-h-0 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#1A1A1A",
                          border: "1px solid #333",
                          fontSize: "10px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-4 w-full">
                  {distributionData.slice(0, 4).map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-[10px] font-mono text-[#646669] uppercase tracking-wider truncate">
                        {entry.name}
                      </span>
                      <span className="text-[10px] font-mono text-white/40 ml-auto">
                        {Math.round(
                          (entry.value / (stats.totalVehicles || 1)) * 100,
                        )}
                        %
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="registry"
          className="m-0 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <Card className="bg-[#141414] border-none p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div>
                <CardTitle className="text-xl font-medium text-white/90">
                  Financial Registry
                </CardTitle>
                <CardDescription className="text-xs text-[#646669] font-mono uppercase tracking-[0.15em] mt-1">
                  Audit log of all processed billing cycles
                </CardDescription>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-[#A1A1A1] group-focus-within:text-[#F5A623] transition-colors" />
                  <input
                    placeholder="SEARCH BILLING..."
                    className="w-full bg-white/[0.02] border border-white/5 rounded-sm py-2 pl-9 pr-4 text-[10px] font-mono tracking-widest uppercase outline-none focus:border-[#F5A623]/20 focus:bg-white/[0.04] transition-all"
                  />
                </div>
                <Button
                  variant="outline"
                  className="h-9 border-white/5 bg-white/[0.02] text-[#646669] hover:text-[#F5A623] active:scale-95 transition-all"
                >
                  <Filter className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="rounded-sm border border-white/5 overflow-hidden">
              <Table>
                <TableHeader className="bg-white/[0.02]">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="py-5 font-mono text-[10px] tracking-widest uppercase text-[#A1A1A1]">
                      ID
                    </TableHead>
                    <TableHead className="py-5 font-mono text-[10px] tracking-widest uppercase text-[#A1A1A1]">
                      Vehicle Info
                    </TableHead>
                    <TableHead className="py-5 font-mono text-[10px] tracking-widest uppercase text-[#A1A1A1]">
                      Customer
                    </TableHead>
                    <TableHead className="py-5 font-mono text-[10px] tracking-widest uppercase text-[#A1A1A1]">
                      Total Amount
                    </TableHead>
                    <TableHead className="py-5 font-mono text-[10px] tracking-widest uppercase text-[#A1A1A1]">
                      Payments
                    </TableHead>
                    <TableHead className="py-5 font-mono text-[10px] tracking-widest uppercase text-[#A1A1A1]">
                      Balance
                    </TableHead>
                    <TableHead className="py-5 font-mono text-[10px] tracking-widest uppercase text-[#A1A1A1]">
                      Details
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billings.map((b) => {
                    const vehicle = vehicles.find((v) => v.id === b.vehicle_id);
                    return (
                      <TableRow
                        key={b.id}
                        className="border-white/5 hover:bg-white/[0.03] transition-all group cursor-default"
                      >
                        <TableCell className="py-4 font-mono text-[10px] text-[#646669]">
                          #{b.id.substring(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-xs font-medium text-white/80">
                            {vehicle
                              ? `${vehicle.make.toUpperCase()} ${vehicle.model.toUpperCase()}`
                              : `SYS_ID_${b.vehicle_id}`}
                          </div>
                          <div className="text-[10px] text-[#F5A623]/60 font-mono mt-1 tracking-wider">
                            {vehicle?.plate_number}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-[10px] font-mono text-[#646669] uppercase tracking-tighter">
                          {vehicle?.customer?.name || "unidentified"}
                        </TableCell>
                        <TableCell className="py-4 text-xs font-mono text-white/70">
                          Rs {b.total_expenses.toLocaleString()}
                        </TableCell>
                        <TableCell className="py-4 text-xs font-mono text-[#F5A623]/80">
                          Rs {b.total_advances.toLocaleString()}
                        </TableCell>
                        <TableCell className="py-4 text-xs font-mono">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full",
                              b.balance_due > 0
                                ? "bg-[#ca4754]/10 text-[#ca4754]"
                                : "bg-green-500/10 text-green-500",
                            )}
                          >
                            Rs {b.balance_due.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-[#646669] group-hover:text-white transition-colors"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {billings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-40 text-center py-20">
                        <Activity className="h-6 w-6 text-[#1A1A1A] mx-auto mb-4" />
                        <p className="font-mono text-[10px] text-[#A1A1A1] tracking-widest uppercase">
                          no transactional data found in currently selected
                          range
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-700">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase">
              System status: Secure
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase">
              Data: Active
            </p>
          </div>
        </div>

        <p className="font-mono text-[9px] tracking-[0.3em] uppercase">
          makabas.la kernel v2.0.4 // auto-sync enabled
        </p>
      </div>
    </div>
  );
}

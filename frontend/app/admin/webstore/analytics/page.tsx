"use client";

import { useState, useEffect } from "react";
import { ArrowTrendingUpIcon, ChartBarSquareIcon, CubeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface AnalyticsData {
  totalRevenue: number;
  totalItemsSold: number;
  lowStockItems: number;
  activeProducts: number;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:8087/api/v1/webstore/analytics";

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="p-8 relative">
      <Link
        href="/admin/webstore"
        className="flex items-center gap-2 mb-8 text-white/70 hover:text-white transition-colors duration-300 w-fit"
      >
        <ArrowLeftIcon className="w-4 h-4 stroke-[1.5]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
          BACK TO WEBSTORE
        </span>
      </Link>

      <div className="mb-12">
        <h1 className="text-2xl font-light tracking-[0.2em] text-white">REPORTS & ANALYTICS</h1>
        <div className="h-px w-12 bg-[#F5A623] mt-4" />
      </div>

      {error && (
        <div className="mb-6 font-mono text-[10px] text-[#FF453A] border border-[#FF453A]/40 bg-[#FF453A]/10 py-3 px-4 rounded-sm tracking-wider uppercase">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-[#1A1A1A] border-t-[#F5A623] rounded-full animate-spin" />
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#121212] border border-[#1A1A1A] p-6 rounded-sm relative overflow-hidden group hover:border-[#F5A623]/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] w-full h-full pointer-events-none mix-blend-overlay"></div>
            <ArrowTrendingUpIcon className="w-8 h-8 text-[#F5A623] mb-4 stroke-[1.5]" />
            <h3 className="font-mono text-[10px] text-[#A1A1A1] tracking-[0.2em] uppercase mb-2">Total Revenue</h3>
            <p className="font-mono text-3xl text-white tracking-widest">Rs. {data.totalRevenue.toFixed(2)}</p>
          </div>

          <div className="bg-[#121212] border border-[#1A1A1A] p-6 rounded-sm relative overflow-hidden group hover:border-[#F5A623]/50 transition-colors">
            <ChartBarSquareIcon className="w-8 h-8 text-[#A1A1A1] group-hover:text-white mb-4 stroke-[1.5] transition-colors" />
            <h3 className="font-mono text-[10px] text-[#A1A1A1] tracking-[0.2em] uppercase mb-2">Items Sold</h3>
            <p className="font-mono text-3xl text-white tracking-widest">{data.totalItemsSold}</p>
          </div>

          <div className="bg-[#121212] border border-[#1A1A1A] p-6 rounded-sm relative overflow-hidden group hover:border-[#F5A623]/50 transition-colors">
            <CubeIcon className="w-8 h-8 text-[#A1A1A1] group-hover:text-[#F5A623] mb-4 stroke-[1.5] transition-colors" />
            <h3 className="font-mono text-[10px] text-[#A1A1A1] tracking-[0.2em] uppercase mb-2">Active Products</h3>
            <p className="font-mono text-3xl text-white tracking-widest">{data.activeProducts}</p>
          </div>

          <div className={`bg-[#121212] border ${data.lowStockItems > 0 ? "border-[#FF453A]/40" : "border-[#1A1A1A] hover:border-[#F5A623]/50"} p-6 rounded-sm relative overflow-hidden group transition-colors`}>
            <ExclamationTriangleIcon className={`w-8 h-8 ${data.lowStockItems > 0 ? "text-[#FF453A]" : "text-[#A1A1A1] group-hover:text-green-500"} mb-4 stroke-[1.5] transition-colors`} />
            <h3 className="font-mono text-[10px] text-[#A1A1A1] tracking-[0.2em] uppercase mb-2">Low Stock Alerts</h3>
            <p className={`font-mono text-3xl ${data.lowStockItems > 0 ? "text-[#FF453A]" : "text-white"} tracking-widest`}>
              {data.lowStockItems}
            </p>
          </div>
        </div>
      ) : (
        <div className="font-mono text-sm text-[#A1A1A1] uppercase tracking-widest">No data available</div>
      )}

      {/* Placeholder for future detailed chart or transaction log */}
      <div className="mt-8 bg-[#121212] border border-[#1A1A1A] p-8 rounded-sm flex flex-col items-center justify-center min-h-[300px]">
        <ChartBarSquareIcon className="w-16 h-16 text-[#1A1A1A] mb-4 stroke-[1.5]" />
        <p className="font-mono text-xs text-[#A1A1A1] uppercase tracking-[0.3em]">Comprehensive Reporting Engine Integration Pending</p>
        <span className="font-mono text-[10px] text-[#A1A1A1]/50 tracking-widest mt-2">Currently aggregating metrics via live database scans</span>
      </div>
    </div>
  );
}

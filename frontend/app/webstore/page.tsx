"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ShoppingCartIcon, ExclamationTriangleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
}

export default function PublicWebstore() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const API_URL = "http://localhost:8087/api/v1/webstore/products"; // Fetching directly from webstore-service

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchProducts = async (query = "") => {
    try {
      const url = query ? `${API_URL}?search=${encodeURIComponent(query)}` : API_URL;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async (product: Product) => {
    if (status === "unauthenticated") {
      alert("Please Sign In or Register to purchase this item.");
      return;
    }
    
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/${product.id}/buy`, {
        method: "POST",
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to process purchase");
      }
      alert(`Success! ${product.name} added to cart & purchased.`);
      fetchProducts(searchQuery); // Refresh stock immediately
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white p-8 relative">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300"
      >
        <ArrowLeftIcon className="w-4 h-4 stroke-[1.5]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
          BACK TO HOME
        </span>
      </Link>

      <div className="max-w-7xl mx-auto pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#1A1A1A] pb-6 gap-6">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div>
              <h1 className="text-4xl font-light tracking-[0.2em] mb-4">WEBSTORE</h1>
              <div className="h-px w-16 bg-[#F5A623]" />
            </div>

            <div className="relative group">
              <MagnifyingGlassIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-[#F5A623] transition-colors stroke-[1.5]" />
              <input
                type="text"
                placeholder="SEARCH CATALOGUE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 h-10 bg-transparent border-b border-white/20 pl-8 pr-4 font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#F5A623] transition-all"
              />
            </div>
          </div>
          
          {status === "unauthenticated" && (
            <div className="flex items-center gap-2 bg-[#FF453A]/10 border border-[#FF453A]/30 px-4 py-2 rounded-sm text-[#FF453A]">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="font-mono text-xs uppercase tracking-widest">
                Guest Mode: Sign in Required
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-8 font-mono text-[10px] text-[#FF453A] border border-[#FF453A]/40 bg-[#FF453A]/10 py-3 px-4 rounded-sm tracking-wider uppercase">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin text-[#F5A623]" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-[#1A1A1A] bg-[#121212] rounded-sm">
            <ShoppingCartIcon className="w-12 h-12 text-[#A1A1A1] mx-auto mb-4" />
            <p className="font-mono text-[#A1A1A1] uppercase tracking-widest text-sm">
              We are currently restocking our inventory. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.id}
                className="bg-[#121212] border border-[#1A1A1A] flex flex-col rounded-sm hover:border-[#F5A623]/50 transition-colors group relative overflow-hidden"
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-[#1A1A1A] flex items-center justify-center border-b border-[#1A1A1A] relative">
                  <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
                  <ShoppingCartIcon className="w-12 h-12 text-[#2A2A2A] group-hover:scale-110 group-hover:text-[#F5A623]/20 transition-all duration-500" />
                  
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="font-mono text-[#FF453A] text-sm uppercase tracking-widest border border-[#FF453A]/50 bg-[#FF453A]/10 px-3 py-1 -rotate-12 transform shadow-xl shadow-black/50">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h3 className="font-mono text-sm tracking-widest uppercase text-white/90 line-clamp-2">
                      {product.name}
                    </h3>
                  </div>
                  
                  <span className="font-mono text-[10px] text-[#F5A623] uppercase tracking-widest mb-4 inline-block">
                    {product.category}
                  </span>

                  <p className="font-sans text-sm text-[#A1A1A1] mb-6 line-clamp-3 font-light flex-1">
                    {product.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-mono text-lg text-white">
                      Rs. {product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleBuyNow(product)}
                      disabled={product.stock <= 0}
                      className="px-6 py-2 border border-[#F5A623]/30 text-[#F5A623] font-mono text-xs uppercase tracking-widest hover:bg-[#F5A623] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#F5A623]"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

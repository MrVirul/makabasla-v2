"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
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
      const url = query
        ? `${API_URL}?search=${encodeURIComponent(query)}`
        : API_URL;
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

  const handleInquire = (product: Product) => {
    const phoneNumber = "94772215243";
    const message = `Hello, I would like to inquire about the spare part: ${product.name}`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
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
              <h1 className="text-4xl font-light tracking-[0.2em] mb-4">
                WEBSTORE
              </h1>
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

            <button
              onClick={() => {
                const phoneNumber = "94772215243";
                const message =
                  "Hello, I have a general inquiry about your products and services.";
                window.open(
                  `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
                  "_blank",
                );
              }}
              className="h-10 px-6 bg-[#1A1A1A] border border-[#1A1A1A] hover:border-[#F5A623]/50 font-mono text-[10px] uppercase tracking-widest text-[#A1A1A1] hover:text-white transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contact via WhatsApp
            </button>
          </div>

          {status === "unauthenticated" && (
            <div className="flex items-center gap-2 bg-[#F5A623]/5 border border-[#F5A623]/20 px-4 py-2 rounded-sm text-[#F5A623]/80"></div>
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
                {/* Image Placeholder or Actual Image */}
                <div className="h-48 bg-[#1A1A1A] flex items-center justify-center border-b border-[#1A1A1A] relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
                      <ShoppingCartIcon className="w-12 h-12 text-[#2A2A2A] group-hover:scale-110 group-hover:text-[#F5A623]/20 transition-all duration-500" />
                    </>
                  )}

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

                  <div className="flex flex-wrap items-center justify-between mt-auto gap-4 pt-4 border-t border-white/5">
                    <span className="font-mono text-base text-white whitespace-nowrap flex items-baseline gap-1">
                      <span className="text-[10px] text-white/50 uppercase tracking-wider">Rs.</span>
                      <span className="text-lg">{product.price.toFixed(2)}</span>
                    </span>
                    <button
                      onClick={() => handleInquire(product)}
                      className="flex-1 sm:flex-none justify-center px-4 py-2 border border-[#F5A623]/30 text-[#F5A623] font-mono text-[10px] uppercase tracking-widest hover:bg-[#F5A623] hover:text-black transition-all flex items-center gap-2 group/btn active:scale-95"
                    >
                      <svg className="w-3.5 h-3.5 fill-current transition-transform group-hover/btn:scale-110" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Inquire
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

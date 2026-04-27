"use client";

import { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
}

export default function AdminWebstore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      let res;
      if (editingId) {
        res = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Failed to save product");
      
      setFormData({ name: "", description: "", category: "", price: "", stock: "" });
      setEditingId(null);
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const lowStockAlertItems = products.filter(p => p.stock <= 5);

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-[0.2em] text-white">WEBSTORE MANAGEMENT</h1>
          <div className="h-px w-12 bg-[#F5A623] mt-4" />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-[#F5A623] transition-colors stroke-[1.5]" />
            <input
              type="text"
              placeholder="SEARCH PLUG, OILS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-10 bg-transparent border-b border-white/20 pl-8 pr-4 font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#F5A623] transition-all"
            />
          </div>
          <Link
            href="/admin/webstore/analytics"
            className="flex items-center gap-2 h-10 px-6 bg-[#1A1A1A] border border-[#1A1A1A] hover:border-[#F5A623]/50 font-mono text-xs uppercase tracking-widest text-[#D1D0C5] hover:text-white transition-colors"
          >
            <ChartBarIcon className="w-4 h-4 text-[#F5A623]" />
            ANALYTICS
          </Link>
        </div>
      </div>

      {lowStockAlertItems.length > 0 && (
        <div className="mb-6 border border-[#FF453A]/40 bg-[#FF453A]/10 p-4 rounded-sm flex flex-col gap-2 shadow-[0_0_15px_rgba(255,69,58,0.1)]">
          <div className="flex items-center gap-2 font-mono text-sm text-[#FF453A] uppercase tracking-wider">
            <span>⚠️</span>
            <span>Alert: {lowStockAlertItems.length} items are running low on stock!</span>
          </div>
          <div className="text-xs text-white/70 font-mono pl-6 leading-relaxed">
            Affected products: <span className="text-white/90">{lowStockAlertItems.map(p => p.name).join(", ")}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 font-mono text-[10px] text-[#FF453A] border border-[#FF453A]/40 bg-[#FF453A]/10 py-3 px-4 rounded-sm tracking-wider uppercase">
          {error}
        </div>
      )}

      {/* Form Section */}
      <div className="bg-[#121212] border border-[#1A1A1A] p-6 mb-8 rounded-sm">
        <h2 className="text-[#F5A623] font-mono text-xs uppercase tracking-widest mb-6">
          {editingId ? "Edit Product" : "Add New Product"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="PRODUCT NAME"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-12 bg-transparent border-b border-white/20 px-4 font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#F5A623] transition-all"
          />
          <input
            type="text"
            placeholder="CATEGORY"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full h-12 bg-transparent border-b border-white/20 px-4 font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#F5A623] transition-all"
          />
          <input
            type="text"
            placeholder="DESCRIPTION"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full h-12 bg-transparent border-b border-white/20 px-4 font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#F5A623] transition-all md:col-span-2"
          />
          <input
            type="number"
            step="0.01"
            placeholder="PRICE"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full h-12 bg-transparent border-b border-white/20 px-4 font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#F5A623] transition-all"
          />
          <input
            type="number"
            placeholder="STOCK QUANTITY"
            required
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            className="w-full h-12 bg-transparent border-b border-white/20 px-4 font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#F5A623] transition-all"
          />
          
          <div className="md:col-span-2 flex justify-end gap-4 mt-4">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: "", description: "", category: "", price: "", stock: "" });
                }}
                className="h-10 px-6 border border-white/30 font-mono text-xs uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
              >
                CANCEL
              </button>
            )}
            <button
              type="submit"
              className="h-10 px-6 bg-[#F5A623] font-mono text-xs uppercase tracking-widest text-black hover:bg-[#F5A623]/90 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              {editingId ? "UPDATE PRODUCT" : "ADD PRODUCT"}
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-[#121212] border border-[#1A1A1A] rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#1A1A1A] text-[#A1A1A1] uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 font-normal tracking-[0.2em]">ID</th>
                <th className="px-6 py-4 font-normal tracking-[0.2em]">Name</th>
                <th className="px-6 py-4 font-normal tracking-[0.2em]">Category</th>
                <th className="px-6 py-4 font-normal tracking-[0.2em]">Price</th>
                <th className="px-6 py-4 font-normal tracking-[0.2em]">Stock</th>
                <th className="px-6 py-4 font-normal tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/50 text-white/90">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/50">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/50 uppercase tracking-widest">
                    No Products Found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-[#1A1A1A]/30 transition-colors group">
                    <td className="px-6 py-4 text-white/50">#{product.id}</td>
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="px-6 py-4 text-[#F5A623]">{product.category}</td>
                    <td className="px-6 py-4">Rs. {product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {product.stock === 0 ? (
                        <span className="px-2 py-1 rounded-sm border border-[#FF453A]/30 text-[#FF453A]/90 bg-[#FF453A]/10 w-fit inline-block">
                          OUT OF STOCK
                        </span>
                      ) : product.stock <= 5 ? (
                        <span className="px-2 py-1 rounded-sm border border-[#FF453A]/30 text-[#FF453A]/90 bg-[#FF453A]/10 flex flex-row items-center gap-2 w-fit">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF453A] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF453A]"></span>
                          </span>
                          LOW STOCK ({product.stock})
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-sm border border-green-500/30 text-green-500/90 bg-green-500/10 w-fit inline-block">
                          {product.stock} IN STOCK
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-sm transition-all"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-white/50 hover:text-[#FF453A] hover:bg-[#FF453A]/10 rounded-sm transition-all"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

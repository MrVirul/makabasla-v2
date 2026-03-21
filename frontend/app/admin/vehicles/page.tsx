"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  plate_number: string;
  color: string;
  year: number;
  customer_id: string;
  created_at: string;
}

export default function VehiclesPage() {
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const API_BASE = "http://localhost:8080/api/iam/api/v1";

  const fetchVehicles = useCallback(async () => {
    const token = (session as any)?.accessToken;
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE}/vehicles?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch vehicles");
      }

      const data = await response.json();
      setVehicles(data.vehicles || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error("Error fetching vehicles:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session, page, limit]);

  useEffect(() => {
    if (session) {
      fetchVehicles();
    }
  }, [session, fetchVehicles]);

  const totalPages = Math.ceil(total / limit);
}

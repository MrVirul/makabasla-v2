"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PlusIcon,
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon
} from "@heroicons/react/24/outline";

interface Task {
  ID: number;
  vehicle_id: number;
  task_number: string;
  description: string;
  status: string;
}

export default function VehicleTasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.vehicleId as string;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Uses the API Gateway prefix for task-mgt-service
  const API_BASE = "http://127.0.0.1:8080/api/task/api/v1";

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/vehicles/${vehicleId}/tasks`);
      if (!res.ok) throw new Error("failed to fetch tasks");
      const data = await res.json();
      setTasks(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setError("unauthorized access. session required.");
      setLoading(false);
      return;
    }
    fetchTasks();
  }, [status, vehicleId]);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;

    try {
      setIsCreating(true);
      const res = await fetch(`${API_BASE}/vehicles/${vehicleId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: newTaskDesc }),
      });
      if (!res.ok) throw new Error("failed to create task");
      setNewTaskDesc("");
      fetchTasks();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const updateStatus = async (taskId: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("failed to update status");
      fetchTasks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case "pending": return <ClockIcon className="w-5 h-5 text-white/40" />;
      case "start": return <PlayIcon className="w-5 h-5 text-[#F5A623]" />;
      case "working on": return <WrenchScrewdriverIcon className="w-5 h-5 text-blue-400" />;
      case "done": return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      default: return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "pending": return "bg-white/[0.03] text-[#cfcfcf]/50 border-white/5";
      case "start": return "bg-amber-900/20 text-amber-500 border-amber-900/30";
      case "working on": return "bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20 shadow-[0_0_10px_rgba(245,166,35,0.1)]";
      case "done": return "bg-emerald-950/30 text-emerald-500/80 border-emerald-900/30";
      default: return "bg-white/[0.03] text-white/50 border-white/5";
    }
  };

  const statusOptions = ["pending", "start", "working on", "done"];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#CFCFCF]/50 font-sans tracking-tight">
      <div className="max-w-[800px] mx-auto p-12 animate-in fade-in duration-700">
        
        <button 
          onClick={() => router.push("/admin/vehicles")}
          className="flex items-center gap-2 font-mono text-xs text-white/40 hover:text-white transition-colors mb-10 group"
        >
          <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          back to registry
        </button>

        <div className="mb-12 border-b border-white/5 pb-8">
          <h1 className="text-3xl font-medium text-white/90">vehicle tasks</h1>
          <p className="text-sm mt-3 opacity-60 font-mono">registry profile: {vehicleId}</p>
        </div>

        {error && (
          <div className="mb-8 font-mono text-red-400 bg-red-900/10 px-4 py-3 rounded-md text-sm border border-red-900/20">
            {error}
          </div>
        )}

        {/* Create Task Form */}
        <form onSubmit={createTask} className="mb-12 bg-white/[0.02] p-6 rounded-md border border-white/5">
          <h2 className="text-sm font-medium text-white/80 mb-4 flex items-center gap-2">
            <PlusIcon className="w-4 h-4 text-[#F5A623]" /> initialize new task
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="task description..."
              value={newTaskDesc}
              onChange={e => setNewTaskDesc(e.target.value)}
              className="flex-1 bg-white/[0.03] text-white px-4 py-2.5 rounded-md border border-transparent outline-none ring-0 placeholder:text-white/20 focus:bg-white/5 focus:border-[#F5A623]/20 focus:ring-1 focus:ring-[#F5A623] transition-all font-mono text-sm"
              required
            />
            <button
              type="submit"
              disabled={isCreating}
              className="font-mono text-xs bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20 px-6 py-2.5 rounded-md hover:bg-[#F5A623] hover:text-black transition-all disabled:opacity-50 whitespace-nowrap outline-none focus-visible:ring-1 focus-visible:ring-[#F5A623]"
            >
              {isCreating ? "saving..." : "create check-in"}
            </button>
          </div>
        </form>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-md bg-white/[0.02] animate-pulse" />)}
          </div>
        ) : tasks?.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-md">
             <ClipboardDocumentListIcon className="w-8 h-8 text-white/10 mb-4" />
             <p className="font-mono text-sm text-white/30">no tasks registered</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks?.map(t => (
              <div key={t.ID} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/[0.02] p-6 rounded-md hover:bg-white/[0.04] transition-colors border border-white/5">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {getStatusIcon(t.status)}
                  </div>
                  <div>
                    <h3 className="text-white/90 text-sm font-medium mb-1">{t.description}</h3>
                    <span className="font-mono text-xs text-white/30">{t.task_number}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <select 
                    value={t.status}
                    onChange={(e) => updateStatus(t.ID, e.target.value)}
                    className={`appearance-none bg-transparent font-mono text-xs px-3 py-1.5 rounded-sm border ${getStatusColor(t.status)} cursor-pointer outline-none hover:brightness-125 transition-all w-32`}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt} value={opt} className="bg-[#0B0B0B] text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

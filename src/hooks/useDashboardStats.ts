import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

export interface DashboardStats {
  activeDocuments: number;
  openRisks: number;
  highPriorityRisks: number;
  pendingAudits: number;
  auditsThisMonth: number;
  openNCs: number;
  closedThisMonth: number;
  openCAPAs: number;
  trainingDue: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activeDocuments: 0,
    openRisks: 0,
    highPriorityRisks: 0,
    pendingAudits: 0,
    auditsThisMonth: 0,
    openNCs: 0,
    closedThisMonth: 0,
    openCAPAs: 0,
    trainingDue: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      documentsRes,
      risksRes,
      highRisksRes,
      auditsRes,
      auditsMonthRes,
      ncsRes,
      closedNcsRes,
      capasRes,
      trainingRes,
    ] = await Promise.all([
      // Active documents (current status)
      supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("status", "current"),
      
      // Open risks
      supabase
        .from("risks")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "mitigating"]),
      
      // High priority risks (impact * likelihood >= 15)
      supabase
        .from("risks")
        .select("id, impact, likelihood")
        .in("status", ["open", "mitigating"]),
      
      // Pending audits (planned or in_progress)
      supabase
        .from("audits")
        .select("id", { count: "exact", head: true })
        .in("status", ["planned", "in_progress"]),
      
      // Audits this month
      supabase
        .from("audits")
        .select("id", { count: "exact", head: true })
        .gte("start_date", startOfMonth.toISOString()),
      
      // Open NCs
      supabase
        .from("nonconformities")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "investigating", "corrective_action", "verification"]),
      
      // Closed this month
      supabase
        .from("nonconformities")
        .select("id", { count: "exact", head: true })
        .eq("status", "closed")
        .gte("closed_date", startOfMonth.toISOString()),
      
      // Open CAPAs
      supabase
        .from("capa_actions")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "in_progress", "verification"]),
      
      // Training overdue
      supabase
        .from("training_records")
        .select("id", { count: "exact", head: true })
        .eq("status", "overdue"),
    ]);

    // Calculate high priority risks
    const highRisks = (highRisksRes.data || []).filter(
      (r) => (r.impact || 1) * (r.likelihood || 1) >= 15
    ).length;

    setStats({
      activeDocuments: documentsRes.count || 0,
      openRisks: risksRes.count || 0,
      highPriorityRisks: highRisks,
      pendingAudits: auditsRes.count || 0,
      auditsThisMonth: auditsMonthRes.count || 0,
      openNCs: ncsRes.count || 0,
      closedThisMonth: closedNcsRes.count || 0,
      openCAPAs: capasRes.count || 0,
      trainingDue: trainingRes.count || 0,
    });
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Subscribe to all relevant tables for realtime updates
  useRealtimeSubscription("documents", fetchStats, fetchStats, fetchStats);
  useRealtimeSubscription("risks", fetchStats, fetchStats, fetchStats);
  useRealtimeSubscription("audits", fetchStats, fetchStats, fetchStats);
  useRealtimeSubscription("nonconformities", fetchStats, fetchStats, fetchStats);
  useRealtimeSubscription("capa_actions", fetchStats, fetchStats, fetchStats);
  useRealtimeSubscription("training_records", fetchStats, fetchStats, fetchStats);

  return { stats, loading, refetch: fetchStats };
};

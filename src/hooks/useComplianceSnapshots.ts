import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ComplianceSnapshot {
  id: string;
  snapshot_date: string;
  total_clauses: number;
  compliant_clauses: number;
  non_compliant_clauses: number;
  compliance_percentage: number;
  open_ncs: number;
  open_risks: number;
  open_capas: number;
  training_compliance_pct: number;
  details: Record<string, unknown> | null;
  created_at: string;
}

export function useComplianceSnapshots() {
  const [snapshots, setSnapshots] = useState<ComplianceSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSnapshots = useCallback(async () => {
    try {
      setLoading(true);
      const twelveWeeksAgo = new Date();
      twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

      const { data, error } = await supabase
        .from("compliance_snapshots" as any)
        .select("*")
        .gte("snapshot_date", twelveWeeksAgo.toISOString().split("T")[0])
        .order("snapshot_date", { ascending: true });

      if (error) throw error;
      setSnapshots((data || []) as unknown as ComplianceSnapshot[]);
    } catch (error) {
      console.error("Error fetching snapshots:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a snapshot from current data
  const createSnapshot = useCallback(async () => {
    try {
      // Gather current stats
      const [clausesRes, evidenceRes, linksRes, ncsRes, risksRes, capasRes, trainingRes, trainingTotalRes] = await Promise.all([
        supabase.from("iso_clauses").select("id"),
        supabase.from("clause_evidence").select("clause_id"),
        supabase.from("clause_document_links").select("clause_id"),
        supabase.from("nonconformities").select("id", { count: "exact", head: true }).in("status", ["open", "investigating", "corrective_action", "verification"]),
        supabase.from("risks").select("id", { count: "exact", head: true }).in("status", ["open", "mitigating"]),
        supabase.from("capa_actions").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress", "verification"]),
        supabase.from("training_records").select("id", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("training_records").select("id", { count: "exact", head: true }),
      ]);

      const clauses = clausesRes.data || [];
      const evidenceClauseIds = new Set((evidenceRes.data || []).map((e: any) => e.clause_id));
      const linkClauseIds = new Set((linksRes.data || []).map((l: any) => l.clause_id));

      const total = clauses.length;
      const compliant = clauses.filter((c: any) => evidenceClauseIds.has(c.id) || linkClauseIds.has(c.id)).length;
      const percentage = total > 0 ? Math.round((compliant / total) * 100) : 0;
      const trainingPct = (trainingTotalRes.count || 0) > 0
        ? Math.round(((trainingRes.count || 0) / (trainingTotalRes.count || 1)) * 100)
        : 0;

      const { error } = await supabase.from("compliance_snapshots" as any).insert({
        total_clauses: total,
        compliant_clauses: compliant,
        non_compliant_clauses: total - compliant,
        compliance_percentage: percentage,
        open_ncs: ncsRes.count || 0,
        open_risks: risksRes.count || 0,
        open_capas: capasRes.count || 0,
        training_compliance_pct: trainingPct,
      } as any);

      if (error && error.code !== "23505") throw error; // ignore duplicate date
      await fetchSnapshots();
    } catch (error) {
      console.error("Error creating snapshot:", error);
    }
  }, [fetchSnapshots]);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  return { snapshots, loading, createSnapshot, refetch: fetchSnapshots };
}

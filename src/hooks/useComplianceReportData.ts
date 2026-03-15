import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useClauses } from "./useClauses";
import { generateCompliancePdf } from "@/lib/generateCompliancePdf";
import { useToast } from "./use-toast";

export function useComplianceReportData() {
  const { clauses, getComplianceStats } = useClauses();
  const { toast } = useToast();

  const generatePdfReport = useCallback(async () => {
    try {
      const stats = getComplianceStats();

      // Fetch additional data in parallel
      const [risksRes, ncsRes, capasRes, trainingRes, auditTrailRes] = await Promise.all([
        supabase.from("risks").select("status, impact, likelihood"),
        supabase.from("nonconformities").select("status"),
        supabase.from("capa_actions").select("status"),
        supabase.from("training_records").select("status"),
        supabase.from("clause_audit_trail" as any)
          .select("*, clause:iso_clauses(clause_number)" as any)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      const risks = risksRes.data || [];
      const ncs = ncsRes.data || [];
      const capas = capasRes.data || [];
      const training = trainingRes.data || [];
      const auditTrail = (auditTrailRes.data || []) as any[];

      const clauseData = clauses.map((c) => ({
        clause_number: c.clause_number,
        title: c.title,
        evidenceCount: c.evidence.length,
        documentCount: c.linkedDocuments.length,
        status: (c.evidence.length > 0 || c.linkedDocuments.length > 0 ? "compliant" : "gap") as "compliant" | "gap",
      }));

      generateCompliancePdf({
        clauses: clauseData,
        stats,
        auditTrail: auditTrail.map((a: any) => ({
          ...a,
          clause_number: a.clause?.clause_number,
        })),
        risks: {
          open: risks.filter((r: any) => r.status === "open").length,
          high: risks.filter((r: any) => (r.impact || 1) * (r.likelihood || 1) >= 15).length,
          mitigating: risks.filter((r: any) => r.status === "mitigating").length,
          closed: risks.filter((r: any) => r.status === "closed").length,
        },
        ncs: {
          open: ncs.filter((n: any) => n.status === "open").length,
          investigating: ncs.filter((n: any) => n.status === "investigating").length,
          closed: ncs.filter((n: any) => n.status === "closed").length,
          overdue: ncs.filter((n: any) => ["open", "investigating"].includes(n.status)).length,
        },
        capas: {
          open: capas.filter((c: any) => c.status === "open").length,
          inProgress: capas.filter((c: any) => c.status === "in_progress").length,
          closed: capas.filter((c: any) => c.status === "closed").length,
        },
        training: {
          completed: training.filter((t: any) => t.status === "completed").length,
          overdue: training.filter((t: any) => t.status === "overdue").length,
          inProgress: training.filter((t: any) => t.status === "in_progress").length,
        },
      });

      toast({
        title: "Report Generated",
        description: "Your compliance PDF report has been downloaded.",
      });
    } catch (error: any) {
      toast({
        title: "Error generating report",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [clauses, getComplianceStats, toast]);

  return { generatePdfReport };
}

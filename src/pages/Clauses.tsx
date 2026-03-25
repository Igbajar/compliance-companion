import { useState, useMemo } from "react";
import { Search, Filter, BookOpen, Loader2, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useClauses, ClauseAuditTrail } from "@/hooks/useClauses";
import { useDocuments } from "@/hooks/useDocuments";
import ClauseCard from "@/components/clauses/ClauseCard";
import ClauseCoverageWidget from "@/components/clauses/ClauseCoverageWidget";
import ClauseAuditTrailDialog from "@/components/clauses/ClauseAuditTrailDialog";
import ClauseBulkEvidenceUpload from "@/components/clauses/ClauseBulkEvidenceUpload";

const Clauses = () => {
  const {
    clauses,
    loading,
    uploadEvidence,
    uploadMultipleEvidence,
    deleteEvidence,
    linkDocument,
    unlinkDocument,
    getComplianceStats,
    fetchAuditTrail,
  } = useClauses();
  const { documents } = useDocuments();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [complianceThreshold, setComplianceThreshold] = useState<number>(0);
  const [showThresholdFilter, setShowThresholdFilter] = useState(false);
  // Audit trail state
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);
  const [auditTrailClause, setAuditTrailClause] = useState<{ id: string; title: string } | null>(null);
  const [auditTrail, setAuditTrail] = useState<ClauseAuditTrail[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Bulk upload state
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [bulkUploadClause, setBulkUploadClause] = useState<{ id: string; title: string } | null>(null);

  const stats = getComplianceStats();

  // Filter clauses based on search and status
  const filteredClauses = useMemo(() => {
    return clauses.filter((clause) => {
      const matchesSearch =
        searchQuery === "" ||
        clause.clause_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clause.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (clause.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const hasEvidence = clause.evidence.length > 0 || clause.linkedDocuments.length > 0;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "compliant" && hasEvidence) ||
        (statusFilter === "gap" && !hasEvidence);

      return matchesSearch && matchesStatus;
    });
  }, [clauses, searchQuery, statusFilter]);

  // Group clauses by section and compute section compliance
  const groupedClauses = useMemo(() => {
    const groups: Record<string, typeof filteredClauses> = {};
    filteredClauses.forEach((clause) => {
      const section = clause.clause_number.split(".")[0];
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(clause);
    });
    return groups;
  }, [filteredClauses]);

  // Apply threshold filter at section level
  const thresholdFilteredGroups = useMemo(() => {
    if (complianceThreshold === 0) return groupedClauses;
    const filtered: Record<string, typeof filteredClauses> = {};
    for (const [section, sectionClauses] of Object.entries(groupedClauses)) {
      const compliant = sectionClauses.filter(c => c.evidence.length > 0 || c.linkedDocuments.length > 0).length;
      const pct = sectionClauses.length > 0 ? Math.round((compliant / sectionClauses.length) * 100) : 0;
      if (pct < complianceThreshold) {
        filtered[section] = sectionClauses;
      }
    }
    return filtered;
  }, [groupedClauses, complianceThreshold]);

  const handleOpenAuditTrail = async (clauseId: string, clauseTitle: string) => {
    setAuditTrailClause({ id: clauseId, title: clauseTitle });
    setAuditTrailOpen(true);
    setAuditLoading(true);
    
    const trail = await fetchAuditTrail(clauseId);
    setAuditTrail(trail);
    setAuditLoading(false);
  };

  const handleOpenBulkUpload = (clauseId: string, clauseTitle: string) => {
    setBulkUploadClause({ id: clauseId, title: clauseTitle });
    setBulkUploadOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ISO Clause Mapping</h1>
          <p className="text-muted-foreground mt-1">
            Map documents and evidence to ISO 9001:2015 requirements
          </p>
        </div>
      </div>

      {/* Coverage Widget */}
      <div className="fade-in" style={{ animationDelay: "100ms" }}>
        <ClauseCoverageWidget {...stats} />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 fade-in" style={{ animationDelay: "150ms" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clauses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clauses</SelectItem>
            <SelectItem value="compliant">With Evidence</SelectItem>
            <SelectItem value="gap">Gaps (No Evidence)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clause List */}
      <div className="space-y-6 fade-in" style={{ animationDelay: "200ms" }}>
        {Object.entries(groupedClauses).map(([section, sectionClauses]) => (
          <div key={section} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Section {section}
              </h2>
              <span className="text-sm text-muted-foreground">
                ({sectionClauses.filter(c => c.evidence.length > 0 || c.linkedDocuments.length > 0).length}/{sectionClauses.length} compliant)
              </span>
            </div>
            <div className="space-y-2">
              {sectionClauses.map((clause) => (
                <ClauseCard
                  key={clause.id}
                  clause={clause}
                  allDocuments={documents}
                  onUploadEvidence={uploadEvidence}
                  onDeleteEvidence={deleteEvidence}
                  onLinkDocument={linkDocument}
                  onUnlinkDocument={unlinkDocument}
                  onOpenAuditTrail={() => handleOpenAuditTrail(clause.id, `${clause.clause_number} - ${clause.title}`)}
                  onOpenBulkUpload={() => handleOpenBulkUpload(clause.id, `${clause.clause_number} - ${clause.title}`)}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredClauses.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No clauses found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Audit Trail Dialog */}
      <ClauseAuditTrailDialog
        open={auditTrailOpen}
        onOpenChange={setAuditTrailOpen}
        clauseTitle={auditTrailClause?.title || ""}
        auditTrail={auditTrail}
        loading={auditLoading}
      />

      {/* Bulk Upload Dialog */}
      {bulkUploadClause && (
        <ClauseBulkEvidenceUpload
          open={bulkUploadOpen}
          onOpenChange={setBulkUploadOpen}
          clauseTitle={bulkUploadClause.title}
          onUpload={(files, description) => uploadMultipleEvidence(bulkUploadClause.id, files, description)}
        />
      )}
    </div>
  );
};

export default Clauses;

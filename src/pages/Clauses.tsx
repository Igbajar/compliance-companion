import { useState } from "react";
import { BookOpen, ChevronRight, FileText, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Clause {
  id: string;
  number: string;
  title: string;
  status: "compliant" | "partial" | "non-compliant" | "not-applicable";
  documents: number;
  risks: number;
  evidence: string[];
  owner: string;
}

interface ClauseSection {
  number: string;
  title: string;
  clauses: Clause[];
}

const iso9001Sections: ClauseSection[] = [
  {
    number: "4",
    title: "Context of the Organization",
    clauses: [
      { id: "4.1", number: "4.1", title: "Understanding the organization and its context", status: "compliant", documents: 3, risks: 2, evidence: ["Context Analysis Report", "SWOT Analysis"], owner: "Quality Manager" },
      { id: "4.2", number: "4.2", title: "Understanding the needs and expectations of interested parties", status: "compliant", documents: 2, risks: 1, evidence: ["Stakeholder Register", "Requirements Matrix"], owner: "Quality Manager" },
      { id: "4.3", number: "4.3", title: "Determining the scope of the QMS", status: "compliant", documents: 1, risks: 0, evidence: ["QMS Scope Statement"], owner: "Quality Manager" },
      { id: "4.4", number: "4.4", title: "Quality management system and its processes", status: "partial", documents: 5, risks: 1, evidence: ["Process Map", "Process Descriptions"], owner: "Quality Manager" },
    ],
  },
  {
    number: "5",
    title: "Leadership",
    clauses: [
      { id: "5.1", number: "5.1", title: "Leadership and commitment", status: "compliant", documents: 2, risks: 0, evidence: ["Management Review Minutes", "Quality Policy"], owner: "CEO" },
      { id: "5.2", number: "5.2", title: "Policy", status: "compliant", documents: 1, risks: 0, evidence: ["Quality Policy"], owner: "CEO" },
      { id: "5.3", number: "5.3", title: "Organizational roles, responsibilities and authorities", status: "compliant", documents: 3, risks: 0, evidence: ["Organization Chart", "Job Descriptions", "RACI Matrix"], owner: "HR Manager" },
    ],
  },
  {
    number: "6",
    title: "Planning",
    clauses: [
      { id: "6.1", number: "6.1", title: "Actions to address risks and opportunities", status: "partial", documents: 4, risks: 5, evidence: ["Risk Register", "Opportunity Log"], owner: "Quality Manager" },
      { id: "6.2", number: "6.2", title: "Quality objectives and planning to achieve them", status: "compliant", documents: 2, risks: 0, evidence: ["Quality Objectives", "KPI Dashboard"], owner: "Quality Manager" },
      { id: "6.3", number: "6.3", title: "Planning of changes", status: "non-compliant", documents: 1, risks: 2, evidence: ["Change Control Procedure"], owner: "Quality Manager" },
    ],
  },
  {
    number: "7",
    title: "Support",
    clauses: [
      { id: "7.1", number: "7.1", title: "Resources", status: "compliant", documents: 6, risks: 1, evidence: ["Resource Plan", "Infrastructure List", "Calibration Records"], owner: "Operations Manager" },
      { id: "7.2", number: "7.2", title: "Competence", status: "partial", documents: 3, risks: 1, evidence: ["Training Matrix", "Competence Records"], owner: "HR Manager" },
      { id: "7.3", number: "7.3", title: "Awareness", status: "compliant", documents: 2, risks: 0, evidence: ["Induction Records", "Training Materials"], owner: "HR Manager" },
      { id: "7.4", number: "7.4", title: "Communication", status: "compliant", documents: 2, risks: 0, evidence: ["Communication Plan", "Meeting Minutes"], owner: "Quality Manager" },
      { id: "7.5", number: "7.5", title: "Documented information", status: "compliant", documents: 4, risks: 0, evidence: ["Document Control Procedure", "Records Procedure"], owner: "Quality Manager" },
    ],
  },
];

const getStatusIcon = (status: Clause["status"]) => {
  switch (status) {
    case "compliant":
      return CheckCircle2;
    case "partial":
      return AlertTriangle;
    case "non-compliant":
      return XCircle;
    default:
      return FileText;
  }
};

const getStatusStyle = (status: Clause["status"]) => {
  switch (status) {
    case "compliant":
      return "text-success bg-success/20";
    case "partial":
      return "text-warning bg-warning/20";
    case "non-compliant":
      return "text-destructive bg-destructive/20";
    case "not-applicable":
      return "text-muted-foreground bg-muted";
    default:
      return "";
  }
};

const Clauses = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(["4", "5", "6", "7"]);
  const [selectedStandard, setSelectedStandard] = useState("ISO 9001:2015");

  const toggleSection = (sectionNumber: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionNumber)
        ? prev.filter((s) => s !== sectionNumber)
        : [...prev, sectionNumber]
    );
  };

  const allClauses = iso9001Sections.flatMap((s) => s.clauses);
  const compliantCount = allClauses.filter((c) => c.status === "compliant").length;
  const partialCount = allClauses.filter((c) => c.status === "partial").length;
  const nonCompliantCount = allClauses.filter((c) => c.status === "non-compliant").length;
  const compliancePercentage = Math.round((compliantCount / allClauses.length) * 100);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clause Mapping</h1>
          <p className="text-muted-foreground mt-1">
            Map documents, evidence, and processes to ISO standard clauses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedStandard}
            onChange={(e) => setSelectedStandard(e.target.value)}
            className="h-10 px-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="ISO 9001:2015">ISO 9001:2015</option>
            <option value="ISO 27001:2022">ISO 27001:2022</option>
            <option value="ISO 14001:2015">ISO 14001:2015</option>
            <option value="ISO 45001:2018">ISO 45001:2018</option>
          </select>
          <Button variant="gradient">
            Export Gap Analysis
          </Button>
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 fade-in" style={{ animationDelay: "100ms" }}>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Overall Compliance</span>
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-end gap-2">
            <span className="metric-value">{compliancePercentage}%</span>
            <span className="text-sm text-muted-foreground mb-1">of clauses</span>
          </div>
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-info transition-all duration-500"
              style={{ width: `${compliancePercentage}%` }}
            />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Compliant</span>
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <p className="text-3xl font-bold text-success">{compliantCount}</p>
          <p className="text-xs text-muted-foreground mt-1">clauses fully met</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Partial</span>
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <p className="text-3xl font-bold text-warning">{partialCount}</p>
          <p className="text-xs text-muted-foreground mt-1">need attention</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Non-Compliant</span>
            <XCircle className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-3xl font-bold text-destructive">{nonCompliantCount}</p>
          <p className="text-xs text-muted-foreground mt-1">gaps identified</p>
        </div>
      </div>

      {/* Clause Sections */}
      <div className="space-y-4 fade-in" style={{ animationDelay: "200ms" }}>
        {iso9001Sections.map((section) => {
          const isExpanded = expandedSections.includes(section.number);
          const sectionCompliant = section.clauses.filter((c) => c.status === "compliant").length;
          const sectionTotal = section.clauses.length;

          return (
            <div key={section.number} className="glass-card overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.number)}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-foreground">
                      {section.number}. {section.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {sectionCompliant}/{sectionTotal} clauses compliant
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success transition-all duration-300"
                      style={{ width: `${(sectionCompliant / sectionTotal) * 100}%` }}
                    />
                  </div>
                  <ChevronRight
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform",
                      isExpanded && "rotate-90"
                    )}
                  />
                </div>
              </button>

              {/* Clauses */}
              {isExpanded && (
                <div className="border-t border-border">
                  {section.clauses.map((clause) => {
                    const StatusIcon = getStatusIcon(clause.status);
                    return (
                      <div
                        key={clause.id}
                        className="flex items-center justify-between p-4 border-b border-border/50 last:border-b-0 hover:bg-secondary/20 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-lg", getStatusStyle(clause.status))}>
                            <StatusIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {clause.number} {clause.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {clause.documents} documents
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {clause.risks} risks
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                Owner: {clause.owner}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn("status-badge capitalize", getStatusStyle(clause.status))}>
                            {clause.status.replace("-", " ")}
                          </span>
                          <Button variant="ghost" size="sm">
                            View Evidence
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Clauses;

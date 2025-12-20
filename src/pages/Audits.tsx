import { useState } from "react";
import { ClipboardCheck, Plus, Calendar, User, MapPin, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Audit {
  id: string;
  number: string;
  title: string;
  type: "internal" | "external" | "surveillance" | "certification";
  standard: string;
  status: "planned" | "in-progress" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  leadAuditor: string;
  department: string;
  findings: {
    major: number;
    minor: number;
    observations: number;
  };
}

const audits: Audit[] = [
  {
    id: "1",
    number: "AUD-2024-012",
    title: "ISO 9001 Internal Audit - Production",
    type: "internal",
    standard: "ISO 9001:2015",
    status: "completed",
    startDate: "2024-12-10",
    endDate: "2024-12-12",
    leadAuditor: "Sarah Johnson",
    department: "Production",
    findings: { major: 0, minor: 3, observations: 5 },
  },
  {
    id: "2",
    number: "AUD-2024-013",
    title: "ISO 27001 Surveillance Audit",
    type: "surveillance",
    standard: "ISO 27001:2022",
    status: "planned",
    startDate: "2024-12-28",
    endDate: "2024-12-30",
    leadAuditor: "BSI Auditor",
    department: "IT & Security",
    findings: { major: 0, minor: 0, observations: 0 },
  },
  {
    id: "3",
    number: "AUD-2024-014",
    title: "ISO 14001 Internal Audit - Facilities",
    type: "internal",
    standard: "ISO 14001:2015",
    status: "in-progress",
    startDate: "2024-12-18",
    endDate: "2024-12-20",
    leadAuditor: "Mike Chen",
    department: "Facilities",
    findings: { major: 1, minor: 2, observations: 3 },
  },
  {
    id: "4",
    number: "AUD-2025-001",
    title: "ISO 45001 Certification Audit",
    type: "certification",
    standard: "ISO 45001:2018",
    status: "planned",
    startDate: "2025-01-15",
    endDate: "2025-01-18",
    leadAuditor: "TÜV Auditor",
    department: "Organization-wide",
    findings: { major: 0, minor: 0, observations: 0 },
  },
];

const getStatusStyle = (status: Audit["status"]) => {
  switch (status) {
    case "completed":
      return "status-compliant";
    case "in-progress":
      return "status-partial";
    case "planned":
      return "status-open";
    case "cancelled":
      return "status-non-compliant";
    default:
      return "";
  }
};

const getTypeStyle = (type: Audit["type"]) => {
  switch (type) {
    case "internal":
      return "bg-primary/20 text-primary";
    case "external":
      return "bg-info/20 text-info";
    case "surveillance":
      return "bg-warning/20 text-warning";
    case "certification":
      return "bg-success/20 text-success";
    default:
      return "";
  }
};

const Audits = () => {
  const [view, setView] = useState<"list" | "calendar">("list");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Management</h1>
          <p className="text-muted-foreground mt-1">
            Plan, execute, and track internal and external audits
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-secondary rounded-lg p-1">
            <button
              onClick={() => setView("list")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                view === "calendar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Calendar
            </button>
          </div>
          <Button variant="gradient">
            <Plus className="w-4 h-4" />
            Schedule Audit
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 fade-in" style={{ animationDelay: "100ms" }}>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/20">
              <Calendar className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {audits.filter((a) => a.status === "planned").length}
              </p>
              <p className="text-xs text-muted-foreground">Planned</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {audits.filter((a) => a.status === "in-progress").length}
              </p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/20">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {audits.filter((a) => a.status === "completed").length}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {audits.reduce((acc, a) => acc + a.findings.major, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Major Findings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audits List */}
      <div className="space-y-4 fade-in" style={{ animationDelay: "200ms" }}>
        {audits.map((audit) => (
          <div key={audit.id} className="glass-card p-6 hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-secondary">
                  <ClipboardCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{audit.title}</h3>
                    <span className={cn("status-badge capitalize", getTypeStyle(audit.type))}>
                      {audit.type}
                    </span>
                    <span className={cn("status-badge capitalize", getStatusStyle(audit.status))}>
                      {audit.status.replace("-", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {audit.number} • {audit.standard}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{audit.startDate} - {audit.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{audit.leadAuditor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{audit.department}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Findings Summary */}
              {audit.status === "completed" || audit.status === "in-progress" ? (
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-destructive">{audit.findings.major}</p>
                    <p className="text-xs text-muted-foreground">Major</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-warning">{audit.findings.minor}</p>
                    <p className="text-xs text-muted-foreground">Minor</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-info">{audit.findings.observations}</p>
                    <p className="text-xs text-muted-foreground">Obs</p>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Audits;

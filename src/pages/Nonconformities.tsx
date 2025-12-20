import { useState } from "react";
import { XCircle, Plus, Search, Filter, Eye, Edit, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NC {
  id: string;
  number: string;
  title: string;
  type: "major" | "minor" | "observation";
  source: "audit" | "customer" | "internal" | "supplier";
  status: "open" | "investigating" | "correcting" | "verifying" | "closed";
  owner: string;
  department: string;
  openDate: string;
  dueDate: string;
  clause: string;
  rootCause?: string;
}

const nonconformities: NC[] = [
  {
    id: "1",
    number: "NC-2024-042",
    title: "Missing calibration records for measuring equipment",
    type: "minor",
    source: "audit",
    status: "correcting",
    owner: "Mike Chen",
    department: "Production",
    openDate: "2024-12-10",
    dueDate: "2024-12-30",
    clause: "7.1.5",
    rootCause: "Calibration schedule not updated after new equipment added",
  },
  {
    id: "2",
    number: "NC-2024-043",
    title: "Customer complaint - Product quality defect",
    type: "major",
    source: "customer",
    status: "investigating",
    owner: "Sarah Johnson",
    department: "Quality",
    openDate: "2024-12-15",
    dueDate: "2025-01-05",
    clause: "8.5.1",
  },
  {
    id: "3",
    number: "NC-2024-044",
    title: "Incomplete training records for new staff",
    type: "minor",
    source: "internal",
    status: "open",
    owner: "Emily Davis",
    department: "HR",
    openDate: "2024-12-18",
    dueDate: "2025-01-15",
    clause: "7.2",
  },
  {
    id: "4",
    number: "NC-2024-041",
    title: "Document control procedure not followed",
    type: "minor",
    source: "audit",
    status: "verifying",
    owner: "John Smith",
    department: "Quality",
    openDate: "2024-12-05",
    dueDate: "2024-12-25",
    clause: "7.5",
    rootCause: "Staff not aware of updated procedure",
  },
  {
    id: "5",
    number: "NC-2024-040",
    title: "Supplier quality issues",
    type: "observation",
    source: "supplier",
    status: "closed",
    owner: "Lisa Wang",
    department: "Procurement",
    openDate: "2024-11-20",
    dueDate: "2024-12-10",
    clause: "8.4",
    rootCause: "Supplier process capability insufficient",
  },
];

const getTypeStyle = (type: NC["type"]) => {
  switch (type) {
    case "major":
      return "bg-destructive/20 text-destructive";
    case "minor":
      return "bg-warning/20 text-warning";
    case "observation":
      return "bg-info/20 text-info";
    default:
      return "";
  }
};

const getStatusStyle = (status: NC["status"]) => {
  switch (status) {
    case "open":
      return "bg-destructive/20 text-destructive";
    case "investigating":
      return "bg-warning/20 text-warning";
    case "correcting":
      return "bg-info/20 text-info";
    case "verifying":
      return "bg-primary/20 text-primary";
    case "closed":
      return "bg-success/20 text-success";
    default:
      return "";
  }
};

const getSourceStyle = (source: NC["source"]) => {
  switch (source) {
    case "audit":
      return "bg-primary/20 text-primary";
    case "customer":
      return "bg-destructive/20 text-destructive";
    case "internal":
      return "bg-info/20 text-info";
    case "supplier":
      return "bg-warning/20 text-warning";
    default:
      return "";
  }
};

const Nonconformities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredNCs = nonconformities.filter((nc) => {
    const matchesSearch =
      nc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nc.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || nc.type === selectedType;
    const matchesStatus = selectedStatus === "all" || nc.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const openNCs = nonconformities.filter((nc) => nc.status !== "closed");
  const overdueNCs = openNCs.filter((nc) => new Date(nc.dueDate) < new Date());

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nonconformity Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and resolve nonconformities with root cause analysis
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="w-4 h-4" />
          Log NC
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 fade-in" style={{ animationDelay: "100ms" }}>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Open</span>
            <XCircle className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{openNCs.length}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Major</span>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold text-destructive mt-2">
            {nonconformities.filter((nc) => nc.type === "major" && nc.status !== "closed").length}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Minor</span>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-bold text-warning mt-2">
            {nonconformities.filter((nc) => nc.type === "minor" && nc.status !== "closed").length}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overdue</span>
            <Clock className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold text-destructive mt-2">{overdueNCs.length}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Closed (Month)</span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold text-success mt-2">
            {nonconformities.filter((nc) => nc.status === "closed").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 fade-in" style={{ animationDelay: "150ms" }}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search nonconformities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-10 px-3 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Types</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="observation">Observation</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 px-3 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="correcting">Correcting</option>
              <option value="verifying">Verifying</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* NC List */}
      <div className="space-y-4 fade-in" style={{ animationDelay: "200ms" }}>
        {filteredNCs.map((nc) => {
          const isOverdue = nc.status !== "closed" && new Date(nc.dueDate) < new Date();
          return (
            <div
              key={nc.id}
              className={cn(
                "glass-card p-6 transition-all",
                isOverdue && "border-destructive/50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    nc.type === "major" ? "bg-destructive/20" : nc.type === "minor" ? "bg-warning/20" : "bg-info/20"
                  )}>
                    <XCircle className={cn(
                      "w-6 h-6",
                      nc.type === "major" ? "text-destructive" : nc.type === "minor" ? "text-warning" : "text-info"
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{nc.title}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-sm text-muted-foreground">{nc.number}</span>
                      <span className={cn("status-badge capitalize", getTypeStyle(nc.type))}>
                        {nc.type}
                      </span>
                      <span className={cn("status-badge capitalize", getSourceStyle(nc.source))}>
                        {nc.source}
                      </span>
                      <span className={cn("status-badge capitalize", getStatusStyle(nc.status))}>
                        {nc.status}
                      </span>
                      {isOverdue && (
                        <span className="status-badge bg-destructive text-destructive-foreground">
                          Overdue
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>Owner: {nc.owner}</span>
                      <span>•</span>
                      <span>{nc.department}</span>
                      <span>•</span>
                      <span>Clause: {nc.clause}</span>
                      <span>•</span>
                      <span>Due: {nc.dueDate}</span>
                    </div>
                    {nc.rootCause && (
                      <div className="mt-3 p-3 rounded-lg bg-secondary/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Root Cause:</p>
                        <p className="text-sm text-foreground">{nc.rootCause}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Nonconformities;

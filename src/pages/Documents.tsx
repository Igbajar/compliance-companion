import { useState } from "react";
import { FileText, Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, Clock, XCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  number: string;
  title: string;
  type: "policy" | "procedure" | "work-instruction" | "form" | "record";
  version: string;
  status: "draft" | "in-review" | "approved" | "obsolete";
  owner: string;
  department: string;
  lastUpdated: string;
  clause: string;
}

const documents: Document[] = [
  {
    id: "1",
    number: "QMS-POL-001",
    title: "Quality Policy",
    type: "policy",
    version: "3.0",
    status: "approved",
    owner: "John Smith",
    department: "Quality",
    lastUpdated: "2024-12-01",
    clause: "5.2",
  },
  {
    id: "2",
    number: "QMS-PRO-015",
    title: "Document Control Procedure",
    type: "procedure",
    version: "2.1",
    status: "approved",
    owner: "Sarah Johnson",
    department: "Quality",
    lastUpdated: "2024-11-28",
    clause: "7.5",
  },
  {
    id: "3",
    number: "QMS-WI-042",
    title: "Internal Audit Process",
    type: "work-instruction",
    version: "1.5",
    status: "in-review",
    owner: "Mike Chen",
    department: "Quality",
    lastUpdated: "2024-12-18",
    clause: "9.2",
  },
  {
    id: "4",
    number: "QMS-FRM-108",
    title: "Corrective Action Request Form",
    type: "form",
    version: "4.0",
    status: "approved",
    owner: "Emily Davis",
    department: "Quality",
    lastUpdated: "2024-10-15",
    clause: "10.2",
  },
  {
    id: "5",
    number: "ISMS-POL-001",
    title: "Information Security Policy",
    type: "policy",
    version: "2.0",
    status: "draft",
    owner: "David Lee",
    department: "IT Security",
    lastUpdated: "2024-12-19",
    clause: "A.5",
  },
  {
    id: "6",
    number: "EMS-PRO-003",
    title: "Environmental Aspects Procedure",
    type: "procedure",
    version: "1.2",
    status: "approved",
    owner: "Lisa Wang",
    department: "HSE",
    lastUpdated: "2024-09-20",
    clause: "6.1.2",
  },
];

const getStatusStyle = (status: Document["status"]) => {
  switch (status) {
    case "approved":
      return "status-compliant";
    case "in-review":
      return "status-partial";
    case "draft":
      return "status-open";
    case "obsolete":
      return "status-non-compliant";
    default:
      return "";
  }
};

const getStatusIcon = (status: Document["status"]) => {
  switch (status) {
    case "approved":
      return CheckCircle;
    case "in-review":
      return Clock;
    case "draft":
      return Edit;
    case "obsolete":
      return XCircle;
    default:
      return FileText;
  }
};

const getTypeStyle = (type: Document["type"]) => {
  switch (type) {
    case "policy":
      return "bg-primary/20 text-primary";
    case "procedure":
      return "bg-info/20 text-info";
    case "work-instruction":
      return "bg-success/20 text-success";
    case "form":
      return "bg-warning/20 text-warning";
    case "record":
      return "bg-muted text-muted-foreground";
    default:
      return "";
  }
};

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || doc.type === selectedType;
    const matchesStatus = selectedStatus === "all" || doc.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Control</h1>
          <p className="text-muted-foreground mt-1">
            Manage your ISO documents with version control and approval workflows
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="w-4 h-4" />
          New Document
        </Button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 fade-in" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documents..."
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
              <option value="policy">Policy</option>
              <option value="procedure">Procedure</option>
              <option value="work-instruction">Work Instruction</option>
              <option value="form">Form</option>
              <option value="record">Record</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 px-3 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="in-review">In Review</option>
              <option value="approved">Approved</option>
              <option value="obsolete">Obsolete</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="glass-card overflow-hidden fade-in" style={{ animationDelay: "200ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Document
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Version
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Owner
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Clause
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => {
                const StatusIcon = getStatusIcon(doc.status);
                return (
                  <tr key={doc.id} className="table-row">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn("status-badge capitalize", getTypeStyle(doc.type))}>
                        {doc.type.replace("-", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-foreground">v{doc.version}</span>
                    </td>
                    <td className="p-4">
                      <span className={cn("status-badge capitalize flex items-center gap-1.5", getStatusStyle(doc.status))}>
                        <StatusIcon className="w-3 h-3" />
                        {doc.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{doc.owner}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-primary font-medium">{doc.clause}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{doc.lastUpdated}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Documents;

import { useState } from "react";
import { AlertTriangle, Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Risk {
  id: string;
  number: string;
  title: string;
  category: "strategic" | "operational" | "compliance" | "financial" | "security";
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  owner: string;
  status: "open" | "mitigating" | "accepted" | "closed";
  mitigation: string;
  dueDate: string;
  clause: string;
}

const risks: Risk[] = [
  {
    id: "1",
    number: "RSK-001",
    title: "Critical Supplier Failure",
    category: "operational",
    likelihood: 3,
    impact: 5,
    owner: "John Smith",
    status: "mitigating",
    mitigation: "Develop backup supplier list and qualification process",
    dueDate: "2025-01-15",
    clause: "8.4",
  },
  {
    id: "2",
    number: "RSK-002",
    title: "Data Breach - Customer PII",
    category: "security",
    likelihood: 2,
    impact: 5,
    owner: "David Lee",
    status: "mitigating",
    mitigation: "Implement encryption and access controls",
    dueDate: "2024-12-30",
    clause: "A.8.24",
  },
  {
    id: "3",
    number: "RSK-003",
    title: "Regulatory Non-Compliance",
    category: "compliance",
    likelihood: 2,
    impact: 4,
    owner: "Sarah Johnson",
    status: "open",
    mitigation: "Monthly compliance reviews and updates",
    dueDate: "2025-02-01",
    clause: "4.2",
  },
  {
    id: "4",
    number: "RSK-004",
    title: "Key Staff Turnover",
    category: "operational",
    likelihood: 4,
    impact: 3,
    owner: "Emily Davis",
    status: "accepted",
    mitigation: "Cross-training program and succession planning",
    dueDate: "2025-03-01",
    clause: "7.2",
  },
  {
    id: "5",
    number: "RSK-005",
    title: "Equipment Failure - Production Line",
    category: "operational",
    likelihood: 3,
    impact: 4,
    owner: "Mike Chen",
    status: "mitigating",
    mitigation: "Preventive maintenance schedule",
    dueDate: "2025-01-10",
    clause: "7.1.3",
  },
];

const getRiskScore = (likelihood: number, impact: number) => likelihood * impact;

const getRiskLevel = (score: number) => {
  if (score >= 15) return { label: "Critical", color: "text-destructive", bg: "bg-destructive/20" };
  if (score >= 8) return { label: "High", color: "text-warning", bg: "bg-warning/20" };
  if (score >= 4) return { label: "Medium", color: "text-info", bg: "bg-info/20" };
  return { label: "Low", color: "text-success", bg: "bg-success/20" };
};

const getStatusStyle = (status: Risk["status"]) => {
  switch (status) {
    case "open":
      return "status-open";
    case "mitigating":
      return "status-partial";
    case "accepted":
      return "status-compliant";
    case "closed":
      return "bg-muted text-muted-foreground";
    default:
      return "";
  }
};

const getCategoryStyle = (category: Risk["category"]) => {
  switch (category) {
    case "strategic":
      return "bg-primary/20 text-primary";
    case "operational":
      return "bg-info/20 text-info";
    case "compliance":
      return "bg-warning/20 text-warning";
    case "financial":
      return "bg-success/20 text-success";
    case "security":
      return "bg-destructive/20 text-destructive";
    default:
      return "";
  }
};

const Risks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredRisks = risks.filter((risk) => {
    const matchesSearch =
      risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || risk.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || risk.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Risk Register</h1>
          <p className="text-muted-foreground mt-1">
            Identify, assess, and manage organizational risks
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="w-4 h-4" />
          New Risk
        </Button>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 fade-in" style={{ animationDelay: "100ms" }}>
        {[
          { label: "Critical", count: risks.filter((r) => getRiskScore(r.likelihood, r.impact) >= 15).length, color: "text-destructive", bg: "bg-destructive/20" },
          { label: "High", count: risks.filter((r) => getRiskScore(r.likelihood, r.impact) >= 8 && getRiskScore(r.likelihood, r.impact) < 15).length, color: "text-warning", bg: "bg-warning/20" },
          { label: "Medium", count: risks.filter((r) => getRiskScore(r.likelihood, r.impact) >= 4 && getRiskScore(r.likelihood, r.impact) < 8).length, color: "text-info", bg: "bg-info/20" },
          { label: "Low", count: risks.filter((r) => getRiskScore(r.likelihood, r.impact) < 4).length, color: "text-success", bg: "bg-success/20" },
        ].map((item) => (
          <div key={item.label} className="glass-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{item.label} Risks</span>
              <span className={cn("text-2xl font-bold", item.color)}>{item.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 fade-in" style={{ animationDelay: "150ms" }}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search risks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Categories</option>
              <option value="strategic">Strategic</option>
              <option value="operational">Operational</option>
              <option value="compliance">Compliance</option>
              <option value="financial">Financial</option>
              <option value="security">Security</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 px-3 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="mitigating">Mitigating</option>
              <option value="accepted">Accepted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Risks Table */}
      <div className="glass-card overflow-hidden fade-in" style={{ animationDelay: "200ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Risk
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="text-center p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  L × I
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Level
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Owner
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Due Date
                </th>
                <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.map((risk) => {
                const score = getRiskScore(risk.likelihood, risk.impact);
                const level = getRiskLevel(score);
                return (
                  <tr key={risk.id} className="table-row">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <AlertTriangle className="w-4 h-4 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{risk.title}</p>
                          <p className="text-xs text-muted-foreground">{risk.number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn("status-badge capitalize", getCategoryStyle(risk.category))}>
                        {risk.category}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-mono">
                        {risk.likelihood} × {risk.impact} = <span className="font-bold">{score}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn("status-badge", level.bg, level.color)}>
                        {level.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn("status-badge capitalize", getStatusStyle(risk.status))}>
                        {risk.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{risk.owner}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{risk.dueDate}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
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

export default Risks;

import { useState, useEffect } from "react";
import { AlertTriangle, Plus, Search, Filter, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRisks, Risk } from "@/hooks/useRisks";
import { RiskFormDialog } from "@/components/risks/RiskFormDialog";
import { DeleteRiskDialog } from "@/components/risks/DeleteRiskDialog";
import { useToast } from "@/hooks/use-toast";

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
    case "technical":
      return "bg-destructive/20 text-destructive";
    default:
      return "";
  }
};

const Risks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { fetchRisks, createRisk, updateRisk, deleteRisk } = useRisks();
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchRisks();
      setRisks(data);
    } catch (error) {
      toast({ title: "Error loading risks", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (data: any) => {
    try {
      await createRisk(data);
      toast({ title: "Risk created successfully" });
      loadData();
    } catch (error) {
      toast({ title: "Error creating risk", variant: "destructive" });
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedRisk) return;
    try {
      await updateRisk(selectedRisk.id, data);
      toast({ title: "Risk updated successfully" });
      loadData();
    } catch (error) {
      toast({ title: "Error updating risk", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!selectedRisk) return;
    try {
      await deleteRisk(selectedRisk.id);
      toast({ title: "Risk deleted successfully" });
      setDeleteOpen(false);
      setSelectedRisk(null);
      loadData();
    } catch (error) {
      toast({ title: "Error deleting risk", variant: "destructive" });
    }
  };

  const openCreateForm = () => {
    setSelectedRisk(null);
    setIsEditing(false);
    setFormOpen(true);
  };

  const openEditForm = (risk: Risk) => {
    setSelectedRisk(risk);
    setIsEditing(true);
    setFormOpen(true);
  };

  const openDeleteDialog = (risk: Risk) => {
    setSelectedRisk(risk);
    setDeleteOpen(true);
  };

  const filteredRisks = risks.filter((risk) => {
    const matchesSearch =
      risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (risk.risk_number?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === "all" || risk.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || risk.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <Button variant="gradient" onClick={openCreateForm}>
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
              <option value="technical">Technical</option>
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
                  Due Date
                </th>
                <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No risks found
                  </td>
                </tr>
              ) : (
                filteredRisks.map((risk) => {
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
                            {risk.risk_number && (
                              <p className="text-xs text-muted-foreground">{risk.risk_number}</p>
                            )}
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
                        <span className="text-sm text-muted-foreground">{risk.due_date || "-"}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(risk)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDeleteDialog(risk)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RiskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={isEditing ? handleUpdate : handleCreate}
        defaultValues={selectedRisk || undefined}
        isEditing={isEditing}
      />

      <DeleteRiskDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        riskTitle={selectedRisk?.title || ""}
      />
    </div>
  );
};

export default Risks;

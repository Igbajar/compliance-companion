import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  GripVertical, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Target,
  BarChart3,
  ClipboardCheck,
  ArrowUp,
  ArrowDown,
  Minus,
  PlayCircle,
  PauseCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Types
interface AgendaItem {
  id: string;
  title: string;
  duration: number;
  presenter: string;
  type: "input" | "review" | "action" | "decision";
  status: "pending" | "in-progress" | "completed";
  notes: string;
}

interface KPI {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}

interface Decision {
  id: string;
  meetingId: string;
  meetingDate: string;
  title: string;
  description: string;
  owner: string;
  dueDate: string;
  status: "open" | "in-progress" | "completed" | "overdue";
  priority: "high" | "medium" | "low";
}

interface Meeting {
  id: string;
  date: string;
  title: string;
  status: "scheduled" | "in-progress" | "completed";
  attendees: number;
  decisionsCount: number;
}

// Sample Data
const sampleAgendaItems: AgendaItem[] = [
  { id: "1", title: "QMS Performance Review", duration: 20, presenter: "Quality Manager", type: "review", status: "pending", notes: "" },
  { id: "2", title: "Customer Feedback Analysis", duration: 15, presenter: "Customer Service Lead", type: "input", status: "pending", notes: "" },
  { id: "3", title: "Audit Findings Summary", duration: 25, presenter: "Internal Auditor", type: "review", status: "pending", notes: "" },
  { id: "4", title: "Resource Requirements", duration: 15, presenter: "HR Manager", type: "decision", status: "pending", notes: "" },
  { id: "5", title: "Improvement Opportunities", duration: 20, presenter: "Process Owner", type: "action", status: "pending", notes: "" },
];

const sampleKPIs: KPI[] = [
  { id: "1", name: "Customer Satisfaction Score", category: "Customer", currentValue: 87, targetValue: 90, unit: "%", trend: "up", lastUpdated: "2024-01-15" },
  { id: "2", name: "NC Closure Rate", category: "Quality", currentValue: 92, targetValue: 95, unit: "%", trend: "up", lastUpdated: "2024-01-15" },
  { id: "3", name: "Audit Compliance", category: "Compliance", currentValue: 88, targetValue: 85, unit: "%", trend: "stable", lastUpdated: "2024-01-14" },
  { id: "4", name: "Training Completion", category: "People", currentValue: 78, targetValue: 90, unit: "%", trend: "down", lastUpdated: "2024-01-15" },
  { id: "5", name: "CAPA On-Time Closure", category: "Quality", currentValue: 85, targetValue: 90, unit: "%", trend: "up", lastUpdated: "2024-01-14" },
  { id: "6", name: "Document Review Timeliness", category: "Process", currentValue: 91, targetValue: 85, unit: "%", trend: "up", lastUpdated: "2024-01-15" },
  { id: "7", name: "Risk Mitigation Rate", category: "Risk", currentValue: 76, targetValue: 80, unit: "%", trend: "down", lastUpdated: "2024-01-13" },
  { id: "8", name: "Process Efficiency", category: "Process", currentValue: 82, targetValue: 85, unit: "%", trend: "stable", lastUpdated: "2024-01-15" },
];

const sampleDecisions: Decision[] = [
  { id: "1", meetingId: "MR-2024-001", meetingDate: "2024-01-15", title: "Implement new document control system", description: "Approve budget for new DMS implementation", owner: "IT Manager", dueDate: "2024-03-01", status: "in-progress", priority: "high" },
  { id: "2", meetingId: "MR-2024-001", meetingDate: "2024-01-15", title: "Increase training frequency", description: "Quarterly training sessions for all staff", owner: "HR Manager", dueDate: "2024-02-15", status: "completed", priority: "medium" },
  { id: "3", meetingId: "MR-2023-012", meetingDate: "2023-12-18", title: "Review supplier performance criteria", description: "Update supplier evaluation metrics", owner: "Procurement Lead", dueDate: "2024-01-31", status: "overdue", priority: "high" },
  { id: "4", meetingId: "MR-2024-001", meetingDate: "2024-01-15", title: "Allocate resources for audit preparation", description: "Assign team for upcoming external audit", owner: "Quality Manager", dueDate: "2024-02-28", status: "open", priority: "medium" },
];

const sampleMeetings: Meeting[] = [
  { id: "MR-2024-002", date: "2024-02-15", title: "Q1 2024 Management Review", status: "scheduled", attendees: 8, decisionsCount: 0 },
  { id: "MR-2024-001", date: "2024-01-15", title: "Q4 2023 Review & 2024 Planning", status: "completed", attendees: 10, decisionsCount: 4 },
  { id: "MR-2023-012", date: "2023-12-18", title: "Year-End Review", status: "completed", attendees: 12, decisionsCount: 6 },
];

const ManagementReview = () => {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(sampleAgendaItems);
  const [kpis] = useState<KPI[]>(sampleKPIs);
  const [decisions] = useState<Decision[]>(sampleDecisions);
  const [meetings] = useState<Meeting[]>(sampleMeetings);
  const [newAgendaItem, setNewAgendaItem] = useState<{ title: string; duration: number; presenter: string; type: AgendaItem["type"] }>({ title: "", duration: 15, presenter: "", type: "review" });
  const [isAddAgendaOpen, setIsAddAgendaOpen] = useState(false);
  const [activeAgendaItem, setActiveAgendaItem] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [decisionFilter, setDecisionFilter] = useState<string>("all");

  const handleAddAgendaItem = () => {
    if (!newAgendaItem.title || !newAgendaItem.presenter) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    const item: AgendaItem = {
      id: Date.now().toString(),
      ...newAgendaItem,
      status: "pending",
      notes: ""
    };
    setAgendaItems([...agendaItems, item]);
    setNewAgendaItem({ title: "", duration: 15, presenter: "", type: "review" });
    setIsAddAgendaOpen(false);
    toast({ title: "Success", description: "Agenda item added" });
  };

  const handleRemoveAgendaItem = (id: string) => {
    setAgendaItems(agendaItems.filter(item => item.id !== id));
    toast({ title: "Removed", description: "Agenda item removed" });
  };

  const handleAgendaStatusChange = (id: string, status: AgendaItem["status"]) => {
    setAgendaItems(agendaItems.map(item => 
      item.id === id ? { ...item, status } : item
    ));
    if (status === "in-progress") {
      setActiveAgendaItem(id);
    } else if (status === "completed") {
      setActiveAgendaItem(null);
    }
  };

  const refreshKPIs = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({ title: "KPIs Refreshed", description: "All metrics updated from source systems" });
    }, 1500);
  };

  const getTotalDuration = () => {
    return agendaItems.reduce((sum, item) => sum + item.duration, 0);
  };

  const getKPIStatus = (kpi: KPI) => {
    const percentage = (kpi.currentValue / kpi.targetValue) * 100;
    if (percentage >= 100) return "success";
    if (percentage >= 80) return "warning";
    return "danger";
  };

  const getDecisionStatusBadge = (status: Decision["status"]) => {
    const styles = {
      open: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "in-progress": "bg-amber-500/20 text-amber-400 border-amber-500/30",
      completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      overdue: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return styles[status];
  };

  const filteredDecisions = decisionFilter === "all" 
    ? decisions 
    : decisions.filter(d => d.status === decisionFilter);

  const kpiCategories = [...new Set(kpis.map(k => k.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Management Review</h1>
          <p className="text-muted-foreground mt-1">
            Plan meetings, review KPIs, and track decisions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Review</p>
                <p className="text-2xl font-bold text-foreground">Feb 15</p>
                <p className="text-xs text-muted-foreground mt-1">In 30 days</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Decisions</p>
                <p className="text-2xl font-bold text-foreground">
                  {decisions.filter(d => d.status !== "completed").length}
                </p>
                <p className="text-xs text-red-400 mt-1">
                  {decisions.filter(d => d.status === "overdue").length} overdue
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">KPIs On Target</p>
                <p className="text-2xl font-bold text-foreground">
                  {kpis.filter(k => k.currentValue >= k.targetValue).length}/{kpis.length}
                </p>
                <p className="text-xs text-emerald-400 mt-1">62% achievement</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Meetings YTD</p>
                <p className="text-2xl font-bold text-foreground">{meetings.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {meetings.filter(m => m.status === "completed").length} completed
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="agenda" className="space-y-4">
        <TabsList className="glass-card border-border/50 p-1">
          <TabsTrigger value="agenda" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Agenda Builder
          </TabsTrigger>
          <TabsTrigger value="kpis" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            KPI Dashboard
          </TabsTrigger>
          <TabsTrigger value="decisions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Decision Tracking
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Meeting History
          </TabsTrigger>
        </TabsList>

        {/* Agenda Builder Tab */}
        <TabsContent value="agenda" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agenda Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="glass-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg text-foreground">Meeting Agenda</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-muted-foreground">
                      Total: {getTotalDuration()} min
                    </Badge>
                    <Dialog open={isAddAgendaOpen} onOpenChange={setIsAddAgendaOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-1">
                          <Plus className="h-4 w-4" /> Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card border-border/50">
                        <DialogHeader>
                          <DialogTitle>Add Agenda Item</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div>
                            <label className="text-sm text-muted-foreground">Title *</label>
                            <Input
                              value={newAgendaItem.title}
                              onChange={(e) => setNewAgendaItem({ ...newAgendaItem, title: e.target.value })}
                              placeholder="Agenda item title"
                              className="mt-1"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm text-muted-foreground">Duration (min)</label>
                              <Input
                                type="number"
                                value={newAgendaItem.duration}
                                onChange={(e) => setNewAgendaItem({ ...newAgendaItem, duration: parseInt(e.target.value) || 15 })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-muted-foreground">Type</label>
                              <Select
                                value={newAgendaItem.type}
                                onValueChange={(value: "input" | "review" | "action" | "decision") => 
                                  setNewAgendaItem({ ...newAgendaItem, type: value })
                                }
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="input">Input</SelectItem>
                                  <SelectItem value="review">Review</SelectItem>
                                  <SelectItem value="action">Action</SelectItem>
                                  <SelectItem value="decision">Decision</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Presenter *</label>
                            <Input
                              value={newAgendaItem.presenter}
                              onChange={(e) => setNewAgendaItem({ ...newAgendaItem, presenter: e.target.value })}
                              placeholder="Who will present this item"
                              className="mt-1"
                            />
                          </div>
                          <Button onClick={handleAddAgendaItem} className="w-full">
                            Add to Agenda
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {agendaItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        activeAgendaItem === item.id 
                          ? "border-primary bg-primary/10" 
                          : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                      }`}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground truncate">{item.title}</span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {item.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>{item.presenter}</span>
                          <span>•</span>
                          <span>{item.duration} min</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === "pending" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAgendaStatusChange(item.id, "in-progress")}
                            className="h-8 w-8 p-0"
                          >
                            <PlayCircle className="h-4 w-4 text-emerald-400" />
                          </Button>
                        )}
                        {item.status === "in-progress" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAgendaStatusChange(item.id, "pending")}
                              className="h-8 w-8 p-0"
                            >
                              <PauseCircle className="h-4 w-4 text-amber-400" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAgendaStatusChange(item.id, "completed")}
                              className="h-8 w-8 p-0"
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            </Button>
                          </>
                        )}
                        {item.status === "completed" && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveAgendaItem(item.id)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {agendaItems.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No agenda items. Click "Add Item" to get started.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Meeting Notes */}
            <div className="space-y-4">
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-foreground">Meeting Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add meeting notes, key points, and action items..."
                    className="min-h-[200px] bg-secondary/30 border-border/50"
                  />
                  <Button className="w-full mt-3" variant="outline">
                    Save Notes
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-foreground">Meeting Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Date & Time</label>
                    <Input type="datetime-local" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Location</label>
                    <Input placeholder="Conference Room A" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Attendees</label>
                    <Input placeholder="Add attendees..." className="mt-1" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* KPI Dashboard Tab */}
        <TabsContent value="kpis" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Key Performance Indicators</h2>
            <Button 
              variant="outline" 
              onClick={refreshKPIs}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh All"}
            </Button>
          </div>

          {kpiCategories.map(category => (
            <Card key={category} className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kpis.filter(k => k.category === category).map(kpi => {
                    const status = getKPIStatus(kpi);
                    const percentage = Math.min((kpi.currentValue / kpi.targetValue) * 100, 100);
                    return (
                      <div key={kpi.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">{kpi.name}</span>
                          <div className="flex items-center gap-1">
                            {kpi.trend === "up" && <ArrowUp className="h-4 w-4 text-emerald-400" />}
                            {kpi.trend === "down" && <ArrowDown className="h-4 w-4 text-red-400" />}
                            {kpi.trend === "stable" && <Minus className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-2xl font-bold text-foreground">
                            {kpi.currentValue}{kpi.unit}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            / {kpi.targetValue}{kpi.unit}
                          </span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className={`h-2 ${
                            status === "success" ? "[&>div]:bg-emerald-500" :
                            status === "warning" ? "[&>div]:bg-amber-500" :
                            "[&>div]:bg-red-500"
                          }`}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Updated: {kpi.lastUpdated}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Decision Tracking Tab */}
        <TabsContent value="decisions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Decision Tracking</h2>
            <div className="flex items-center gap-2">
              <Select value={decisionFilter} onValueChange={setDecisionFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Decision
              </Button>
            </div>
          </div>

          {/* Decision Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="glass-card border-border/50 border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {decisions.filter(d => d.status === "open").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Open</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50 border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {decisions.filter(d => d.status === "in-progress").length}
                    </p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50 border-l-4 border-l-emerald-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {decisions.filter(d => d.status === "completed").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50 border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {decisions.filter(d => d.status === "overdue").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Decisions Table */}
          <Card className="glass-card border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="text-muted-foreground">Decision</TableHead>
                    <TableHead className="text-muted-foreground">Meeting</TableHead>
                    <TableHead className="text-muted-foreground">Owner</TableHead>
                    <TableHead className="text-muted-foreground">Due Date</TableHead>
                    <TableHead className="text-muted-foreground">Priority</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDecisions.map(decision => (
                    <TableRow key={decision.id} className="border-border/50 hover:bg-secondary/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{decision.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {decision.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-foreground">{decision.meetingId}</p>
                          <p className="text-muted-foreground">{decision.meetingDate}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{decision.owner}</TableCell>
                      <TableCell className="text-foreground">{decision.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          decision.priority === "high" ? "border-red-500/50 text-red-400" :
                          decision.priority === "medium" ? "border-amber-500/50 text-amber-400" :
                          "border-emerald-500/50 text-emerald-400"
                        }>
                          {decision.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDecisionStatusBadge(decision.status)}>
                          {decision.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meeting History Tab */}
        <TabsContent value="history" className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Meeting History</h2>
          <div className="grid gap-4">
            {meetings.map(meeting => (
              <Card key={meeting.id} className="glass-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{meeting.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span>{meeting.date}</span>
                          <span>•</span>
                          <span>{meeting.attendees} attendees</span>
                          <span>•</span>
                          <span>{meeting.decisionsCount} decisions</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={
                        meeting.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                        meeting.status === "in-progress" ? "bg-amber-500/20 text-amber-400" :
                        "bg-blue-500/20 text-blue-400"
                      }>
                        {meeting.status}
                      </Badge>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagementReview;

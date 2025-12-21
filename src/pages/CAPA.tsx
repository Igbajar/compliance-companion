import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Plus,
  Search,
  Timer,
  TrendingUp,
  XCircle,
  ArrowRight,
  Calendar,
  User,
  Target,
  Shield,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Pencil,
} from "lucide-react";
import CAPAForm, { CAPAFormValues } from "@/components/capa/CAPAForm";
import { toast } from "@/hooks/use-toast";

// Mock data for CAPA actions
const capaActions = [
  {
    id: "CAPA-2024-001",
    title: "Implement additional quality checks for incoming materials",
    type: "Corrective",
    source: "NC-2024-015",
    sourceType: "Nonconformity",
    priority: "High",
    status: "In Progress",
    owner: "John Smith",
    department: "Quality",
    createdDate: "2024-01-15",
    dueDate: "2024-02-15",
    completedDate: null,
    slaStatus: "On Track",
    slaDaysRemaining: 12,
    effectivenessStatus: "Pending",
    rootCause: "Inadequate supplier quality controls",
    description: "Implement incoming inspection procedures with documented acceptance criteria",
    verificationRequired: true,
    stage: "Implementation",
  },
  {
    id: "CAPA-2024-002",
    title: "Update calibration schedule for measurement equipment",
    type: "Preventive",
    source: "Audit-2024-003",
    sourceType: "Audit Finding",
    priority: "Medium",
    status: "Verification",
    owner: "Sarah Johnson",
    department: "Maintenance",
    createdDate: "2024-01-10",
    dueDate: "2024-02-01",
    completedDate: null,
    slaStatus: "At Risk",
    slaDaysRemaining: 3,
    effectivenessStatus: "Pending",
    rootCause: "Outdated calibration tracking system",
    description: "Review and update calibration frequencies based on equipment criticality",
    verificationRequired: true,
    stage: "Effectiveness Review",
  },
  {
    id: "CAPA-2024-003",
    title: "Enhance operator training for assembly process",
    type: "Corrective",
    source: "NC-2024-012",
    sourceType: "Nonconformity",
    priority: "High",
    status: "Closed",
    owner: "Mike Davis",
    department: "Production",
    createdDate: "2024-01-05",
    dueDate: "2024-01-25",
    completedDate: "2024-01-23",
    slaStatus: "Completed",
    slaDaysRemaining: 0,
    effectivenessStatus: "Effective",
    rootCause: "Insufficient training on new procedures",
    description: "Develop and deliver refresher training on assembly procedures",
    verificationRequired: true,
    stage: "Closed",
  },
  {
    id: "CAPA-2024-004",
    title: "Install environmental monitoring sensors",
    type: "Preventive",
    source: "Risk-2024-008",
    sourceType: "Risk Assessment",
    priority: "Low",
    status: "Planning",
    owner: "Emma Wilson",
    department: "Facilities",
    createdDate: "2024-01-18",
    dueDate: "2024-03-15",
    completedDate: null,
    slaStatus: "On Track",
    slaDaysRemaining: 45,
    effectivenessStatus: "Not Started",
    rootCause: "Lack of real-time environmental data",
    description: "Install temperature and humidity sensors in storage areas",
    verificationRequired: false,
    stage: "Planning",
  },
  {
    id: "CAPA-2024-005",
    title: "Revise document control procedure",
    type: "Corrective",
    source: "Audit-2024-001",
    sourceType: "Audit Finding",
    priority: "Medium",
    status: "Overdue",
    owner: "Tom Brown",
    department: "Quality",
    createdDate: "2023-12-20",
    dueDate: "2024-01-20",
    completedDate: null,
    slaStatus: "Overdue",
    slaDaysRemaining: -10,
    effectivenessStatus: "Not Started",
    rootCause: "Procedure gaps identified during audit",
    description: "Update document control procedure to address audit findings",
    verificationRequired: true,
    stage: "Implementation",
  },
];

// Workflow stages
const workflowStages = [
  { id: "planning", label: "Planning", icon: FileText },
  { id: "implementation", label: "Implementation", icon: Play },
  { id: "verification", label: "Verification", icon: CheckCircle2 },
  { id: "effectiveness", label: "Effectiveness Review", icon: Target },
  { id: "closed", label: "Closed", icon: Shield },
];

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    "Planning": "bg-info/20 text-info border-info/30",
    "In Progress": "bg-warning/20 text-warning border-warning/30",
    "Verification": "bg-primary/20 text-primary border-primary/30",
    "Closed": "bg-success/20 text-success border-success/30",
    "Overdue": "bg-destructive/20 text-destructive border-destructive/30",
  };
  return styles[status] || "bg-muted text-muted-foreground";
};

const getPriorityBadge = (priority: string) => {
  const styles: Record<string, string> = {
    "High": "bg-destructive/20 text-destructive border-destructive/30",
    "Medium": "bg-warning/20 text-warning border-warning/30",
    "Low": "bg-success/20 text-success border-success/30",
  };
  return styles[priority] || "bg-muted text-muted-foreground";
};

const getTypeBadge = (type: string) => {
  return type === "Corrective" 
    ? "bg-destructive/20 text-destructive border-destructive/30"
    : "bg-info/20 text-info border-info/30";
};

const getSLABadge = (slaStatus: string, daysRemaining: number) => {
  if (slaStatus === "Overdue") {
    return { class: "bg-destructive/20 text-destructive", text: `${Math.abs(daysRemaining)} days overdue` };
  }
  if (slaStatus === "At Risk") {
    return { class: "bg-warning/20 text-warning", text: `${daysRemaining} days remaining` };
  }
  if (slaStatus === "Completed") {
    return { class: "bg-success/20 text-success", text: "Completed" };
  }
  return { class: "bg-success/20 text-success", text: `${daysRemaining} days remaining` };
};

const getEffectivenessBadge = (status: string) => {
  const styles: Record<string, string> = {
    "Effective": "bg-success/20 text-success border-success/30",
    "Not Effective": "bg-destructive/20 text-destructive border-destructive/30",
    "Pending": "bg-warning/20 text-warning border-warning/30",
    "Not Started": "bg-muted text-muted-foreground border-border",
  };
  return styles[status] || "bg-muted text-muted-foreground";
};

const getStageIndex = (stage: string) => {
  const stageMap: Record<string, number> = {
    "Planning": 0,
    "Implementation": 1,
    "Verification": 2,
    "Effectiveness Review": 3,
    "Closed": 4,
  };
  return stageMap[stage] ?? 0;
};

export default function CAPA() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<typeof capaActions[0] | null>(null);

  const filteredActions = capaActions.filter((action) => {
    const matchesSearch = 
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || action.type === typeFilter;
    const matchesStatus = statusFilter === "all" || action.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || action.priority === priorityFilter;
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  // Stats calculations
  const totalActions = capaActions.length;
  const openActions = capaActions.filter(a => a.status !== "Closed").length;
  const overdueActions = capaActions.filter(a => a.slaStatus === "Overdue").length;
  const atRiskActions = capaActions.filter(a => a.slaStatus === "At Risk").length;
  const effectiveCount = capaActions.filter(a => a.effectivenessStatus === "Effective").length;
  const closedCount = capaActions.filter(a => a.status === "Closed").length;
  const effectivenessRate = closedCount > 0 ? Math.round((effectiveCount / closedCount) * 100) : 0;

  const handleCreateCAPA = (data: CAPAFormValues, evidence: any[]) => {
    // In a real app, this would save to the database
    console.log("Creating CAPA:", data, evidence);
    toast({
      title: "CAPA Created",
      description: `${data.title} has been created successfully`,
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditCAPA = (data: CAPAFormValues, evidence: any[]) => {
    // In a real app, this would update the database
    console.log("Updating CAPA:", editingAction?.id, data, evidence);
    toast({
      title: "CAPA Updated",
      description: `${editingAction?.id} has been updated successfully`,
    });
    setEditingAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CAPA Management</h1>
          <p className="text-muted-foreground mt-1">
            Corrective & Preventive Action tracking with SLA monitoring
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New CAPA
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle>Create New CAPA</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new Corrective or Preventive Action
              </DialogDescription>
            </DialogHeader>
            <CAPAForm
              onSubmit={handleCreateCAPA}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingAction} onOpenChange={(open) => !open && setEditingAction(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit CAPA - {editingAction?.id}</DialogTitle>
            <DialogDescription>
              Update the details of this Corrective or Preventive Action
            </DialogDescription>
          </DialogHeader>
          {editingAction && (
            <CAPAForm
              isEditing
              defaultValues={{
                title: editingAction.title,
                type: editingAction.type as "Corrective" | "Preventive",
                source: editingAction.source,
                sourceType: editingAction.sourceType as any,
                priority: editingAction.priority as "High" | "Medium" | "Low",
                owner: editingAction.owner,
                department: editingAction.department,
                dueDate: new Date(editingAction.dueDate),
                rootCause: editingAction.rootCause,
                description: editingAction.description,
                verificationRequired: editingAction.verificationRequired,
              }}
              onSubmit={handleEditCAPA}
              onCancel={() => setEditingAction(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Actions</p>
                <p className="text-2xl font-bold text-foreground">{openActions}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{overdueActions}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-warning">{atRiskActions}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Closed (MTD)</p>
                <p className="text-2xl font-bold text-success">{closedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Effectiveness</p>
                <p className="text-2xl font-bold text-primary">{effectivenessRate}%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="actions" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="actions">Action Tracker</TabsTrigger>
          <TabsTrigger value="sla">SLA Dashboard</TabsTrigger>
          <TabsTrigger value="workflow">Workflow Status</TabsTrigger>
          <TabsTrigger value="effectiveness">Effectiveness Review</TabsTrigger>
        </TabsList>

        {/* Action Tracker Tab */}
        <TabsContent value="actions" className="space-y-4">
          {/* Filters */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ID, title, or owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Corrective">Corrective</SelectItem>
                      <SelectItem value="Preventive">Preventive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Verification">Verification</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Table */}
          <Card className="glass-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">CAPA ID</TableHead>
                    <TableHead className="text-muted-foreground">Title</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Source</TableHead>
                    <TableHead className="text-muted-foreground">Priority</TableHead>
                    <TableHead className="text-muted-foreground">Owner</TableHead>
                    <TableHead className="text-muted-foreground">Due Date</TableHead>
                    <TableHead className="text-muted-foreground">SLA Status</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActions.map((action) => {
                    const slaBadge = getSLABadge(action.slaStatus, action.slaDaysRemaining);
                    return (
                      <TableRow key={action.id} className="border-border">
                        <TableCell className="font-mono text-sm text-primary">
                          {action.id}
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <p className="font-medium text-foreground truncate">{action.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{action.rootCause}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTypeBadge(action.type)}>
                            {action.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-foreground">{action.source}</p>
                            <p className="text-xs text-muted-foreground">{action.sourceType}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getPriorityBadge(action.priority)}>
                            {action.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                              <User className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm">{action.owner}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {action.dueDate}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${slaBadge.class}`}>
                            <Timer className="h-3 w-3" />
                            {slaBadge.text}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadge(action.status)}>
                            {action.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingAction(action)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl bg-card border-border">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <span className="text-primary">{action.id}</span>
                                    <Badge variant="outline" className={getTypeBadge(action.type)}>
                                      {action.type}
                                    </Badge>
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold text-foreground">{action.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground">Root Cause</p>
                                      <p className="text-sm">{action.rootCause}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground">Source</p>
                                      <p className="text-sm">{action.source} ({action.sourceType})</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground">Owner</p>
                                      <p className="text-sm">{action.owner} - {action.department}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground">Due Date</p>
                                      <p className="text-sm">{action.dueDate}</p>
                                    </div>
                                  </div>

                                  {/* Workflow Progress */}
                                  <div className="pt-4 border-t border-border">
                                    <p className="text-sm font-medium mb-3">Workflow Progress</p>
                                    <div className="flex items-center justify-between">
                                      {workflowStages.map((stage, index) => {
                                        const currentIndex = getStageIndex(action.stage);
                                        const isCompleted = index < currentIndex;
                                        const isCurrent = index === currentIndex;
                                        return (
                                          <div key={stage.id} className="flex items-center">
                                            <div className={`flex flex-col items-center ${index < workflowStages.length - 1 ? 'w-full' : ''}`}>
                                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                                isCompleted ? 'bg-success text-success-foreground' :
                                                isCurrent ? 'bg-primary text-primary-foreground' :
                                                'bg-muted text-muted-foreground'
                                              }`}>
                                                <stage.icon className="h-4 w-4" />
                                              </div>
                                              <span className={`text-xs mt-1 ${isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                                {stage.label}
                                              </span>
                                            </div>
                                            {index < workflowStages.length - 1 && (
                                              <div className={`h-0.5 w-8 mx-1 ${isCompleted ? 'bg-success' : 'bg-border'}`} />
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="flex gap-2 pt-4">
                                    <Button className="flex-1">Advance Stage</Button>
                                    <Button variant="outline" onClick={() => setEditingAction(action)}>Edit</Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SLA Dashboard Tab */}
        <TabsContent value="sla" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overdue Actions */}
            <Card className="glass-card border-destructive/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  Overdue Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {capaActions.filter(a => a.slaStatus === "Overdue").map((action) => (
                  <div key={action.id} className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-destructive">{action.id}</span>
                      <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">
                        {Math.abs(action.slaDaysRemaining)} days overdue
                      </Badge>
                    </div>
                    <p className="text-sm mt-1 text-foreground line-clamp-1">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">Owner: {action.owner}</p>
                  </div>
                ))}
                {capaActions.filter(a => a.slaStatus === "Overdue").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No overdue actions</p>
                )}
              </CardContent>
            </Card>

            {/* At Risk Actions */}
            <Card className="glass-card border-warning/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-5 w-5" />
                  At Risk (Due Soon)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {capaActions.filter(a => a.slaStatus === "At Risk").map((action) => (
                  <div key={action.id} className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-warning">{action.id}</span>
                      <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
                        {action.slaDaysRemaining} days left
                      </Badge>
                    </div>
                    <p className="text-sm mt-1 text-foreground line-clamp-1">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">Owner: {action.owner}</p>
                  </div>
                ))}
                {capaActions.filter(a => a.slaStatus === "At Risk").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No at-risk actions</p>
                )}
              </CardContent>
            </Card>

            {/* On Track Actions */}
            <Card className="glass-card border-success/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  On Track
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {capaActions.filter(a => a.slaStatus === "On Track").map((action) => (
                  <div key={action.id} className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-success">{action.id}</span>
                      <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                        {action.slaDaysRemaining} days left
                      </Badge>
                    </div>
                    <p className="text-sm mt-1 text-foreground line-clamp-1">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">Owner: {action.owner}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* SLA Performance Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>SLA Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>On-Time Completion Rate</span>
                    <span className="text-success">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Time to Close</span>
                    <span className="text-primary">18 days</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Escalation Rate</span>
                    <span className="text-warning">12%</span>
                  </div>
                  <Progress value={12} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Status Tab */}
        <TabsContent value="workflow" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {workflowStages.map((stage) => {
              const stageActions = capaActions.filter(a => a.stage === stage.label);
              return (
                <Card key={stage.id} className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <stage.icon className="h-4 w-4 text-primary" />
                      {stage.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-2xl font-bold text-foreground">{stageActions.length}</p>
                    {stageActions.map((action) => (
                      <div key={action.id} className="p-2 rounded bg-secondary/50 border border-border">
                        <p className="font-mono text-xs text-primary">{action.id}</p>
                        <p className="text-xs text-foreground line-clamp-1">{action.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className={`text-[10px] ${getPriorityBadge(action.priority)}`}>
                            {action.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Workflow Funnel */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Workflow Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-2">
                {workflowStages.map((stage, index) => {
                  const count = capaActions.filter(a => a.stage === stage.label).length;
                  const width = Math.max(60, 200 - (index * 30));
                  return (
                    <div key={stage.id} className="flex items-center">
                      <div 
                        className="flex flex-col items-center justify-center py-4 rounded-lg bg-primary/20 border border-primary/30"
                        style={{ width: `${width}px` }}
                      >
                        <stage.icon className="h-5 w-5 text-primary mb-1" />
                        <span className="text-2xl font-bold text-foreground">{count}</span>
                        <span className="text-xs text-muted-foreground">{stage.label}</span>
                      </div>
                      {index < workflowStages.length - 1 && (
                        <ArrowRight className="h-5 w-5 text-muted-foreground mx-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Effectiveness Review Tab */}
        <TabsContent value="effectiveness" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Verification */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-warning" />
                  Pending Effectiveness Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {capaActions.filter(a => a.effectivenessStatus === "Pending").map((action) => (
                  <div key={action.id} className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-primary">{action.id}</span>
                      <Badge variant="outline" className={getTypeBadge(action.type)}>
                        {action.type}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mt-2">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">Completed: {action.completedDate || "In Progress"}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="success" className="text-xs">
                        Mark Effective
                      </Button>
                      <Button size="sm" variant="destructive" className="text-xs">
                        Not Effective
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Effectiveness Summary */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Effectiveness Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="relative h-32 w-32">
                      <svg className="h-32 w-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${effectivenessRate * 3.52} 352`}
                          className="text-success"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{effectivenessRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4">
                    <div className="text-center p-2 rounded bg-success/10">
                      <p className="text-lg font-bold text-success">{effectiveCount}</p>
                      <p className="text-xs text-muted-foreground">Effective</p>
                    </div>
                    <div className="text-center p-2 rounded bg-destructive/10">
                      <p className="text-lg font-bold text-destructive">0</p>
                      <p className="text-xs text-muted-foreground">Not Effective</p>
                    </div>
                    <div className="text-center p-2 rounded bg-warning/10">
                      <p className="text-lg font-bold text-warning">
                        {capaActions.filter(a => a.effectivenessStatus === "Pending").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Completed Actions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Closed Actions - Effectiveness Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">CAPA ID</TableHead>
                    <TableHead className="text-muted-foreground">Title</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Closed Date</TableHead>
                    <TableHead className="text-muted-foreground">Effectiveness</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {capaActions.filter(a => a.status === "Closed" || a.effectivenessStatus !== "Not Started").map((action) => (
                    <TableRow key={action.id} className="border-border">
                      <TableCell className="font-mono text-sm text-primary">{action.id}</TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="truncate">{action.title}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTypeBadge(action.type)}>
                          {action.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{action.completedDate || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getEffectivenessBadge(action.effectivenessStatus)}>
                          {action.effectivenessStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Review</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

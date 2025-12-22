import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  FileType,
  Plus,
  Play,
  Eye,
  Trash2,
  RefreshCw,
  Filter,
  Search,
  Settings,
  Mail
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Types
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: "compliance" | "audit" | "kpi" | "risk" | "capa" | "training";
  icon: React.ReactNode;
  lastGenerated: string | null;
  frequency: "manual" | "daily" | "weekly" | "monthly" | "quarterly";
  sections: string[];
}

interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  generatedAt: string;
  generatedBy: string;
  status: "completed" | "processing" | "failed";
  fileSize: string;
  format: "pdf" | "xlsx" | "csv";
  category: string;
}

interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  nextRun: string;
  recipients: string[];
  status: "active" | "paused";
  format: "pdf" | "xlsx";
}

// Sample Data
const reportTemplates: ReportTemplate[] = [
  {
    id: "1",
    name: "ISO 9001 Compliance Summary",
    description: "Comprehensive compliance status across all ISO 9001 clauses",
    category: "compliance",
    icon: <CheckCircle2 className="h-5 w-5" />,
    lastGenerated: "2024-01-15",
    frequency: "monthly",
    sections: ["Clause Coverage", "Nonconformities", "Audit Results", "Improvement Actions"]
  },
  {
    id: "2",
    name: "Audit Performance Report",
    description: "Summary of internal and external audit findings and trends",
    category: "audit",
    icon: <BarChart3 className="h-5 w-5" />,
    lastGenerated: "2024-01-10",
    frequency: "quarterly",
    sections: ["Audit Schedule", "Findings Summary", "NC Trends", "Closure Rates"]
  },
  {
    id: "3",
    name: "KPI Dashboard Report",
    description: "Key performance indicators across all quality metrics",
    category: "kpi",
    icon: <TrendingUp className="h-5 w-5" />,
    lastGenerated: "2024-01-14",
    frequency: "weekly",
    sections: ["Customer Satisfaction", "Process Metrics", "Quality Objectives", "Trend Analysis"]
  },
  {
    id: "4",
    name: "Risk Assessment Report",
    description: "Current risk landscape with mitigation status",
    category: "risk",
    icon: <AlertTriangle className="h-5 w-5" />,
    lastGenerated: "2024-01-12",
    frequency: "monthly",
    sections: ["Risk Matrix", "High Priority Risks", "Mitigation Progress", "New Risks"]
  },
  {
    id: "5",
    name: "CAPA Effectiveness Report",
    description: "Corrective and preventive action tracking and effectiveness",
    category: "capa",
    icon: <PieChart className="h-5 w-5" />,
    lastGenerated: "2024-01-08",
    frequency: "monthly",
    sections: ["Open CAPAs", "Closure Statistics", "Root Cause Analysis", "Effectiveness Reviews"]
  },
  {
    id: "6",
    name: "Training Compliance Report",
    description: "Employee training status and competency gaps",
    category: "training",
    icon: <FileText className="h-5 w-5" />,
    lastGenerated: "2024-01-13",
    frequency: "monthly",
    sections: ["Training Completion", "Competency Matrix", "Certification Status", "Gap Analysis"]
  },
];

const generatedReports: GeneratedReport[] = [
  { id: "1", templateId: "1", name: "ISO 9001 Compliance Summary - Jan 2024", generatedAt: "2024-01-15 09:30", generatedBy: "System", status: "completed", fileSize: "2.4 MB", format: "pdf", category: "compliance" },
  { id: "2", templateId: "3", name: "KPI Dashboard Report - Week 2", generatedAt: "2024-01-14 08:00", generatedBy: "System", status: "completed", fileSize: "1.8 MB", format: "xlsx", category: "kpi" },
  { id: "3", templateId: "6", name: "Training Compliance Report - Jan 2024", generatedAt: "2024-01-13 14:15", generatedBy: "John Smith", status: "completed", fileSize: "3.1 MB", format: "pdf", category: "training" },
  { id: "4", templateId: "4", name: "Risk Assessment Report - Jan 2024", generatedAt: "2024-01-12 11:45", generatedBy: "Jane Doe", status: "completed", fileSize: "1.5 MB", format: "pdf", category: "risk" },
  { id: "5", templateId: "2", name: "Audit Performance Report - Q4 2023", generatedAt: "2024-01-10 10:00", generatedBy: "System", status: "completed", fileSize: "4.2 MB", format: "pdf", category: "audit" },
  { id: "6", templateId: "5", name: "CAPA Effectiveness Report - Processing", generatedAt: "2024-01-16 08:30", generatedBy: "System", status: "processing", fileSize: "-", format: "pdf", category: "capa" },
];

const scheduledReports: ScheduledReport[] = [
  { id: "1", templateId: "3", name: "KPI Dashboard Report", frequency: "weekly", nextRun: "2024-01-22 08:00", recipients: ["quality@company.com", "management@company.com"], status: "active", format: "xlsx" },
  { id: "2", templateId: "1", name: "ISO 9001 Compliance Summary", frequency: "monthly", nextRun: "2024-02-01 09:00", recipients: ["management@company.com"], status: "active", format: "pdf" },
  { id: "3", templateId: "2", name: "Audit Performance Report", frequency: "quarterly", nextRun: "2024-04-01 10:00", recipients: ["auditors@company.com", "quality@company.com"], status: "active", format: "pdf" },
  { id: "4", templateId: "6", name: "Training Compliance Report", frequency: "monthly", nextRun: "2024-02-01 14:00", recipients: ["hr@company.com", "training@company.com"], status: "paused", format: "pdf" },
];

// Mock compliance data for auto-generated reports
const complianceData = {
  overallScore: 87,
  clauses: [
    { id: "4", name: "Context of Organization", compliance: 92 },
    { id: "5", name: "Leadership", compliance: 88 },
    { id: "6", name: "Planning", compliance: 85 },
    { id: "7", name: "Support", compliance: 90 },
    { id: "8", name: "Operation", compliance: 82 },
    { id: "9", name: "Performance Evaluation", compliance: 89 },
    { id: "10", name: "Improvement", compliance: 84 },
  ],
  nonconformities: { open: 12, closed: 45, overdue: 3 },
  audits: { completed: 8, scheduled: 4, findings: 23 },
  risks: { high: 5, medium: 18, low: 32, mitigated: 41 },
  capa: { open: 15, inProgress: 8, closed: 67, effective: 89 },
  training: { completed: 156, pending: 23, overdue: 8, compliance: 78 },
};

const Reports = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "xlsx" | "csv">("pdf");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleGenerateReport = (template: ReportTemplate) => {
    setIsGenerating(true);
    setSelectedTemplate(template);
    
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Report Generated",
        description: `${template.name} has been generated successfully.`,
      });
    }, 2000);
  };

  const handleExport = (report: GeneratedReport) => {
    toast({
      title: "Download Started",
      description: `Downloading ${report.name}.${report.format}`,
    });
  };

  const handleScheduleToggle = (scheduleId: string) => {
    toast({
      title: "Schedule Updated",
      description: "Report schedule has been updated.",
    });
  };

  const filteredReports = generatedReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || report.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      compliance: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      audit: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      kpi: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      risk: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      capa: "bg-red-500/20 text-red-400 border-red-500/30",
      training: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf": return <FileType className="h-4 w-4 text-red-400" />;
      case "xlsx": return <FileSpreadsheet className="h-4 w-4 text-emerald-400" />;
      case "csv": return <FileText className="h-4 w-4 text-blue-400" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate, schedule, and export compliance reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/50 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Generate New Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm text-muted-foreground">Report Template</label>
                  <Select onValueChange={(value) => {
                    const template = reportTemplates.find(t => t.id === value);
                    setSelectedTemplate(template || null);
                    if (template) setSelectedSections(template.sections);
                  }}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedTemplate && (
                  <>
                    <div>
                      <label className="text-sm text-muted-foreground">Include Sections</label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {selectedTemplate.sections.map(section => (
                          <div key={section} className="flex items-center gap-2">
                            <Checkbox 
                              id={section}
                              checked={selectedSections.includes(section)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedSections([...selectedSections, section]);
                                } else {
                                  setSelectedSections(selectedSections.filter(s => s !== section));
                                }
                              }}
                            />
                            <label htmlFor={section} className="text-sm text-foreground">{section}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Export Format</label>
                        <Select value={exportFormat} onValueChange={(v: "pdf" | "xlsx" | "csv") => setExportFormat(v)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF Document</SelectItem>
                            <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                            <SelectItem value="csv">CSV File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Date Range</label>
                        <Select defaultValue="month">
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="week">Last 7 Days</SelectItem>
                            <SelectItem value="month">Last 30 Days</SelectItem>
                            <SelectItem value="quarter">Last Quarter</SelectItem>
                            <SelectItem value="year">Last Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      className="w-full gap-2" 
                      onClick={() => handleGenerateReport(selectedTemplate)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      {isGenerating ? "Generating..." : "Generate Report"}
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold text-foreground">{generatedReports.length}</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-foreground">
                  {scheduledReports.filter(s => s.status === "active").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Active schedules</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold text-foreground">{complianceData.overallScore}%</p>
                <p className="text-xs text-emerald-400 mt-1">↑ 3% from last month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold text-foreground">{reportTemplates.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Available</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="glass-card border-border/50 p-1">
          <TabsTrigger value="templates" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Report Templates
          </TabsTrigger>
          <TabsTrigger value="generated" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Generated Reports
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Scheduled Reports
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Live Preview
          </TabsTrigger>
        </TabsList>

        {/* Report Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map(template => (
              <Card key={template.id} className="glass-card border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      {template.icon}
                    </div>
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-foreground mt-3">{template.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.sections.slice(0, 3).map(section => (
                      <Badge key={section} variant="outline" className="text-xs">
                        {section}
                      </Badge>
                    ))}
                    {template.sections.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.sections.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="text-xs text-muted-foreground">
                      <span className="capitalize">{template.frequency}</span>
                      {template.lastGenerated && (
                        <span> • Last: {template.lastGenerated}</span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleGenerateReport(template)}
                    >
                      <Play className="h-3 w-3" /> Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Generated Reports Tab */}
        <TabsContent value="generated" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="audit">Audit</SelectItem>
                <SelectItem value="kpi">KPI</SelectItem>
                <SelectItem value="risk">Risk</SelectItem>
                <SelectItem value="capa">CAPA</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="glass-card border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="text-muted-foreground">Report Name</TableHead>
                    <TableHead className="text-muted-foreground">Category</TableHead>
                    <TableHead className="text-muted-foreground">Generated</TableHead>
                    <TableHead className="text-muted-foreground">Format</TableHead>
                    <TableHead className="text-muted-foreground">Size</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map(report => (
                    <TableRow key={report.id} className="border-border/50 hover:bg-secondary/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFormatIcon(report.format)}
                          <span className="font-medium text-foreground">{report.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(report.category)}>
                          {report.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-foreground">{report.generatedAt}</p>
                          <p className="text-muted-foreground text-xs">by {report.generatedBy}</p>
                        </div>
                      </TableCell>
                      <TableCell className="uppercase text-foreground">{report.format}</TableCell>
                      <TableCell className="text-foreground">{report.fileSize}</TableCell>
                      <TableCell>
                        {report.status === "completed" ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                          </Badge>
                        ) : report.status === "processing" ? (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Processing
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            <AlertTriangle className="h-3 w-3 mr-1" /> Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            disabled={report.status !== "completed"}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleExport(report)}
                            disabled={report.status !== "completed"}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Scheduled Reports</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Schedule
            </Button>
          </div>

          <div className="grid gap-4">
            {scheduledReports.map(schedule => (
              <Card key={schedule.id} className="glass-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        schedule.status === "active" ? "bg-emerald-500/20" : "bg-muted"
                      }`}>
                        <Calendar className={`h-6 w-6 ${
                          schedule.status === "active" ? "text-emerald-400" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{schedule.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="capitalize">{schedule.frequency}</span>
                          <span>•</span>
                          <span>Next: {schedule.nextRun}</span>
                          <span>•</span>
                          <span className="uppercase">{schedule.format}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{schedule.recipients.length} recipients</span>
                        </div>
                      </div>
                      <Badge className={
                        schedule.status === "active" 
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-muted text-muted-foreground"
                      }>
                        {schedule.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleScheduleToggle(schedule.id)}
                      >
                        {schedule.status === "active" ? "Pause" : "Resume"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Live Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Live Compliance Preview</h2>
            <div className="flex gap-2">
              <Select defaultValue="pdf">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
              <Button className="gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>
          </div>

          {/* Live Report Preview */}
          <Card className="glass-card border-border/50">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">ISO 9001:2015 Compliance Report</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generated: {new Date().toLocaleDateString()} • Period: Last 30 Days
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-foreground">{complianceData.overallScore}%</p>
                  <p className="text-sm text-emerald-400">Overall Compliance</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Clause Compliance */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Clause Compliance Status</h3>
                <div className="space-y-3">
                  {complianceData.clauses.map(clause => (
                    <div key={clause.id} className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground w-8">{clause.id}</span>
                      <span className="text-sm text-foreground flex-1">{clause.name}</span>
                      <div className="w-48">
                        <Progress 
                          value={clause.compliance} 
                          className={`h-2 ${
                            clause.compliance >= 90 ? "[&>div]:bg-emerald-500" :
                            clause.compliance >= 80 ? "[&>div]:bg-amber-500" :
                            "[&>div]:bg-red-500"
                          }`}
                        />
                      </div>
                      <span className={`text-sm font-medium w-12 text-right ${
                        clause.compliance >= 90 ? "text-emerald-400" :
                        clause.compliance >= 80 ? "text-amber-400" :
                        "text-red-400"
                      }`}>
                        {clause.compliance}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <p className="text-sm text-muted-foreground">Open NCs</p>
                  <p className="text-2xl font-bold text-foreground">{complianceData.nonconformities.open}</p>
                  <p className="text-xs text-red-400">{complianceData.nonconformities.overdue} overdue</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <p className="text-sm text-muted-foreground">Audits Completed</p>
                  <p className="text-2xl font-bold text-foreground">{complianceData.audits.completed}</p>
                  <p className="text-xs text-muted-foreground">{complianceData.audits.scheduled} scheduled</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <p className="text-sm text-muted-foreground">Open CAPAs</p>
                  <p className="text-2xl font-bold text-foreground">{complianceData.capa.open}</p>
                  <p className="text-xs text-emerald-400">{complianceData.capa.effective}% effective</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <p className="text-sm text-muted-foreground">Training Compliance</p>
                  <p className="text-2xl font-bold text-foreground">{complianceData.training.compliance}%</p>
                  <p className="text-xs text-amber-400">{complianceData.training.overdue} overdue</p>
                </div>
              </div>

              {/* Risk Summary */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Risk Distribution</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex gap-1 h-8 rounded-lg overflow-hidden">
                    <div 
                      className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(complianceData.risks.high / (complianceData.risks.high + complianceData.risks.medium + complianceData.risks.low)) * 100}%` }}
                    >
                      {complianceData.risks.high}
                    </div>
                    <div 
                      className="bg-amber-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(complianceData.risks.medium / (complianceData.risks.high + complianceData.risks.medium + complianceData.risks.low)) * 100}%` }}
                    >
                      {complianceData.risks.medium}
                    </div>
                    <div 
                      className="bg-emerald-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(complianceData.risks.low / (complianceData.risks.high + complianceData.risks.medium + complianceData.risks.low)) * 100}%` }}
                    >
                      {complianceData.risks.low}
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-500"></span> High</span>
                    <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-500"></span> Medium</span>
                    <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-500"></span> Low</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;

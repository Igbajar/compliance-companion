import { useState } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  Users,
  Award,
  AlertTriangle,
  Clock,
  TrendingUp,
  Eye,
  Edit,
  FileText,
  XCircle,
  Trash2,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTrainingCourses, useTrainingRecords, TrainingCourse, TrainingRecord } from "@/hooks/useTraining";
import TrainingCourseFormDialog from "@/components/training/TrainingCourseFormDialog";
import TrainingRecordFormDialog from "@/components/training/TrainingRecordFormDialog";
import DeleteTrainingDialog from "@/components/training/DeleteTrainingDialog";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  overdue: "Overdue",
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "completed":
      return "status-compliant";
    case "in_progress":
      return "status-partial";
    case "overdue":
      return "status-non-compliant";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Training = () => {
  const { courses, loading: coursesLoading, createCourse, updateCourse, deleteCourse } = useTrainingCourses();
  const { records, loading: recordsLoading, createRecord, updateRecord, deleteRecord } = useTrainingRecords();

  const [searchQuery, setSearchQuery] = useState("");
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<(TrainingRecord & { course?: TrainingCourse }) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "course" | "record"; id: string; title: string } | null>(null);

  const loading = coursesLoading || recordsLoading;

  // Stats
  const totalCourses = courses.length;
  const completedRecords = records.filter((r) => r.status === "completed").length;
  const overdueRecords = records.filter((r) => r.status === "overdue").length;
  const inProgressRecords = records.filter((r) => r.status === "in_progress").length;
  const completionRate = records.length > 0 ? Math.round((completedRecords / records.length) * 100) : 0;

  // Filter courses
  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter records
  const filteredRecords = records.filter((r) =>
    r.course?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCourse = async (data: Parameters<typeof createCourse>[0]) => {
    try {
      await createCourse(data);
      toast.success("Course created successfully");
    } catch (error) {
      toast.error("Failed to create course");
    }
  };

  const handleUpdateCourse = async (data: Parameters<typeof updateCourse>[1]) => {
    if (!selectedCourse) return;
    try {
      await updateCourse(selectedCourse.id, data);
      toast.success("Course updated successfully");
    } catch (error) {
      toast.error("Failed to update course");
    }
  };

  const handleCreateRecord = async (data: Parameters<typeof createRecord>[0]) => {
    try {
      await createRecord(data);
      toast.success("Training assigned successfully");
    } catch (error) {
      toast.error("Failed to assign training");
    }
  };

  const handleUpdateRecord = async (data: Parameters<typeof updateRecord>[1]) => {
    if (!selectedRecord) return;
    try {
      await updateRecord(selectedRecord.id, data);
      toast.success("Record updated successfully");
    } catch (error) {
      toast.error("Failed to update record");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "course") {
        await deleteCourse(deleteTarget.id);
        toast.success("Course deleted");
      } else {
        await deleteRecord(deleteTarget.id);
        toast.success("Record deleted");
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

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
          <h1 className="text-2xl font-bold text-foreground">Training & Competence Management</h1>
          <p className="text-muted-foreground mt-1">
            Track training courses and employee training records
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            setSelectedCourse(null);
            setCourseDialogOpen(true);
          }}>
            <BookOpen className="w-4 h-4" />
            New Course
          </Button>
          <Button variant="gradient" onClick={() => {
            setSelectedRecord(null);
            setRecordDialogOpen(true);
          }}>
            <Plus className="w-4 h-4" />
            Assign Training
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 fade-in" style={{ animationDelay: "100ms" }}>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold text-foreground mt-1">{completionRate}%</p>
            </div>
            <div className="p-3 rounded-xl bg-success/20">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="text-2xl font-bold text-foreground mt-1">{totalCourses}</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/20">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Available for assignment</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-warning mt-1">{inProgressRecords}</p>
            </div>
            <div className="p-3 rounded-xl bg-warning/20">
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Active training</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-destructive mt-1">{overdueRecords}</p>
            </div>
            <div className="p-3 rounded-xl bg-destructive/20">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Require attention</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="courses" className="fade-in" style={{ animationDelay: "200ms" }}>
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="courses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BookOpen className="w-4 h-4 mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="records" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="w-4 h-4 mr-2" />
            Training Records
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="mt-4">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Title</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">ISO Clause</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Duration</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Mandatory</th>
                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{course.title}</td>
                      <td className="p-3 text-muted-foreground">{course.category || "-"}</td>
                      <td className="p-3 text-muted-foreground">{course.clause || "-"}</td>
                      <td className="p-3 text-muted-foreground">{course.duration_hours ? `${course.duration_hours}h` : "-"}</td>
                      <td className="p-3">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          course.is_mandatory ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"
                        )}>
                          {course.is_mandatory ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedCourse(course);
                              setCourseDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setDeleteTarget({ type: "course", id: course.id, title: course.title });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCourses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No courses found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="mt-4">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Course</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Progress</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Due Date</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Score</th>
                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{record.course?.title || "Unknown Course"}</td>
                      <td className="p-3">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusStyle(record.status))}>
                          {statusLabels[record.status]}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${record.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{record.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {record.due_date ? new Date(record.due_date).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {record.score != null ? `${record.score}%` : "-"}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedRecord(record);
                              setRecordDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setDeleteTarget({ type: "record", id: record.id, title: record.course?.title || "Record" });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No training records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <TrainingCourseFormDialog
        open={courseDialogOpen}
        onOpenChange={setCourseDialogOpen}
        onSubmit={selectedCourse ? handleUpdateCourse : handleCreateCourse}
        defaultValues={selectedCourse}
        isEditing={!!selectedCourse}
      />

      <TrainingRecordFormDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
        onSubmit={selectedRecord ? handleUpdateRecord : handleCreateRecord}
        courses={courses}
        defaultValues={selectedRecord}
        isEditing={!!selectedRecord}
      />

      <DeleteTrainingDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title={deleteTarget?.title || ""}
        type={deleteTarget?.type || "course"}
      />
    </div>
  );
};

export default Training;

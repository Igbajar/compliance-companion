import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Play, Trash2, Clock, AlertCircle } from "lucide-react";
import { useCronJobs } from "@/hooks/useCronJobs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function parseSchedule(schedule: string): string {
  // Parse cron expression to human-readable format
  const parts = schedule.split(" ");
  if (parts.length !== 5) return schedule;
  
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  
  // Common patterns
  if (minute === "*" && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return "Every minute";
  }
  if (minute === "0" && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return "Every hour";
  }
  if (minute === "0" && hour === "8" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return "Daily at 8:00 AM UTC";
  }
  if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return `At ${hour.padStart(2, "0")}:${minute.padStart(2, "0")} UTC daily`;
  }
  if (dayOfWeek === "1" && dayOfMonth === "*" && month === "*") {
    return `Every Monday at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")} UTC`;
  }
  if (dayOfMonth === "1" && month === "*" && dayOfWeek === "*") {
    return `Monthly on the 1st at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")} UTC`;
  }
  
  return schedule;
}

function extractJobDescription(command: string): string {
  // Try to extract function name from the command
  const functionMatch = command.match(/\/functions\/v1\/([a-zA-Z0-9-_]+)/);
  if (functionMatch) {
    return functionMatch[1].replace(/-/g, " ").replace(/_/g, " ");
  }
  return "Custom SQL command";
}

export function CronJobsManager() {
  const { jobs, isLoading, error, toggleJob, deleteJob, runJobNow } = useCronJobs();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center min-h-[200px] gap-2">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-muted-foreground text-center">
            Failed to load scheduled jobs. Make sure you have admin permissions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Scheduled Jobs
        </CardTitle>
        <CardDescription>
          Manage automated tasks and scheduled functions. Jobs run automatically based on their schedule.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!jobs || jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No scheduled jobs configured.</p>
            <p className="text-sm mt-2">Scheduled jobs will appear here once created.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Name</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.jobid}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium capitalize">
                        {job.jobname || extractJobDescription(job.command)}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        ID: {job.jobid}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{parseSchedule(job.schedule)}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {job.schedule}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={job.active}
                        onCheckedChange={(checked) =>
                          toggleJob.mutate({ jobId: job.jobid, active: checked })
                        }
                        disabled={toggleJob.isPending}
                      />
                      <Badge variant={job.active ? "default" : "secondary"}>
                        {job.active ? "Active" : "Paused"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runJobNow.mutate(job.command)}
                        disabled={runJobNow.isPending}
                      >
                        {runJobNow.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        <span className="sr-only">Run now</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Scheduled Job?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove the scheduled job "{job.jobname || extractJobDescription(job.command)}". 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteJob.mutate(job.jobid)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

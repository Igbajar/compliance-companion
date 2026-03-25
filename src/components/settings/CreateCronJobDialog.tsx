import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SCHEDULE_PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Daily at 8:00 AM UTC", value: "0 8 * * *" },
  { label: "Daily at midnight UTC", value: "0 0 * * *" },
  { label: "Every Monday at 9:00 AM UTC", value: "0 9 * * 1" },
  { label: "Monthly on the 1st at 8:00 AM UTC", value: "0 8 1 * *" },
  { label: "Custom", value: "custom" },
];

const AVAILABLE_FUNCTIONS = [
  { label: "Send Training Reminders", value: "send-training-reminders" },
  { label: "Send Compliance Notifications (Weekly Digest)", value: "send-compliance-notifications" },
];

interface CreateCronJobDialogProps {
  children?: React.ReactNode;
}

export function CreateCronJobDialog({ children }: CreateCronJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [jobName, setJobName] = useState("");
  const [schedulePreset, setSchedulePreset] = useState("");
  const [customSchedule, setCustomSchedule] = useState("");
  const [functionName, setFunctionName] = useState("");
  const queryClient = useQueryClient();

  const createJob = useMutation({
    mutationFn: async ({
      name,
      schedule,
      func,
    }: {
      name: string;
      schedule: string;
      func: string;
    }) => {
      const { data, error } = await (supabase.rpc as any)("create_cron_job", {
        p_job_name: name,
        p_schedule: schedule,
        p_function_name: func,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cron-jobs"] });
      toast.success("Scheduled job created successfully");
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create job: ${error.message}`);
    },
  });

  const resetForm = () => {
    setJobName("");
    setSchedulePreset("");
    setCustomSchedule("");
    setFunctionName("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const schedule = schedulePreset === "custom" ? customSchedule : schedulePreset;
    
    if (!jobName || !schedule || !functionName) {
      toast.error("Please fill in all required fields");
      return;
    }

    createJob.mutate({
      name: jobName,
      schedule,
      func: functionName,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Scheduled Job</DialogTitle>
          <DialogDescription>
            Schedule a new background task to run automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobName">Job Name</Label>
            <Input
              id="jobName"
              placeholder="e.g., daily-training-reminders"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="function">Function</Label>
            <Select value={functionName} onValueChange={setFunctionName} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a function" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_FUNCTIONS.map((fn) => (
                  <SelectItem key={fn.value} value={fn.value}>
                    {fn.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule</Label>
            <Select value={schedulePreset} onValueChange={setSchedulePreset} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a schedule" />
              </SelectTrigger>
              <SelectContent>
                {SCHEDULE_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {schedulePreset === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="customSchedule">Custom Cron Expression</Label>
              <Input
                id="customSchedule"
                placeholder="e.g., 0 9 * * 1-5 (weekdays at 9 AM)"
                value={customSchedule}
                onChange={(e) => setCustomSchedule(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Format: minute hour day-of-month month day-of-week (UTC)
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createJob.isPending}>
              {createJob.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Job
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

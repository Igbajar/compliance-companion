import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CronJob {
  jobid: number;
  schedule: string;
  command: string;
  nodename: string;
  nodeport: number;
  database: string;
  username: string;
  active: boolean;
  jobname: string | null;
}

export function useCronJobs() {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ["cron-jobs"],
    queryFn: async () => {
      // Use type assertion since these functions are dynamically created
      const { data, error } = await (supabase.rpc as any)("get_cron_jobs");
      if (error) throw error;
      return data as CronJob[];
    },
  });

  const toggleJob = useMutation({
    mutationFn: async ({ jobId, active }: { jobId: number; active: boolean }) => {
      const { data, error } = await (supabase.rpc as any)("toggle_cron_job", {
        job_id: jobId,
        is_active: active,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cron-jobs"] });
      toast.success(`Job ${variables.active ? "enabled" : "disabled"} successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update job: ${error.message}`);
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (jobId: number) => {
      const { data, error } = await (supabase.rpc as any)("delete_cron_job", {
        job_id: jobId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cron-jobs"] });
      toast.success("Job deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete job: ${error.message}`);
    },
  });

  const runJobNow = useMutation({
    mutationFn: async (command: string) => {
      // Extract the function URL from the command and call it directly
      const urlMatch = command.match(/url:='([^']+)'/);
      if (!urlMatch) throw new Error("Could not extract function URL");
      
      const url = urlMatch[1];
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ time: new Date().toISOString() }),
      });

      if (!response.ok) {
        throw new Error(`Function call failed: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Job executed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to run job: ${error.message}`);
    },
  });

  return {
    jobs,
    isLoading,
    error,
    toggleJob,
    deleteJob,
    runJobNow,
  };
}

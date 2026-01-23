import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SmtpSettings {
  id: string;
  host: string;
  port: number;
  username: string | null;
  password: string | null;
  from_email: string;
  from_name: string;
  use_tls: boolean;
  created_at: string;
  updated_at: string;
}

export function useSmtpSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["smtp-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("smtp_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as SmtpSettings | null;
    },
  });

  const saveSettings = useMutation({
    mutationFn: async (newSettings: Omit<SmtpSettings, "id" | "created_at" | "updated_at">) => {
      if (settings?.id) {
        // Update existing settings
        const { data, error } = await supabase
          .from("smtp_settings")
          .update(newSettings)
          .eq("id", settings.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from("smtp_settings")
          .insert(newSettings)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smtp-settings"] });
      toast({
        title: "Settings saved",
        description: "SMTP settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testConnection = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("test-smtp-connection");
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Connection successful",
        description: "SMTP connection test passed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    error,
    saveSettings,
    testConnection,
  };
}

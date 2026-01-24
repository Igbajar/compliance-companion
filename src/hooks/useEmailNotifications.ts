import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EmailNotification {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  email_type: string;
  status: string;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  sent_at: string | null;
}

export function useEmailNotifications() {
  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ["email-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as EmailNotification[];
    },
  });

  return {
    notifications,
    isLoading,
    error,
  };
}

-- Create email notification history table
CREATE TABLE public.email_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  email_type TEXT NOT NULL, -- e.g., 'training_reminder', 'overdue_alert', etc.
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  metadata JSONB, -- Store additional context like training record id, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies - only admins can view email history
CREATE POLICY "Admins can view email notifications"
  ON public.email_notifications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert email notifications"
  ON public.email_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_email_notifications_created_at ON public.email_notifications(created_at DESC);
CREATE INDEX idx_email_notifications_status ON public.email_notifications(status);
CREATE INDEX idx_email_notifications_recipient ON public.email_notifications(recipient_email);

-- Create function to schedule a new cron job (admin only)
CREATE OR REPLACE FUNCTION public.create_cron_job(
  p_job_name TEXT,
  p_schedule TEXT,
  p_function_name TEXT
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_job_id bigint;
  v_supabase_url TEXT;
  v_anon_key TEXT;
  v_command TEXT;
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Get Supabase URL and anon key from vault or environment
  -- These should be stored securely
  SELECT decrypted_secret INTO v_supabase_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
  SELECT decrypted_secret INTO v_anon_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_ANON_KEY' LIMIT 1;
  
  -- If not in vault, try to construct from project ref
  IF v_supabase_url IS NULL THEN
    v_supabase_url := 'https://xlykoewikfduztqogaew.supabase.co';
  END IF;
  
  IF v_anon_key IS NULL THEN
    v_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhseWtvZXdpa2ZkdXp0cW9nYWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NTI1MjQsImV4cCI6MjA4MjAyODUyNH0.Dm1-F1X3_j-staFTKICU0qeNhxYedWmgRZ3EDPXntAU';
  END IF;
  
  -- Build the command
  v_command := format(
    $cmd$
    SELECT net.http_post(
      url:='%s/functions/v1/%s',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer %s"}'::jsonb,
      body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
    $cmd$,
    v_supabase_url,
    p_function_name,
    v_anon_key
  );
  
  -- Schedule the job
  SELECT cron.schedule(p_job_name, p_schedule, v_command) INTO v_job_id;
  
  RETURN v_job_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_cron_job(TEXT, TEXT, TEXT) TO authenticated;
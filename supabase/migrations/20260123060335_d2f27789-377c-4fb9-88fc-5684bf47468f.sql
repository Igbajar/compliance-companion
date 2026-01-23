-- Create SMTP settings table for email configuration
CREATE TABLE public.smtp_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 587,
  username TEXT,
  password TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL DEFAULT 'ISOManager',
  use_tls BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.smtp_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies - only authenticated users can manage SMTP settings
CREATE POLICY "Authenticated users can view SMTP settings"
  ON public.smtp_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert SMTP settings"
  ON public.smtp_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update SMTP settings"
  ON public.smtp_settings FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete SMTP settings"
  ON public.smtp_settings FOR DELETE
  TO authenticated
  USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_smtp_settings_updated_at
  BEFORE UPDATE ON public.smtp_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
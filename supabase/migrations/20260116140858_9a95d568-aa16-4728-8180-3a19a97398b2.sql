-- Create employees table for managing staff beyond auth users
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_number TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT,
  job_title TEXT,
  phone TEXT,
  hire_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  skills TEXT[],
  certifications TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Employees policies
CREATE POLICY "Authenticated users can view employees" ON public.employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create employees" ON public.employees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update employees" ON public.employees FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete employees" ON public.employees FOR DELETE TO authenticated USING (true);

-- Add employee_id to training_records to link to employees
ALTER TABLE public.training_records ADD COLUMN employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE;

-- Create documents storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "Authenticated users can upload documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Authenticated users can view documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents');
CREATE POLICY "Authenticated users can update documents" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'documents');
CREATE POLICY "Authenticated users can delete documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents');

-- Create certificates storage bucket for training certificates
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', false) ON CONFLICT (id) DO NOTHING;

-- Storage policies for certificates bucket
CREATE POLICY "Authenticated users can upload certificates" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificates');
CREATE POLICY "Authenticated users can view certificates" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'certificates');
CREATE POLICY "Authenticated users can update certificates" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'certificates');
CREATE POLICY "Authenticated users can delete certificates" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'certificates');

-- Add file_url columns to tables that need attachments
ALTER TABLE public.nonconformities ADD COLUMN IF NOT EXISTS evidence_url TEXT;
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS report_url TEXT;

-- Create trigger for employees updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for employees
ALTER PUBLICATION supabase_realtime ADD TABLE public.employees;
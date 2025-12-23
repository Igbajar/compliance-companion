-- Create enum types for various statuses
CREATE TYPE public.document_status AS ENUM ('current', 'under_review', 'draft', 'obsolete');
CREATE TYPE public.document_type AS ENUM ('procedure', 'policy', 'form', 'work_instruction', 'manual');
CREATE TYPE public.risk_status AS ENUM ('open', 'mitigating', 'closed', 'accepted');
CREATE TYPE public.risk_category AS ENUM ('operational', 'strategic', 'compliance', 'financial', 'technical');
CREATE TYPE public.audit_status AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.audit_type AS ENUM ('internal', 'external', 'surveillance', 'certification');
CREATE TYPE public.nc_status AS ENUM ('open', 'investigating', 'corrective_action', 'verification', 'closed');
CREATE TYPE public.nc_type AS ENUM ('major', 'minor', 'observation');
CREATE TYPE public.capa_status AS ENUM ('open', 'in_progress', 'verification', 'closed', 'overdue');
CREATE TYPE public.capa_type AS ENUM ('corrective', 'preventive');
CREATE TYPE public.capa_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE public.training_status AS ENUM ('not_started', 'in_progress', 'completed', 'overdue');
CREATE TYPE public.decision_status AS ENUM ('open', 'in_progress', 'completed', 'overdue');
CREATE TYPE public.decision_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE public.report_status AS ENUM ('draft', 'generated', 'scheduled', 'archived');
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'auditor', 'user');

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  department TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  document_number TEXT,
  type public.document_type NOT NULL DEFAULT 'procedure',
  status public.document_status NOT NULL DEFAULT 'draft',
  version TEXT DEFAULT '1.0',
  owner_id UUID REFERENCES auth.users(id),
  clause TEXT,
  content TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Risks table
CREATE TABLE public.risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_number TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category public.risk_category NOT NULL DEFAULT 'operational',
  likelihood INTEGER NOT NULL DEFAULT 1 CHECK (likelihood >= 1 AND likelihood <= 5),
  impact INTEGER NOT NULL DEFAULT 1 CHECK (impact >= 1 AND impact <= 5),
  status public.risk_status NOT NULL DEFAULT 'open',
  owner_id UUID REFERENCES auth.users(id),
  mitigation TEXT,
  clause TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audits table
CREATE TABLE public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type public.audit_type NOT NULL DEFAULT 'internal',
  status public.audit_status NOT NULL DEFAULT 'planned',
  start_date DATE,
  end_date DATE,
  lead_auditor_id UUID REFERENCES auth.users(id),
  department TEXT,
  scope TEXT,
  findings_count INTEGER DEFAULT 0,
  major_findings INTEGER DEFAULT 0,
  minor_findings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Nonconformities table
CREATE TABLE public.nonconformities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nc_number TEXT,
  title TEXT NOT NULL,
  description TEXT,
  type public.nc_type NOT NULL DEFAULT 'minor',
  status public.nc_status NOT NULL DEFAULT 'open',
  source TEXT,
  owner_id UUID REFERENCES auth.users(id),
  department TEXT,
  clause TEXT,
  root_cause TEXT,
  audit_id UUID REFERENCES public.audits(id),
  due_date DATE,
  closed_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CAPA actions table
CREATE TABLE public.capa_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capa_number TEXT,
  title TEXT NOT NULL,
  description TEXT,
  type public.capa_type NOT NULL DEFAULT 'corrective',
  status public.capa_status NOT NULL DEFAULT 'open',
  priority public.capa_priority NOT NULL DEFAULT 'medium',
  source TEXT,
  source_reference TEXT,
  owner_id UUID REFERENCES auth.users(id),
  department TEXT,
  root_cause TEXT,
  verification_required BOOLEAN DEFAULT true,
  effectiveness TEXT,
  nc_id UUID REFERENCES public.nonconformities(id),
  due_date DATE,
  closed_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CAPA evidence table
CREATE TABLE public.capa_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capa_id UUID REFERENCES public.capa_actions(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Training courses table
CREATE TABLE public.training_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration_hours INTEGER,
  clause TEXT,
  is_mandatory BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Training records table
CREATE TABLE public.training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE NOT NULL,
  status public.training_status NOT NULL DEFAULT 'not_started',
  progress INTEGER DEFAULT 0,
  score INTEGER,
  due_date DATE,
  completed_date DATE,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- Management review meetings table
CREATE TABLE public.management_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled',
  attendees TEXT[],
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Management review agenda items
CREATE TABLE public.review_agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.management_reviews(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  presenter TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Management review decisions
CREATE TABLE public.review_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.management_reviews(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority public.decision_priority NOT NULL DEFAULT 'medium',
  status public.decision_status NOT NULL DEFAULT 'open',
  owner_id UUID REFERENCES auth.users(id),
  due_date DATE,
  closed_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- KPIs table
CREATE TABLE public.kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  current_value DECIMAL,
  target_value DECIMAL,
  unit TEXT,
  trend TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  template_id TEXT,
  status public.report_status NOT NULL DEFAULT 'draft',
  format TEXT DEFAULT 'pdf',
  file_url TEXT,
  file_size TEXT,
  generated_by UUID REFERENCES auth.users(id),
  sections TEXT[],
  date_range_start DATE,
  date_range_end DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Scheduled reports table
CREATE TABLE public.scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  template_id TEXT,
  frequency TEXT DEFAULT 'monthly',
  next_run DATE,
  recipients TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ISO Clauses reference table
CREATE TABLE public.iso_clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard TEXT NOT NULL,
  clause_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nonconformities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capa_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capa_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.management_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iso_clauses ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles (admin only for modifications)
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for documents (all authenticated users can read, managers+ can modify)
CREATE POLICY "Authenticated users can view documents" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Owners can update documents" ON public.documents FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins can delete documents" ON public.documents FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for risks
CREATE POLICY "Authenticated users can view risks" ON public.risks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create risks" ON public.risks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Owners and managers can update risks" ON public.risks FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins can delete risks" ON public.risks FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for audits
CREATE POLICY "Authenticated users can view audits" ON public.audits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auditors can create audits" ON public.audits FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'auditor') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Lead auditors can update audits" ON public.audits FOR UPDATE TO authenticated USING (auth.uid() = lead_auditor_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete audits" ON public.audits FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for nonconformities
CREATE POLICY "Authenticated users can view NCs" ON public.nonconformities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create NCs" ON public.nonconformities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Owners can update NCs" ON public.nonconformities FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins can delete NCs" ON public.nonconformities FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for CAPA actions
CREATE POLICY "Authenticated users can view CAPAs" ON public.capa_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create CAPAs" ON public.capa_actions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Owners can update CAPAs" ON public.capa_actions FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins can delete CAPAs" ON public.capa_actions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for CAPA evidence
CREATE POLICY "Authenticated users can view evidence" ON public.capa_evidence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can upload evidence" ON public.capa_evidence FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Uploaders can delete evidence" ON public.capa_evidence FOR DELETE TO authenticated USING (auth.uid() = uploaded_by OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for training courses
CREATE POLICY "Authenticated users can view courses" ON public.training_courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage courses" ON public.training_courses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- RLS Policies for training records
CREATE POLICY "Users can view own training" ON public.training_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Managers can view all training" ON public.training_records FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Users can update own training" ON public.training_records FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can insert training" ON public.training_records FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for management reviews
CREATE POLICY "Authenticated users can view reviews" ON public.management_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage reviews" ON public.management_reviews FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- RLS Policies for agenda items
CREATE POLICY "Authenticated users can view agenda" ON public.review_agenda_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage agenda" ON public.review_agenda_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- RLS Policies for decisions
CREATE POLICY "Authenticated users can view decisions" ON public.review_decisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create decisions" ON public.review_decisions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Owners can update decisions" ON public.review_decisions FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- RLS Policies for KPIs
CREATE POLICY "Authenticated users can view KPIs" ON public.kpis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage KPIs" ON public.kpis FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- RLS Policies for reports
CREATE POLICY "Authenticated users can view reports" ON public.reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Generators can manage reports" ON public.reports FOR UPDATE TO authenticated USING (auth.uid() = generated_by OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for scheduled reports
CREATE POLICY "Authenticated users can view scheduled" ON public.scheduled_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage scheduled" ON public.scheduled_reports FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- RLS Policies for ISO clauses (read-only for all)
CREATE POLICY "Anyone can view clauses" ON public.iso_clauses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage clauses" ON public.iso_clauses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add update triggers for all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON public.risks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON public.audits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_nonconformities_updated_at BEFORE UPDATE ON public.nonconformities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_capa_actions_updated_at BEFORE UPDATE ON public.capa_actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_courses_updated_at BEFORE UPDATE ON public.training_courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_records_updated_at BEFORE UPDATE ON public.training_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_management_reviews_updated_at BEFORE UPDATE ON public.management_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_review_decisions_updated_at BEFORE UPDATE ON public.review_decisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_scheduled_reports_updated_at BEFORE UPDATE ON public.scheduled_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for evidence files
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', false);

-- Storage policies for evidence bucket
CREATE POLICY "Authenticated users can upload evidence files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'evidence');
CREATE POLICY "Authenticated users can view evidence files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'evidence');
CREATE POLICY "Users can delete own evidence files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);
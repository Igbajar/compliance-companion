-- Create clause_evidence table for direct file uploads to clauses
CREATE TABLE public.clause_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clause_id UUID NOT NULL REFERENCES public.iso_clauses(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clause_document_links for linking existing documents to clauses
CREATE TABLE public.clause_document_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clause_id UUID NOT NULL REFERENCES public.iso_clauses(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  linked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clause_id, document_id)
);

-- Enable RLS
ALTER TABLE public.clause_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clause_document_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for clause_evidence
CREATE POLICY "Authenticated users can view clause evidence"
ON public.clause_evidence FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can upload clause evidence"
ON public.clause_evidence FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Uploaders and admins can delete clause evidence"
ON public.clause_evidence FOR DELETE
USING (auth.uid() = uploaded_by OR has_role(auth.uid(), 'admin'));

-- RLS policies for clause_document_links
CREATE POLICY "Authenticated users can view clause document links"
ON public.clause_document_links FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can link documents"
ON public.clause_document_links FOR INSERT
WITH CHECK (true);

CREATE POLICY "Linkers and admins can unlink documents"
ON public.clause_document_links FOR DELETE
USING (auth.uid() = linked_by OR has_role(auth.uid(), 'admin'));

-- Seed ISO 9001 clauses if not exists
INSERT INTO public.iso_clauses (standard, clause_number, title, description)
SELECT 'ISO 9001:2015', clause_number, title, description
FROM (VALUES
  ('4.1', 'Understanding the organization and its context', 'Determine external and internal issues relevant to the QMS'),
  ('4.2', 'Understanding the needs and expectations of interested parties', 'Determine interested parties and their requirements'),
  ('4.3', 'Determining the scope of the QMS', 'Determine boundaries and applicability of the QMS'),
  ('4.4', 'Quality management system and its processes', 'Establish, implement, maintain, and improve the QMS'),
  ('5.1', 'Leadership and commitment', 'Top management shall demonstrate leadership and commitment'),
  ('5.2', 'Policy', 'Establish quality policy appropriate to the organization'),
  ('5.3', 'Organizational roles, responsibilities and authorities', 'Assign and communicate responsibilities and authorities'),
  ('6.1', 'Actions to address risks and opportunities', 'Plan actions to address risks and opportunities'),
  ('6.2', 'Quality objectives and planning', 'Establish quality objectives at relevant functions'),
  ('6.3', 'Planning of changes', 'Changes to QMS shall be carried out in a planned manner'),
  ('7.1', 'Resources', 'Determine and provide resources needed for the QMS'),
  ('7.2', 'Competence', 'Determine necessary competence for personnel'),
  ('7.3', 'Awareness', 'Ensure personnel are aware of quality policy and objectives'),
  ('7.4', 'Communication', 'Determine internal and external communications'),
  ('7.5', 'Documented information', 'QMS shall include documented information'),
  ('8.1', 'Operational planning and control', 'Plan, implement, and control processes'),
  ('8.2', 'Requirements for products and services', 'Communicate with customers and determine requirements'),
  ('8.3', 'Design and development', 'Establish design and development process'),
  ('8.4', 'Control of externally provided processes', 'Ensure externally provided processes conform'),
  ('8.5', 'Production and service provision', 'Implement production and service provision under controlled conditions'),
  ('8.6', 'Release of products and services', 'Implement planned arrangements at appropriate stages'),
  ('8.7', 'Control of nonconforming outputs', 'Ensure nonconforming outputs are identified and controlled'),
  ('9.1', 'Monitoring, measurement, analysis and evaluation', 'Determine what needs to be monitored and measured'),
  ('9.2', 'Internal audit', 'Conduct internal audits at planned intervals'),
  ('9.3', 'Management review', 'Top management shall review the QMS'),
  ('10.1', 'General', 'Determine and select opportunities for improvement'),
  ('10.2', 'Nonconformity and corrective action', 'React to nonconformities and take corrective action'),
  ('10.3', 'Continual improvement', 'Continually improve the suitability, adequacy and effectiveness')
) AS t(clause_number, title, description)
WHERE NOT EXISTS (SELECT 1 FROM public.iso_clauses WHERE standard = 'ISO 9001:2015' AND iso_clauses.clause_number = t.clause_number);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.clause_evidence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clause_document_links;
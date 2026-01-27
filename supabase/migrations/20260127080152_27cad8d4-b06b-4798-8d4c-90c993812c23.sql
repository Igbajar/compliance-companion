-- Create audit trail table for clause evidence changes
CREATE TABLE public.clause_audit_trail (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clause_id UUID NOT NULL REFERENCES public.iso_clauses(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('evidence_added', 'evidence_removed', 'document_linked', 'document_unlinked')),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_clause_audit_trail_clause_id ON public.clause_audit_trail(clause_id);
CREATE INDEX idx_clause_audit_trail_created_at ON public.clause_audit_trail(created_at DESC);

-- Enable RLS
ALTER TABLE public.clause_audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS policies - authenticated users can view audit trail
CREATE POLICY "Users can view audit trail"
  ON public.clause_audit_trail
  FOR SELECT
  TO authenticated
  USING (true);

-- Only system can insert (via functions)
CREATE POLICY "System can insert audit trail"
  ON public.clause_audit_trail
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for audit trail
ALTER PUBLICATION supabase_realtime ADD TABLE public.clause_audit_trail;
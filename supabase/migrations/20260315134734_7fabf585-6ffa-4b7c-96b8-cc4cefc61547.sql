
-- Table to store weekly compliance snapshots for trend tracking
CREATE TABLE public.compliance_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_clauses INTEGER NOT NULL DEFAULT 0,
  compliant_clauses INTEGER NOT NULL DEFAULT 0,
  non_compliant_clauses INTEGER NOT NULL DEFAULT 0,
  compliance_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  open_ncs INTEGER NOT NULL DEFAULT 0,
  open_risks INTEGER NOT NULL DEFAULT 0,
  open_capas INTEGER NOT NULL DEFAULT 0,
  training_compliance_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for efficient date queries
CREATE INDEX idx_compliance_snapshots_date ON public.compliance_snapshots(snapshot_date DESC);

-- Unique constraint to prevent duplicate snapshots per date
ALTER TABLE public.compliance_snapshots ADD CONSTRAINT unique_snapshot_date UNIQUE (snapshot_date);

-- Enable RLS
ALTER TABLE public.compliance_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view snapshots"
  ON public.compliance_snapshots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert snapshots"
  ON public.compliance_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.compliance_snapshots;

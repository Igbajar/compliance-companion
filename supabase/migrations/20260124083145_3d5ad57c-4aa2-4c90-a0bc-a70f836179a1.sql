-- Create a view to expose cron jobs to the public schema
CREATE OR REPLACE VIEW public.cron_jobs_view AS
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobname
FROM cron.job;

-- Grant select on the view to authenticated users
GRANT SELECT ON public.cron_jobs_view TO authenticated;

-- Create function to get cron jobs (for admin users only)
CREATE OR REPLACE FUNCTION public.get_cron_jobs()
RETURNS TABLE (
  jobid bigint,
  schedule text,
  command text,
  nodename text,
  nodeport integer,
  database text,
  username text,
  active boolean,
  jobname text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  RETURN QUERY SELECT 
    j.jobid,
    j.schedule,
    j.command,
    j.nodename,
    j.nodeport,
    j.database,
    j.username,
    j.active,
    j.jobname
  FROM cron.job j;
END;
$$;

-- Create function to toggle cron job status
CREATE OR REPLACE FUNCTION public.toggle_cron_job(job_id bigint, is_active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Use cron.alter_job to update the active status
  PERFORM cron.alter_job(job_id, active := is_active);
END;
$$;

-- Create function to delete cron job
CREATE OR REPLACE FUNCTION public.delete_cron_job(job_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Use cron.unschedule to delete the job
  PERFORM cron.unschedule(job_id);
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_cron_jobs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_cron_job(bigint, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_cron_job(bigint) TO authenticated;
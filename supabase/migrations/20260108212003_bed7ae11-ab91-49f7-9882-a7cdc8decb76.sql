-- Add columns for tracking assignment changes/returns
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS change_type text,
ADD COLUMN IF NOT EXISTS change_reason text;

-- Add comment for documentation
COMMENT ON COLUMN public.assignments.change_type IS 'Type of change: upgrade, maintenance, damaged, employee_left, replacement, other';
COMMENT ON COLUMN public.assignments.change_reason IS 'Detailed reason/notes for the assignment change';
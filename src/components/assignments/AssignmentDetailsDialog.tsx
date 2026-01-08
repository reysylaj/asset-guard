import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Assignment = Database['public']['Tables']['assignments']['Row'];

interface Props {
  assignment: Assignment | null;
  open: boolean;
  onClose: () => void;
}

export function AssignmentDetailsDialog({ assignment, open, onClose }: Props) {
  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assignment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <p><b>Status:</b> {assignment.end_date ? 'Returned' : 'Active'}</p>
          <p><b>Start Date:</b> {format(new Date(assignment.start_date), 'PPP')}</p>
          <p><b>End Date:</b> {assignment.end_date ? format(new Date(assignment.end_date), 'PPP') : '—'}</p>
          <p><b>Notes:</b> {assignment.notes ?? '—'}</p>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

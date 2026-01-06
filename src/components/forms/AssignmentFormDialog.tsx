import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAssignments } from '@/hooks/useAssignments';
import { useEmployees } from '@/hooks/useEmployees';
import { useAssets } from '@/hooks/useAssets';

const assignmentSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  asset_id: z.string().min(1, 'Asset is required'),
  start_date: z.string().min(1, 'Start date is required'),
  notes: z.string().optional(),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface AssignmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignmentFormDialog({ open, onOpenChange }: AssignmentFormDialogProps) {
  const { createAssignment } = useAssignments();
  const { data: employees = [] } = useEmployees();
  const { data: assets = [] } = useAssets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeEmployees = employees.filter(e => e.status === 'active');
  const availableAssets = assets.filter(a => a.status === 'spare' || a.status === 'ordered');

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      employee_id: '',
      asset_id: '',
      start_date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const onSubmit = async (data: AssignmentFormData) => {
    setIsSubmitting(true);
    try {
      await createAssignment.mutateAsync(data);
      onOpenChange(false);
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Assignment</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select value={form.watch('employee_id')} onValueChange={(v) => form.setValue('employee_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {activeEmployees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} {emp.surname} ({emp.badge_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.employee_id && (
              <p className="text-xs text-destructive">{form.formState.errors.employee_id.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Asset</Label>
            <Select value={form.watch('asset_id')} onValueChange={(v) => form.setValue('asset_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
              <SelectContent>
                {availableAssets.map(asset => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.asset_id} - {asset.manufacturer} {asset.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.asset_id && (
              <p className="text-xs text-destructive">{form.formState.errors.asset_id.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input id="start_date" type="date" {...form.register('start_date')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...form.register('notes')} placeholder="Optional notes..." />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Assignment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

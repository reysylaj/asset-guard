import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useCloseAssignment } from '@/hooks/useAssignments';
import type { AssignmentWithRelations } from '@/types/database';
import type { Database } from '@/integrations/supabase/types';

type AssetStatus = Database['public']['Enums']['asset_status'];

const RETURN_REASONS = [
  { value: 'upgrade', label: 'Upgrade to new device' },
  { value: 'maintenance', label: 'Needs maintenance/repair' },
  { value: 'damaged', label: 'Device damaged' },
  { value: 'employee_left', label: 'Employee left company' },
  { value: 'reassignment', label: 'Reassigning to another employee' },
  { value: 'end_of_life', label: 'End of device lifecycle' },
  { value: 'other', label: 'Other reason' },
] as const;

const ASSET_STATUS_OPTIONS: { value: AssetStatus; label: string }[] = [
  { value: 'spare', label: 'Spare (Available for assignment)' },
  { value: 'under_repair', label: 'Under Repair' },
  { value: 'quarantined', label: 'Quarantined (Needs formatting)' },
  { value: 'retired', label: 'Retired' },
];

const returnSchema = z.object({
  change_type: z.string().min(1, 'Please select a reason'),
  change_reason: z.string().optional(),
  asset_status_after: z.enum(['spare', 'under_repair', 'quarantined', 'retired']),
});

type ReturnFormData = z.infer<typeof returnSchema>;

interface ReturnAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: AssignmentWithRelations | null;
}

export function ReturnAssetDialog({ open, onOpenChange, assignment }: ReturnAssetDialogProps) {
  const closeAssignment = useCloseAssignment();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      change_type: '',
      change_reason: '',
      asset_status_after: 'spare',
    },
  });

  const changeType = watch('change_type');

  const onSubmit = async (data: ReturnFormData) => {
    if (!assignment) return;

    await closeAssignment.mutateAsync({
      id: assignment.id,
      end_date: new Date().toISOString().split('T')[0],
      change_type: data.change_type,
      change_reason: data.change_reason,
      asset_id: assignment.asset_id,
      asset_status_after: data.asset_status_after,
    });

    reset();
    onOpenChange(false);
  };

  if (!assignment) return null;

  const asset = assignment.asset;
  const employee = assignment.employee;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Return Asset
          </DialogTitle>
          <DialogDescription>
            End the current assignment and update asset status
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Assignment Info */}
          <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Employee:</span>
              <span className="font-medium">{employee?.name} {employee?.surname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Asset:</span>
              <span className="font-mono">{asset?.asset_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Device:</span>
              <span>{asset?.manufacturer} {asset?.model}</span>
            </div>
          </div>

          {/* Return Reason */}
          <div className="space-y-2">
            <Label>Return Reason *</Label>
            <Select
              value={changeType}
              onValueChange={(value) => setValue('change_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason..." />
              </SelectTrigger>
              <SelectContent>
                {RETURN_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.change_type && (
              <p className="text-sm text-destructive">{errors.change_type.message}</p>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              {...register('change_reason')}
              placeholder="Any additional details about the return..."
              rows={3}
            />
          </div>

          {/* Asset Status After Return */}
          <div className="space-y-2">
            <Label>Asset Status After Return *</Label>
            <Select
              value={watch('asset_status_after')}
              onValueChange={(value: 'spare' | 'under_repair' | 'quarantined' | 'retired') => setValue('asset_status_after', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={closeAssignment.isPending}>
              {closeAssignment.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Return
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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

import { useAssets } from '@/hooks/useAssets';
import { useCreateMaintenanceEvent } from '@/hooks/useMaintenance';

/* ------------------------------------------------------------------ */
/* 1️⃣  SINGLE SOURCE OF TRUTH FOR ENUM                                 */
/* ------------------------------------------------------------------ */
const MAINTENANCE_TYPES = [
  'formatting',
  'repair',
  'upgrade',
  'inspection',
  'replacement',
] as const;

type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];


/* ------------------------------------------------------------------ */
/* 2️⃣  ZOD SCHEMA                                                      */
/* ------------------------------------------------------------------ */
const maintenanceSchema = z.object({
  asset_id: z.string().min(1, 'Asset is required'),
  type: z.enum(MAINTENANCE_TYPES),
  date: z.string().min(1, 'Date is required'),
  performed_by: z.string().min(1, 'Performed by is required'),
  description: z.string().min(1, 'Description is required'),
  resulting_health: z.enum(['healthy', 'warning', 'critical']),
});


type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ------------------------------------------------------------------ */
/* 3️⃣  COMPONENT                                                       */
/* ------------------------------------------------------------------ */
export function MaintenanceFormDialog({
  open,
  onOpenChange,
}: MaintenanceFormDialogProps) {
  const createMaintenance = useCreateMaintenanceEvent();
  const { data: assets = [] } = useAssets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      asset_id: '',
      type: 'inspection',
      date: new Date().toISOString().split('T')[0],
      performed_by: '',
      description: '',
      resulting_health: 'healthy',
    },
  });

  const onSubmit = async (data: MaintenanceFormData) => {
    setIsSubmitting(true);
    try {
      await createMaintenance.mutateAsync({
        asset_id: data.asset_id,
        type: data.type,
        date: data.date,
        performed_by: data.performed_by,
        description: data.description,
        resulting_health: data.resulting_health,

        // required nullable DB fields
        parts_replaced: null,
        cost: null,
        downtime_hours: null,
      });

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
          <DialogTitle>Log Maintenance Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Asset */}
          <div className="space-y-2">
            <Label>Asset</Label>
            <Select
              value={form.watch('asset_id')}
              onValueChange={(v) => form.setValue('asset_id', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.asset_id} – {asset.manufacturer} {asset.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(v) =>
                  form.setValue('type', v as MaintenanceType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAINTENANCE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...form.register('date')} />
            </div>
          </div>

          {/* Performed By */}
          <div className="space-y-2">
            <Label htmlFor="performed_by">Performed By</Label>
            <Input id="performed_by" {...form.register('performed_by')} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register('description')} />
          </div>

          {/* Health */}
          <div className="space-y-2">
            <Label>Resulting Health</Label>
            <Select
              value={form.watch('resulting_health')}
              onValueChange={(v) =>
                form.setValue(
                  'resulting_health',
                  v as MaintenanceFormData['resulting_health']
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Log Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

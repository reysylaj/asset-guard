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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAssets } from '@/hooks/useAssets';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];

const assetSchema = z.object({
  asset_id: z.string().min(1, 'Asset ID is required').max(50),
  type: z.enum(['laptop', 'desktop', 'monitor', 'server', 'network_device', 'accessory']),
  manufacturer: z.string().min(1, 'Manufacturer is required').max(100),
  model: z.string().min(1, 'Model is required').max(100),
  serial_number: z.string().min(1, 'Serial number is required').max(100),
  hostname: z.string().optional(),
  status: z.enum(['planned', 'ordered', 'in_use', 'spare', 'under_repair', 'quarantined', 'retired', 'disposed']),
  ownership: z.enum(['company', 'leased', 'personal']),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  warranty_expiry: z.string().min(1, 'Warranty expiry is required'),
  purchase_cost: z.coerce.number().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
}

export function AssetFormDialog({ open, onOpenChange, asset }: AssetFormDialogProps) {
  const { createAsset, updateAsset } = useAssets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: asset ? {
      asset_id: asset.asset_id,
      type: asset.type as AssetFormData['type'],
      manufacturer: asset.manufacturer,
      model: asset.model,
      serial_number: asset.serial_number,
      hostname: asset.hostname || '',
      status: asset.status as AssetFormData['status'],
      ownership: asset.ownership as AssetFormData['ownership'],
      purchase_date: asset.purchase_date,
      warranty_expiry: asset.warranty_expiry,
      purchase_cost: asset.purchase_cost || undefined,
    } : {
      asset_id: '',
      type: 'laptop',
      manufacturer: '',
      model: '',
      serial_number: '',
      hostname: '',
      status: 'spare',
      ownership: 'company',
      purchase_date: new Date().toISOString().split('T')[0],
      warranty_expiry: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: AssetFormData) => {
    setIsSubmitting(true);
    try {
      if (asset) {
        await updateAsset.mutateAsync({ id: asset.id, ...data });
      } else {
        await createAsset.mutateAsync(data);
      }
      onOpenChange(false);
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{asset ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asset_id">Asset ID</Label>
              <Input id="asset_id" {...form.register('asset_id')} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.watch('type')} onValueChange={(v) => form.setValue('type', v as AssetFormData['type'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="monitor">Monitor</SelectItem>
                  <SelectItem value="server">Server</SelectItem>
                  <SelectItem value="network_device">Network Device</SelectItem>
                  <SelectItem value="accessory">Accessory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input id="manufacturer" {...form.register('manufacturer')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" {...form.register('model')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input id="serial_number" {...form.register('serial_number')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hostname">Hostname</Label>
              <Input id="hostname" {...form.register('hostname')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.watch('status')} onValueChange={(v) => form.setValue('status', v as AssetFormData['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="spare">Spare</SelectItem>
                  <SelectItem value="in_use">In Use</SelectItem>
                  <SelectItem value="under_repair">Under Repair</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ownership</Label>
              <Select value={form.watch('ownership')} onValueChange={(v) => form.setValue('ownership', v as AssetFormData['ownership'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="leased">Leased</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input id="purchase_date" type="date" {...form.register('purchase_date')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
              <Input id="warranty_expiry" type="date" {...form.register('warranty_expiry')} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (asset ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

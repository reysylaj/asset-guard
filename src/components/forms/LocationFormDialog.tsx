import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocations } from '@/hooks/useLocations';
import type { Database } from '@/integrations/supabase/types';

type Location = Database['public']['Tables']['locations']['Row'];

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['office', 'storage', 'server_room', 'rack', 'warehouse', 'remote']),
  building: z.string().optional(),
  floor: z.string().optional(),
  rack_position: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: Location | null;
}

export function LocationFormDialog({ open, onOpenChange, location }: LocationFormDialogProps) {
  const { createLocation, updateLocation } = useLocations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: location ? {
      name: location.name,
      type: location.type,
      building: location.building || '',
      floor: location.floor || '',
      rack_position: location.rack_position || '',
    } : {
      name: '',
      type: 'office',
      building: '',
      floor: '',
      rack_position: '',
    },
  });

  const onSubmit = async (data: LocationFormData) => {
    setIsSubmitting(true);
    try {
      if (location) {
        await updateLocation.mutateAsync({ id: location.id, ...data });
      } else {
        await createLocation.mutateAsync(data);
      }
      onOpenChange(false);
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{location ? 'Edit Location' : 'Add Location'}</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register('name')} />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.watch('type')} onValueChange={(v) => form.setValue('type', v as LocationFormData['type'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="storage">Storage</SelectItem>
                <SelectItem value="server_room">Server Room</SelectItem>
                <SelectItem value="rack">Rack</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="building">Building</Label>
              <Input id="building" {...form.register('building')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Floor</Label>
              <Input id="floor" {...form.register('floor')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rack_position">Rack Position</Label>
            <Input id="rack_position" {...form.register('rack_position')} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (location ? 'Update' : 'Create')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

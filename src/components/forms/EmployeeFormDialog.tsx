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
import { useEmployees } from '@/hooks/useEmployees';
import type { Database } from '@/integrations/supabase/types';

type Employee = Database['public']['Tables']['employees']['Row'];

const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  surname: z.string().min(1, 'Surname is required').max(100),
  department: z.string().min(1, 'Department is required').max(100),
  badge_id: z.string().min(1, 'Badge ID is required').max(50),
  health_card_id: z.string().optional(),
  status: z.enum(['active', 'left']),
  start_date: z.string().min(1, 'Start date is required'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function EmployeeFormDialog({ open, onOpenChange, employee }: EmployeeFormDialogProps) {
  const { createEmployee, updateEmployee } = useEmployees();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee ? {
      name: employee.name,
      surname: employee.surname,
      department: employee.department || '',
      badge_id: employee.badge_id,
      health_card_id: employee.health_card_id || '',
      status: employee.status,
      start_date: employee.start_date,
    } : {
      name: '',
      surname: '',
      department: '',
      badge_id: '',
      health_card_id: '',
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      if (employee) {
        await updateEmployee.mutateAsync({ id: employee.id, ...data });
      } else {
        await createEmployee.mutateAsync(data);
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
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">First Name</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">Last Name</Label>
              <Input id="surname" {...form.register('surname')} />
              {form.formState.errors.surname && (
                <p className="text-xs text-destructive">{form.formState.errors.surname.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" {...form.register('department')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="badge_id">Badge ID</Label>
              <Input id="badge_id" {...form.register('badge_id')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="health_card_id">Health Card ID</Label>
              <Input id="health_card_id" {...form.register('health_card_id')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.watch('status')} onValueChange={(v) => form.setValue('status', v as 'active' | 'left')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" type="date" {...form.register('start_date')} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (employee ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

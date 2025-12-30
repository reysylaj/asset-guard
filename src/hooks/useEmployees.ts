import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Employee, EmployeeWithAssignments, EmploymentStatus } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('surname', { ascending: true });
      
      if (error) throw error;
      return data as Employee[];
    },
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Employee | null;
    },
    enabled: !!id,
  });
}

export function useEmployeeWithAssignments(id: string | undefined) {
  return useQuery({
    queryKey: ['employees', id, 'with-assignments'],
    queryFn: async () => {
      if (!id) return null;
      
      // Get employee
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (empError) throw empError;
      if (!employee) return null;
      
      // Get current assignments with asset details
      const { data: assignments, error: assignError } = await supabase
        .from('assignments')
        .select(`
          *,
          asset:assets(*)
        `)
        .eq('employee_id', id)
        .order('start_date', { ascending: false });
      
      if (assignError) throw assignError;
      
      return {
        ...employee,
        current_assignments: assignments?.filter(a => a.status === 'active' || a.status === 'pending_acceptance'),
        assignment_count: assignments?.filter(a => a.status === 'active' || a.status === 'pending_acceptance').length || 0,
      } as EmployeeWithAssignments;
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by' | 'is_offboarding_complete' | 'offboarding_completed_at' | 'offboarding_completed_by'>) => {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Employee Created',
        description: 'The employee record has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Employee> & { id: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees', data.id] });
      toast({
        title: 'Employee Updated',
        description: 'The employee record has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useMarkEmployeeAsLeft() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, endDate }: { id: string; endDate: string }) => {
      // First check for active assignments
      const { data: assignments, error: checkError } = await supabase
        .from('assignments')
        .select('id')
        .eq('employee_id', id)
        .in('status', ['pending_acceptance', 'active']);
      
      if (checkError) throw checkError;
      
      if (assignments && assignments.length > 0) {
        throw new Error(`Employee has ${assignments.length} active assignment(s). Please return all assets before marking as left.`);
      }
      
      // Update employee status
      const { data, error } = await supabase
        .from('employees')
        .update({
          status: 'left' as EmploymentStatus,
          end_date: endDate,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees', data.id] });
      toast({
        title: 'Employee Status Updated',
        description: 'The employee has been marked as left.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

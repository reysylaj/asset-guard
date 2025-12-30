import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Assignment, AssignmentWithRelations, AssignmentStatus } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useAssignments() {
  return useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          employee:employees(*),
          asset:assets(*)
        `)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as AssignmentWithRelations[];
    },
  });
}

export function useAssignment(id: string | undefined) {
  return useQuery({
    queryKey: ['assignments', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          employee:employees(*),
          asset:assets(*)
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as AssignmentWithRelations | null;
    },
    enabled: !!id,
  });
}

export function useActiveAssignmentsForEmployee(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['assignments', 'employee', employeeId, 'active'],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          asset:assets(*)
        `)
        .eq('employee_id', employeeId)
        .in('status', ['pending_acceptance', 'active'])
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as AssignmentWithRelations[];
    },
    enabled: !!employeeId,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assignment: {
      asset_id: string;
      employee_id: string;
      start_date: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          ...assignment,
          status: 'pending_acceptance' as AssignmentStatus,
        })
        .select()
        .single();
      
      if (error) {
        // Check for specific constraint violations
        if (error.message.includes('Cannot assign to inactive')) {
          throw new Error('Cannot assign assets to inactive or offboarded employees.');
        }
        if (error.message.includes('Asset cannot be assigned')) {
          throw new Error('This asset cannot be assigned. It may be retired, disposed, quarantined, or non-compliant.');
        }
        if (error.code === '23505') {
          throw new Error('This asset already has an active assignment.');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Assignment Created',
        description: 'The asset has been assigned. Awaiting acceptance.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Assignment Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useAcceptAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, notes, digitalAcknowledgment }: { 
      id: string; 
      notes?: string;
      digitalAcknowledgment?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('assignments')
        .update({
          status: 'active' as AssignmentStatus,
          accepted_at: new Date().toISOString(),
          acceptance_notes: notes,
          digital_acknowledgment: digitalAcknowledgment || false,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({
        title: 'Assignment Accepted',
        description: 'The assignment has been confirmed.',
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

export function useReturnAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      returnCondition, 
      damageNotes,
      requiresFormatting 
    }: { 
      id: string; 
      returnCondition?: string;
      damageNotes?: string;
      requiresFormatting?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('assignments')
        .update({
          status: 'returned' as AssignmentStatus,
          end_date: new Date().toISOString().split('T')[0],
          returned_at: new Date().toISOString(),
          return_condition: returnCondition,
          damage_notes: damageNotes,
          requires_formatting: requiresFormatting || false,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Asset Returned',
        description: 'The asset has been returned and is now available.',
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

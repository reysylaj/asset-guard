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
      // 1️⃣ create assignment
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          ...assignment,
          status: 'pending_acceptance',
        })
        .select()
        .single();

      if (error) throw error;

      // 2️⃣ update asset status
      const { error: assetError } = await supabase
        .from('assets')
        .update({ status: 'in_use' })
        .eq('id', assignment.asset_id);

      if (assetError) throw assetError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({
        title: 'Assignment Created',
        description: 'Asset assigned and marked as in use.',
      });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      employee_id: string;
      asset_id: string;
      start_date: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('assignments')
        .update({
          employee_id: data.employee_id,
          asset_id: data.asset_id,
          start_date: data.start_date,
          notes: data.notes,
        })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({
        title: 'Assignment Updated',
        description: 'The assignment has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
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


export function useCloseAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      end_date: string; // yyyy-mm-dd
      change_type: string;
      change_reason?: string;
      asset_id: string;
      asset_status_after: 'spare' | 'under_repair' | 'quarantined' | 'retired';
    }) => {
      // 1) close assignment (keep history)
      const { error: aErr } = await supabase
        .from('assignments')
        .update({
          status: 'returned',
          end_date: payload.end_date,
          returned_at: new Date().toISOString(),
          change_type: payload.change_type,
          change_reason: payload.change_reason ?? null,
          // if you have auth uid available in the client you can set changed_by too
        })
        .eq('id', payload.id);

      if (aErr) throw aErr;

      // 2) update asset status
      const { error: assetErr } = await supabase
        .from('assets')
        .update({ status: payload.asset_status_after })
        .eq('id', payload.asset_id);

      if (assetErr) throw assetErr;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });

      toast({
        title: 'Assignment closed',
        description: 'History saved and asset status updated.',
      });
    },

    onError: (error: any) => {
      toast({
        title: 'Close failed',
        description: error.message ?? 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });
}

export function useReplaceAssetForEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      current_assignment_id: string;
      employee_id: string;
      old_asset_id: string;
      new_asset_id: string;
      date: string; // yyyy-mm-dd
      reason?: string;
    }) => {
      // A) close old assignment
      const { error: closeErr } = await supabase
        .from('assignments')
        .update({
          status: 'returned',
          end_date: payload.date,
          returned_at: new Date().toISOString(),
          change_type: 'replacement',
          change_reason: payload.reason ?? null,
        })
        .eq('id', payload.current_assignment_id);

      if (closeErr) throw closeErr;

      // B) old asset -> to_format
      const { error: oldAssetErr } = await supabase
        .from('assets')
        .update({ status: 'spare' })
        .eq('id', payload.old_asset_id);

      if (oldAssetErr) throw oldAssetErr;

      // C) create new assignment
      const { error: createErr } = await supabase
        .from('assignments')
        .insert({
          employee_id: payload.employee_id,
          asset_id: payload.new_asset_id,
          start_date: payload.date,
          status: 'pending_acceptance',
          notes: payload.reason ?? null,
        });

      if (createErr) throw createErr;

      // D) new asset -> in_use
      const { error: newAssetErr } = await supabase
        .from('assets')
        .update({ status: 'in_use' })
        .eq('id', payload.new_asset_id);

      if (newAssetErr) throw newAssetErr;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });

      toast({
        title: 'Asset replaced',
        description: 'Old assignment closed, new created, history saved.',
      });
    },

    onError: (error: any) => {
      toast({
        title: 'Replace failed',
        description: error.message ?? 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MaintenanceEvent } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useMaintenanceEvents() {
  return useQuery({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_events')
        .select(`
          *,
          asset:assets(*)
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useMaintenanceEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['maintenance', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('maintenance_events')
        .select(`
          *,
          asset:assets(*)
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useAssetMaintenanceHistory(assetId: string | undefined) {
  return useQuery({
    queryKey: ['maintenance', 'asset', assetId],
    queryFn: async () => {
      if (!assetId) return [];
      
      const { data, error } = await supabase
        .from('maintenance_events')
        .select('*')
        .eq('asset_id', assetId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as MaintenanceEvent[];
    },
    enabled: !!assetId,
  });
}

export function useCreateMaintenanceEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (event: Omit<MaintenanceEvent, 'id' | 'created_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('maintenance_events')
        .insert(event)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['assets', data.asset_id] });
      toast({
        title: 'Maintenance Logged',
        description: 'The maintenance event has been recorded.',
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

export function useLogFormatting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      assetId, 
      performedBy, 
      description 
    }: { 
      assetId: string; 
      performedBy: string;
      description: string;
    }) => {
      const { data, error } = await supabase
        .from('maintenance_events')
        .insert({
          asset_id: assetId,
          type: 'formatting',
          date: new Date().toISOString().split('T')[0],
          performed_by: performedBy,
          description,
          resulting_health: 'healthy',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['assets', data.asset_id] });
      toast({
        title: 'Formatting Logged',
        description: 'The device formatting has been recorded.',
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


export function useMaintenance() {
  return {
    list: useMaintenanceEvents(),
    getById: useMaintenanceEvent,
    getByAsset: useAssetMaintenanceHistory,
    create: useCreateMaintenanceEvent(),
  };
}

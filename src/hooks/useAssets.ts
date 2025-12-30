import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Asset, AssetWithRelations, StorageUnit, AssetStatus } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          current_location:locations(*)
        `)
        .order('asset_id', { ascending: true });
      
      if (error) throw error;
      return data as AssetWithRelations[];
    },
  });
}

export function useAsset(id: string | undefined) {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          current_location:locations(*),
          storage_units(*)
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as AssetWithRelations | null;
    },
    enabled: !!id,
  });
}

export function useAssetWithHistory(id: string | undefined) {
  return useQuery({
    queryKey: ['assets', id, 'with-history'],
    queryFn: async () => {
      if (!id) return null;
      
      // Get asset with storage units
      const { data: asset, error: assetError } = await supabase
        .from('assets')
        .select(`
          *,
          current_location:locations(*),
          storage_units(*)
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (assetError) throw assetError;
      if (!asset) return null;
      
      // Get assignment history
      const { data: assignments, error: assignError } = await supabase
        .from('assignments')
        .select(`
          *,
          employee:employees(*)
        `)
        .eq('asset_id', id)
        .order('start_date', { ascending: false });
      
      if (assignError) throw assignError;
      
      // Get maintenance history
      const { data: maintenance, error: maintError } = await supabase
        .from('maintenance_events')
        .select('*')
        .eq('asset_id', id)
        .order('date', { ascending: false });
      
      if (maintError) throw maintError;
      
      // Get location history
      const { data: locationHistory, error: locError } = await supabase
        .from('location_history')
        .select(`
          *,
          location:locations(*)
        `)
        .eq('asset_id', id)
        .order('start_date', { ascending: false });
      
      if (locError) throw locError;
      
      return {
        ...asset,
        assignments,
        maintenance_events: maintenance,
        location_history: locationHistory,
      };
    },
    enabled: !!id,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (asset: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('assets')
        .insert(asset as never)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({
        title: 'Asset Created',
        description: 'The asset has been created successfully.',
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

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
      // Check if asset is readonly (disposed)
      const { data: existing, error: checkError } = await supabase
        .from('assets')
        .select('is_readonly, status')
        .eq('id', id)
        .single();
      
      if (checkError) throw checkError;
      
      if (existing.is_readonly) {
        throw new Error('Cannot modify a disposed asset. This record is read-only.');
      }
      
      const { data, error } = await supabase
        .from('assets')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['assets', data.id] });
      toast({
        title: 'Asset Updated',
        description: 'The asset has been updated successfully.',
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

export function useUpdateAssetStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AssetStatus }) => {
      // Check if asset has active assignments when retiring/disposing
      if (['retired', 'disposed', 'quarantined'].includes(status)) {
        const { data: assignments, error: checkError } = await supabase
          .from('assignments')
          .select('id')
          .eq('asset_id', id)
          .in('status', ['pending_acceptance', 'active']);
        
        if (checkError) throw checkError;
        
        if (assignments && assignments.length > 0) {
          throw new Error(`Cannot ${status} asset with active assignments. Please return the asset first.`);
        }
      }
      
      const { data, error } = await supabase
        .from('assets')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['assets', data.id] });
      toast({
        title: 'Status Updated',
        description: `Asset status changed to ${data.status.replace('_', ' ')}.`,
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

export function useAddStorageUnit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (unit: Omit<StorageUnit, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('storage_units')
        .insert(unit)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assets', data.asset_id] });
      toast({
        title: 'Storage Added',
        description: 'Storage unit has been added to the asset.',
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

// Calculate book value utility
export function calculateBookValue(
  purchaseCost: number | null,
  purchaseDate: string | null,
  usefulLifeYears: number
): number | null {
  if (!purchaseCost || !purchaseDate) return null;
  
  const purchase = new Date(purchaseDate);
  const now = new Date();
  const ageInYears = (now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 365);
  const annualDepreciation = purchaseCost / usefulLifeYears;
  const bookValue = purchaseCost - (annualDepreciation * ageInYears);
  
  return Math.max(bookValue, 0);
}

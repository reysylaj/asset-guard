import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Location, LocationHistory } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Location[];
    },
  });
}

export function useLocation(id: string | undefined) {
  return useQuery({
    queryKey: ['locations', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Location | null;
    },
    enabled: !!id,
  });
}

export function useLocationWithAssets(id: string | undefined) {
  return useQuery({
    queryKey: ['locations', id, 'with-assets'],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: location, error: locError } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (locError) throw locError;
      if (!location) return null;
      
      // Get assets currently at this location
      const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .eq('current_location_id', id);
      
      if (assetsError) throw assetsError;
      
      return {
        ...location,
        assets: assets || [],
        asset_count: assets?.length || 0,
      };
    },
    enabled: !!id,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (location: Omit<Location, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by' | 'is_active'>) => {
      const { data, error } = await supabase
        .from('locations')
        .insert(location)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: 'Location Created',
        description: 'The location has been created successfully.',
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

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Location> & { id: string }) => {
      const { data, error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['locations', data.id] });
      toast({
        title: 'Location Updated',
        description: 'The location has been updated successfully.',
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

export function useMoveAssetToLocation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ assetId, locationId, notes }: { 
      assetId: string; 
      locationId: string;
      notes?: string;
    }) => {
      // Close existing location history entry
      const { error: closeError } = await supabase
        .from('location_history')
        .update({ end_date: new Date().toISOString() })
        .eq('asset_id', assetId)
        .is('end_date', null);
      
      if (closeError) throw closeError;
      
      // Create new location history entry
      const { error: historyError } = await supabase
        .from('location_history')
        .insert({
          asset_id: assetId,
          location_id: locationId,
          notes,
        });
      
      if (historyError) throw historyError;
      
      // Update asset's current location
      const { data, error } = await supabase
        .from('assets')
        .update({ current_location_id: locationId })
        .eq('id', assetId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: 'Asset Moved',
        description: 'The asset has been moved to the new location.',
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

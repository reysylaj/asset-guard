import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Get employees stats
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id, status');
      
      if (empError) throw empError;
      
      const totalEmployees = employees?.length || 0;
      const activeEmployees = employees?.filter(e => e.status === 'active').length || 0;
      
      // Get assets stats
      const { data: assets, error: assetError } = await supabase
        .from('assets')
        .select('id, status, type, ownership');
      
      if (assetError) throw assetError;
      
      const totalAssets = assets?.length || 0;
      const assetsByStatus = {
        in_use: assets?.filter(a => a.status === 'in_use').length || 0,
        spare: assets?.filter(a => a.status === 'spare').length || 0,
        under_repair: assets?.filter(a => a.status === 'under_repair').length || 0,
        retired: assets?.filter(a => a.status === 'retired').length || 0,
        quarantined: assets?.filter(a => a.status === 'quarantined').length || 0,
        disposed: assets?.filter(a => a.status === 'disposed').length || 0,
        planned: assets?.filter(a => a.status === 'planned').length || 0,
        ordered: assets?.filter(a => a.status === 'ordered').length || 0,
      };
      
      const assetsByType = {
        laptop: assets?.filter(a => a.type === 'laptop').length || 0,
        desktop: assets?.filter(a => a.type === 'desktop').length || 0,
        monitor: assets?.filter(a => a.type === 'monitor').length || 0,
        server: assets?.filter(a => a.type === 'server').length || 0,
        network_device: assets?.filter(a => a.type === 'network_device').length || 0,
        accessory: assets?.filter(a => a.type === 'accessory').length || 0,
      };
      
      const assetsByOwnership = {
        TinextaCyber: assets?.filter(a => a.ownership === 'TinextaCyber').length || 0,
        FDM: assets?.filter(a => a.ownership === 'FDM').length || 0,
        ServiceFactory: assets?.filter(a => a.ownership === 'ServiceFactory').length || 0,
      };
      
      // Get active assignments
      const { data: assignments, error: assignError } = await supabase
        .from('assignments')
        .select('id, status');
      
      if (assignError) throw assignError;
      
      const activeAssignments = assignments?.filter(a => 
        a.status === 'active' || a.status === 'pending_acceptance'
      ).length || 0;
      
      return {
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          left: totalEmployees - activeEmployees,
        },
        assets: {
          total: totalAssets,
          byStatus: assetsByStatus,
          byType: assetsByType,
          byOwnership: assetsByOwnership,
        },
        assignments: {
          active: activeAssignments,
          total: assignments?.length || 0,
        },
      };
    },
  });
}

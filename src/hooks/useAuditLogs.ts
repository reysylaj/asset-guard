import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AuditLog } from '@/types/database';

export function useAuditLogs(filters?: {
  action?: string;
  entityType?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (filters?.action && filters.action !== 'all') {
        query = query.eq('action', filters.action as never);
      }
      
      if (filters?.entityType && filters.entityType !== 'all') {
        query = query.eq('entity_type', filters.entityType as never);
      }
      
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as AuditLog[];
    },
  });
}

export function useEntityAuditLogs(entityType: string, entityId: string | undefined) {
  return useQuery({
    queryKey: ['audit-logs', 'entity', entityType, entityId],
    queryFn: async () => {
      if (!entityId) return [];
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_type', entityType as never)
        .eq('entity_id', entityId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data as AuditLog[];
    },
    enabled: !!entityId,
  });
}

export function useRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: ['audit-logs', 'recent', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as AuditLog[];
    },
  });
}

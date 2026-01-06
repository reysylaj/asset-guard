import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Download,
  Calendar,
  Wrench,
  RefreshCw,
  ArrowUpCircle,
  ClipboardCheck,
  RotateCw,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useAssets } from '@/hooks/useAssets';
import { useAuth } from '@/contexts/AuthContext';
import { MaintenanceFormDialog } from '@/components/forms/MaintenanceFormDialog';
import type { Database } from '@/integrations/supabase/types';

type MaintenanceEvent = Database['public']['Tables']['maintenance_events']['Row'];
type MaintenanceType = Database['public']['Enums']['maintenance_type'];

const typeIcons: Record<MaintenanceType, typeof Wrench> = {
  formatting: RefreshCw,
  repair: Wrench,
  upgrade: ArrowUpCircle,
  inspection: ClipboardCheck,
  replacement: RotateCw,
  cleaning: RefreshCw,
  security_update: ClipboardCheck,
};

const typeLabels: Record<MaintenanceType, string> = {
  formatting: 'Formatting',
  repair: 'Repair',
  upgrade: 'Upgrade',
  inspection: 'Inspection',
  replacement: 'Replacement',
  cleaning: 'Cleaning',
  security_update: 'Security Update',
};

export default function Maintenance() {
  const { hasAnyRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);

  const { data: maintenanceEvents = [], isLoading } = useMaintenance();
  const { data: assets = [] } = useAssets();

  const canEdit = hasAnyRole(['it', 'admin']);

  const filteredEvents = maintenanceEvents.filter(event => {
    const asset = assets.find(a => a.id === event.asset_id);
    
    const matchesSearch = 
      asset?.asset_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.performed_by.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || event.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (event: MaintenanceEvent) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {format(new Date(event.date), 'MMM d, yyyy')}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (event: MaintenanceEvent) => {
        const Icon = typeIcons[event.type] || Wrench;
        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <StatusBadge status={event.type} />
          </div>
        );
      },
    },
    {
      key: 'asset',
      header: 'Asset',
      render: (event: MaintenanceEvent) => {
        const asset = assets.find(a => a.id === event.asset_id);
        if (!asset) return '—';
        return (
          <div>
            <p className="font-mono text-sm">{asset.asset_id}</p>
            <p className="text-xs text-muted-foreground">{asset.manufacturer} {asset.model}</p>
          </div>
        );
      },
    },
    {
      key: 'performed_by',
      header: 'Performed By',
      render: (event: MaintenanceEvent) => (
        <span className="text-sm">{event.performed_by}</span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (event: MaintenanceEvent) => (
        <span className="text-sm text-muted-foreground truncate max-w-[300px] block">
          {event.description}
        </span>
      ),
    },
    {
      key: 'resulting_health',
      header: 'Resulting Health',
      render: (event: MaintenanceEvent) => (
        <StatusBadge status={event.resulting_health || 'unknown'} />
      ),
    },
  ];

  const typeCounts = maintenanceEvents.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <MainLayout title="Maintenance" subtitle="Track all maintenance events and repairs">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Maintenance" 
      subtitle="Track all maintenance events and repairs"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {canEdit && (
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Log Event
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Total Events</p>
            <p className="text-2xl font-bold">{maintenanceEvents.length}</p>
          </div>
          {Object.entries(typeLabels).slice(0, 4).map(([type, label]) => (
            <div key={type} className="p-4 rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold">{typeCounts[type] || 0}</p>
            </div>
          ))}
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredEvents}
          columns={columns}
        />
      </div>

      <MaintenanceFormDialog 
        open={formOpen} 
        onOpenChange={setFormOpen}
      />
    </MainLayout>
  );
}

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable } from '@/components/ui/data-table';
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
  Building2,
  Warehouse,
  Server,
  LayoutGrid,
  Loader2
} from 'lucide-react';
import { useLocations } from '@/hooks/useLocations';
import { useAuth } from '@/contexts/AuthContext';
import { LocationFormDialog } from '@/components/forms/LocationFormDialog';
import type { Database } from '@/integrations/supabase/types';

type Location = Database['public']['Tables']['locations']['Row'];
type LocationType = Database['public']['Enums']['location_type'];

const typeIcons: Record<LocationType, typeof Building2> = {
  office: Building2,
  storage: Warehouse,
  server_room: Server,
  rack: LayoutGrid,
  warehouse: Warehouse,
  remote: Building2,
};

const typeLabels: Record<LocationType, string> = {
  office: 'Office',
  storage: 'Storage Room',
  server_room: 'Server Room',
  rack: 'Rack',
  warehouse: 'Warehouse',
  remote: 'Remote',
};

export default function Locations() {
  const { hasAnyRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const { data: locations = [], isLoading } = useLocations();

  const canEdit = hasAnyRole(['it', 'admin']);

  const filteredLocations = locations.filter(location => {
    const matchesSearch = 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.building?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || location.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const columns = [
    {
      key: 'name',
      header: 'Location',
      render: (location: Location) => {
        const Icon = typeIcons[location.type] || Building2;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{location.name}</p>
              {location.building && (
                <p className="text-xs text-muted-foreground">{location.building}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      render: (location: Location) => (
        <span className="text-sm">{typeLabels[location.type] || location.type}</span>
      ),
    },
    {
      key: 'floor',
      header: 'Floor',
      render: (location: Location) => (
        <span className="text-sm">{location.floor || '—'}</span>
      ),
    },
    {
      key: 'rack_position',
      header: 'Position',
      render: (location: Location) => (
        <span className="text-sm font-mono">{location.rack_position || '—'}</span>
      ),
    },
  ];

  const typeCounts = locations.reduce((acc, loc) => {
    acc[loc.type] = (acc[loc.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <MainLayout title="Locations" subtitle="Manage physical locations and asset placement">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Locations" 
      subtitle="Manage physical locations and asset placement"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search locations..."
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
              <Button size="sm" onClick={() => { setEditingLocation(null); setFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Total Locations</p>
            <p className="text-2xl font-bold">{locations.length}</p>
          </div>
          {Object.entries(typeLabels).slice(0, 4).map(([type, label]) => (
            <div key={type} className="p-4 rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground">{label}s</p>
              <p className="text-2xl font-bold">{typeCounts[type] || 0}</p>
            </div>
          ))}
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredLocations}
          columns={columns}
          onRowClick={(location) => {
            if (canEdit) {
              setEditingLocation(location);
              setFormOpen(true);
            }
          }}
        />
      </div>

      <LocationFormDialog 
        open={formOpen} 
        onOpenChange={setFormOpen}
        location={editingLocation}
      />
    </MainLayout>
  );
}

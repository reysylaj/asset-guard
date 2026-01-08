import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAsset } from '@/hooks/useAssets';

import { format } from 'date-fns';
import { AssetPreviewDialog } from '@/components/assets/AssetPreviewDialog';

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
  Eye,
  FileText,
  Pencil,
  Laptop,
  Monitor as MonitorIcon,
  Server,
  Network,
  Headphones,
  MonitorDot,
  Loader2
} from 'lucide-react';

import { useAssets } from '@/hooks/useAssets';
import { useEmployees } from '@/hooks/useEmployees';
import { useAssignments } from '@/hooks/useAssignments';
import { useAuth } from '@/contexts/AuthContext';
import { AssetFormDialog } from '@/components/forms/AssetFormDialog';
import type { Database } from '@/integrations/supabase/types';
import { OWNERSHIP_OPTIONS } from '@/constants/ownership';

type AssetType = Database['public']['Enums']['asset_type'];



const typeIcons: Record<string, typeof Laptop> = {
  laptop: Laptop,
  desktop: MonitorDot,
  monitor: MonitorIcon,
  server: Server,
  network_device: Network,
  accessory: Headphones,
};

const typeLabels: Record<string, string> = {
  laptop: 'Laptop',
  desktop: 'Desktop',
  monitor: 'Monitor',
  server: 'Server',
  network_device: 'Network Device',
  accessory: 'Accessory',
};

export default function Assets() {
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<any>(null);
  const { data: editingAsset } = useAsset(editingAssetId ?? undefined);


  const { data: assets = [], isLoading } = useAssets();
  const { data: employees = [] } = useEmployees();
  const { data: assignments = [] } = useAssignments();

  const canEdit = hasAnyRole(['it', 'admin']);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.asset_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serial_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.hostname?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesOwnership = ownershipFilter === 'all' || asset.ownership === ownershipFilter;

    return matchesSearch && matchesStatus && matchesType && matchesOwnership;
  });

  const getAssignedEmployee = (assetId: string) => {
    const assignment = assignments.find(a => a.asset_id === assetId && a.status === 'active');
    if (!assignment) return null;
    return employees.find(e => e.id === assignment.employee_id);
  };

  const columns = [
    {
      key: 'asset_id',
      header: 'Asset',
      render: (asset: any) => {
        const Icon = typeIcons[asset.type] || MonitorIcon;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium font-mono text-sm">{asset.asset_id}</p>
              <p className="text-xs text-muted-foreground">
                {asset.manufacturer} {asset.model}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      render: (asset: any) => (
        <span className="text-sm">{typeLabels[asset.type] || asset.type}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (asset: any) => <StatusBadge status={asset.status} />,
    },
    {
      key: 'ownership',
      header: 'Ownership',
      render: (asset: any) => <StatusBadge status={asset.ownership} />,
    },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      render: (asset: any) => {
        const employee = getAssignedEmployee(asset.id);
        return employee ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium">
              {employee.name[0]}{employee.surname[0]}
            </div>
            <span className="text-sm">{employee.name} {employee.surname}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      },
    },
    {
      key: 'serial_number',
      header: 'Serial Number',
      render: (asset: any) => (
        <span className="font-mono text-xs">{asset.serial_number}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (asset: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/assets/${asset.id}?export=pdf`);
            }}
          >
            <FileText className="w-4 h-4" />
          </Button>

          {/* VIEW */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewAsset(asset);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>


          {/* EDIT */}
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setEditingAssetId(asset.id);
                setFormOpen(true);
              }}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}
        </div>
        

      ),
    },
  ];

  if (isLoading) {
    return (
      <MainLayout title="Assets" subtitle="Manage all IT equipment and devices">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const handleExport = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Assets Report', 14, 20);

    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd')}`, 14, 28);

    autoTable(doc, {
      startY: 40,
      head: [[
        'Asset ID',
        'Type',
        'Status',
        'Ownership',
        'Manufacturer',
        'Model',
        'Serial Number'
      ]],
      body: filteredAssets.map(a => [
        a.asset_id,
        a.type,
        a.status,
        a.ownership,
        a.manufacturer,
        a.model,
        a.serial_number,
      ]),
    });

    doc.save(`assets_${Date.now()}.pdf`);
  };

  const formAsset = editingAsset
  ? {
      id: editingAsset.id,
      asset_id: editingAsset.asset_id,
      type: editingAsset.type,
      manufacturer: editingAsset.manufacturer,
      model: editingAsset.model,
      serial_number: editingAsset.serial_number,
      hostname: editingAsset.hostname,
      status: editingAsset.status,
      ownership: editingAsset.ownership,
      purchase_date: editingAsset.purchase_date,
      warranty_expiry: editingAsset.warranty_expiry,
      purchase_cost: editingAsset.purchase_cost,
      created_at: editingAsset.created_at,
      created_by: editingAsset.created_by,
      is_readonly: editingAsset.is_readonly,
    }
  : null;




  return (
    <MainLayout 
      title="Assets" 
      subtitle="Manage all IT equipment and devices"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by ID, serial, or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_use">In Use</SelectItem>
                <SelectItem value="spare">Spare</SelectItem>
                <SelectItem value="under_repair">Under Repair</SelectItem>
                <SelectItem value="quarantined">Quarantined</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ownershipFilter} onValueChange={setOwnershipFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Ownership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                {OWNERSHIP_OPTIONS.map(owner => (
                  <SelectItem key={owner} value={owner}>
                    {owner}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {canEdit && (
              <Button
                size="sm"
                onClick={() => {
                  setEditingAssetId(null);
                  setFormOpen(true);
                }}
              >

                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-2xl font-bold">{assets.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">In Use</p>
            <p className="text-2xl font-bold text-status-active">
              {assets.filter(a => a.status === 'in_use').length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Spare</p>
            <p className="text-2xl font-bold text-status-info">
              {assets.filter(a => a.status === 'spare').length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Under Repair</p>
            <p className="text-2xl font-bold text-status-warning">
              {assets.filter(a => a.status === 'under_repair').length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Retired</p>
            <p className="text-2xl font-bold text-status-neutral">
              {assets.filter(a => a.status === 'retired').length}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredAssets}
          columns={columns}
          onRowClick={(asset) => navigate(`/assets/${asset.id}`)}
        />
      </div>

      <AssetFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingAssetId(null);
        }}
        asset={formAsset}
      />

      <AssetPreviewDialog
        open={!!previewAsset}
        asset={previewAsset}
        onOpenChange={() => setPreviewAsset(null)}
      />

    </MainLayout>
  );
}

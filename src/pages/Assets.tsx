import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Eye,
  FileText,
  Laptop,
  Monitor as MonitorIcon,
  Server,
  Network,
  Headphones,
  MonitorDot
} from 'lucide-react';
import { assets, employees, assignments } from '@/data/mockData';
import type { Asset, AssetType } from '@/types';

const typeIcons: Record<AssetType, typeof Laptop> = {
  laptop: Laptop,
  desktop: MonitorDot,
  monitor: MonitorIcon,
  server: Server,
  network_device: Network,
  accessory: Headphones,
};

const typeLabels: Record<AssetType, string> = {
  laptop: 'Laptop',
  desktop: 'Desktop',
  monitor: 'Monitor',
  server: 'Server',
  network_device: 'Network Device',
  accessory: 'Accessory',
};

export default function Assets() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<string>('all');

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.hostname?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesOwnership = ownershipFilter === 'all' || asset.ownership === ownershipFilter;

    return matchesSearch && matchesStatus && matchesType && matchesOwnership;
  });

  const getAssignedEmployee = (assetId: string) => {
    const assignment = assignments.find(a => a.assetId === assetId && !a.endDate);
    if (!assignment) return null;
    const employee = employees.find(e => e.id === assignment.employeeId);
    return employee;
  };

  const columns = [
    {
      key: 'assetId',
      header: 'Asset',
      render: (asset: Asset) => {
        const Icon = typeIcons[asset.type];
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium font-mono text-sm">{asset.assetId}</p>
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
      render: (asset: Asset) => (
        <span className="text-sm">{typeLabels[asset.type]}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (asset: Asset) => <StatusBadge status={asset.status} />,
    },
    {
      key: 'ownership',
      header: 'Ownership',
      render: (asset: Asset) => <StatusBadge status={asset.ownership} />,
    },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      render: (asset: Asset) => {
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
      key: 'serialNumber',
      header: 'Serial Number',
      render: (asset: Asset) => (
        <span className="font-mono text-xs">{asset.serialNumber}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (asset: Asset) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/reports/asset/${asset.id}`);
            }}
          >
            <FileText className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

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
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="under_repair">Under Repair</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
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
                <SelectItem value="TinextaCyber">TinextaCyber</SelectItem>
                <SelectItem value="FDM">FDM</SelectItem>
                <SelectItem value="ServiceFactory">ServiceFactory</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
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
            <p className="text-sm text-muted-foreground">In Stock</p>
            <p className="text-2xl font-bold text-status-info">
              {assets.filter(a => a.status === 'in_stock').length}
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
    </MainLayout>
  );
}

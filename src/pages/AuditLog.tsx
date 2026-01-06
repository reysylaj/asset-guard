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
  Search, 
  Download,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
  UserMinus,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { cn } from '@/lib/utils';

const actionIcons: Record<string, typeof Plus> = {
  create: Plus,
  update: RefreshCw,
  delete: Trash2,
  assign: UserPlus,
  unassign: UserMinus,
};

const actionColors: Record<string, string> = {
  create: 'text-status-active bg-status-active/10',
  update: 'text-status-info bg-status-info/10',
  delete: 'text-status-danger bg-status-danger/10',
  assign: 'text-status-active bg-status-active/10',
  unassign: 'text-status-warning bg-status-warning/10',
};

export default function AuditLog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const { data: auditLogs = [], isLoading } = useAuditLogs();

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.entity_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  const columns = [
    {
      key: 'timestamp',
      header: 'Time',
      render: (log: any) => (
        <div>
          <p className="text-sm">{format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
          </p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (log: any) => {
        const Icon = actionIcons[log.action] || RefreshCw;
        return (
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              actionColors[log.action] || 'text-muted-foreground bg-muted'
            )}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="capitalize font-medium">{log.action}</span>
          </div>
        );
      },
    },
    {
      key: 'entity_type',
      header: 'Entity Type',
      render: (log: any) => (
        <span className="capitalize">{log.entity_type}</span>
      ),
    },
    {
      key: 'entity_id',
      header: 'Entity ID',
      render: (log: any) => (
        <span className="font-mono text-sm">{log.entity_id.slice(0, 8)}...</span>
      ),
    },
    {
      key: 'user_id',
      header: 'User',
      render: (log: any) => (
        <span className="font-mono text-sm">{log.user_id.slice(0, 8)}...</span>
      ),
    },
    {
      key: 'changes',
      header: 'Changes',
      render: (log: any) => {
        const changes = log.changes as Record<string, { old: unknown; new: unknown }> | null;
        if (!changes) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="max-w-[300px]">
            {Object.entries(changes).slice(0, 2).map(([field, val]) => (
              <div key={field} className="text-xs">
                <span className="text-muted-foreground">{field}: </span>
                <span className="text-status-danger">{String((val as any)?.old ?? 'null')}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="text-status-active">{String((val as any)?.new ?? 'null')}</span>
              </div>
            ))}
            {Object.keys(changes).length > 2 && (
              <span className="text-xs text-muted-foreground">+{Object.keys(changes).length - 2} more</span>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <MainLayout title="Audit Log" subtitle="Complete record of all system changes">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Audit Log" 
      subtitle="Complete record of all system changes"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Info Banner */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-sm">
            <strong>Note:</strong> This audit log is immutable and cannot be edited or deleted. 
            All changes to employees, assets, assignments, and maintenance events are automatically recorded.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by entity or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="assign">Assign</SelectItem>
                <SelectItem value="unassign">Unassign</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="asset">Asset</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="location">Location</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Log
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Total Events</p>
            <p className="text-2xl font-bold">{auditLogs.length}</p>
          </div>
          {['create', 'update', 'assign', 'unassign'].map(action => (
            <div key={action} className="p-4 rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground capitalize">{action}</p>
              <p className="text-2xl font-bold">
                {auditLogs.filter(l => l.action === action).length}
              </p>
            </div>
          ))}
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredLogs}
          columns={columns}
        />
      </div>
    </MainLayout>
  );
}

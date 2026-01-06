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
  Loader2,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useAssignments } from '@/hooks/useAssignments';
import { useEmployees } from '@/hooks/useEmployees';
import { useAssets } from '@/hooks/useAssets';
import { useAuth } from '@/contexts/AuthContext';
import { AssignmentFormDialog } from '@/components/forms/AssignmentFormDialog';
import type { Database } from '@/integrations/supabase/types';

type Assignment = Database['public']['Tables']['assignments']['Row'];

export default function Assignments() {
  const { hasAnyRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);

  const { data: assignments = [], isLoading } = useAssignments();
  const { data: employees = [] } = useEmployees();
  const { data: assets = [] } = useAssets();

  const canEdit = hasAnyRole(['it', 'admin']);

  const filteredAssignments = assignments.filter(assignment => {
    const employee = employees.find(e => e.id === assignment.employee_id);
    const asset = assets.find(a => a.id === assignment.asset_id);
    
    const matchesSearch = 
      employee?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee?.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset?.asset_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && assignment.status === 'active') ||
      (statusFilter === 'returned' && assignment.status === 'returned');

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      render: (assignment: Assignment) => {
        const employee = employees.find(e => e.id === assignment.employee_id);
        if (!employee) return '—';
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
              {employee.name[0]}{employee.surname[0]}
            </div>
            <div>
              <p className="font-medium">{employee.name} {employee.surname}</p>
              <p className="text-xs text-muted-foreground">{employee.department}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'asset',
      header: 'Asset',
      render: (assignment: Assignment) => {
        const asset = assets.find(a => a.id === assignment.asset_id);
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
      key: 'status',
      header: 'Status',
      render: (assignment: Assignment) => (
        <StatusBadge status={assignment.status === 'returned' ? 'left' : 'active'} />
      ),
    },
    {
      key: 'accepted',
      header: 'Accepted',
      render: (assignment: Assignment) => (
        assignment.accepted_at ? (
          <div className="flex items-center gap-1 text-status-active">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs">{format(new Date(assignment.accepted_at), 'MMM d, yyyy')}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Pending</span>
        )
      ),
    },
    {
      key: 'start_date',
      header: 'Start Date',
      render: (assignment: Assignment) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {format(new Date(assignment.start_date), 'MMM d, yyyy')}
        </div>
      ),
    },
    {
      key: 'end_date',
      header: 'End Date',
      render: (assignment: Assignment) => 
        assignment.end_date ? (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {format(new Date(assignment.end_date), 'MMM d, yyyy')}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (assignment: Assignment) => 
        assignment.notes ? (
          <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
            {assignment.notes}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
  ];

  const activeCount = assignments.filter(a => a.status === 'active').length;
  const returnedCount = assignments.filter(a => a.status === 'returned').length;

  if (isLoading) {
    return (
      <MainLayout title="Assignments" subtitle="Track asset assignments to employees">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Assignments" 
      subtitle="Track asset assignments to employees"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by employee or asset..."
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
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
                New Assignment
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Total Assignments</p>
            <p className="text-2xl font-bold">{assignments.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-status-active">{activeCount}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Returned</p>
            <p className="text-2xl font-bold text-status-neutral">{returnedCount}</p>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredAssignments}
          columns={columns}
        />
      </div>

      <AssignmentFormDialog 
        open={formOpen} 
        onOpenChange={setFormOpen}
      />
    </MainLayout>
  );
}

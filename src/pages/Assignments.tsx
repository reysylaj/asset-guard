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
  ArrowRightLeft,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { assignments, employees, assets } from '@/data/mockData';
import type { Assignment } from '@/types';

export default function Assignments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAssignments = assignments.filter(assignment => {
    const employee = employees.find(e => e.id === assignment.employeeId);
    const asset = assets.find(a => a.id === assignment.assetId);
    
    const matchesSearch = 
      employee?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee?.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset?.assetId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isActive = !assignment.endDate;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'ended' && !isActive);

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      render: (assignment: Assignment) => {
        const employee = employees.find(e => e.id === assignment.employeeId);
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
        const asset = assets.find(a => a.id === assignment.assetId);
        if (!asset) return '—';
        return (
          <div>
            <p className="font-mono text-sm">{asset.assetId}</p>
            <p className="text-xs text-muted-foreground">{asset.manufacturer} {asset.model}</p>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (assignment: Assignment) => (
        <StatusBadge status={assignment.endDate ? 'left' : 'active'} />
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (assignment: Assignment) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {format(new Date(assignment.startDate), 'MMM d, yyyy')}
        </div>
      ),
    },
    {
      key: 'endDate',
      header: 'End Date',
      render: (assignment: Assignment) => 
        assignment.endDate ? (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {format(new Date(assignment.endDate), 'MMM d, yyyy')}
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

  const activeCount = assignments.filter(a => !a.endDate).length;
  const endedCount = assignments.filter(a => a.endDate).length;

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
                <SelectItem value="ended">Ended</SelectItem>
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
              New Assignment
            </Button>
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
            <p className="text-sm text-muted-foreground">Ended</p>
            <p className="text-2xl font-bold text-status-neutral">{endedCount}</p>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredAssignments}
          columns={columns}
        />
      </div>
    </MainLayout>
  );
}

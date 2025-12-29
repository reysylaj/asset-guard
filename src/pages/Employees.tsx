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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  Eye,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { employees, assets, assignments } from '@/data/mockData';
import type { Employee } from '@/types';
import { useNavigate } from 'react-router-dom';

export default function Employees() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const departments = [...new Set(employees.map(e => e.department))];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.badgeId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getEmployeeAssetCount = (employeeId: string) => {
    return assignments.filter(a => a.employeeId === employeeId && !a.endDate).length;
  };

  const columns = [
    {
      key: 'name',
      header: 'Employee',
      render: (employee: Employee) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
            {employee.name[0]}{employee.surname[0]}
          </div>
          <div>
            <p className="font-medium">{employee.name} {employee.surname}</p>
            <p className="text-xs text-muted-foreground">{employee.badgeId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (employee: Employee) => <StatusBadge status={employee.status} />,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (employee: Employee) => format(new Date(employee.startDate), 'MMM d, yyyy'),
    },
    {
      key: 'assets',
      header: 'Assigned Assets',
      render: (employee: Employee) => (
        <span className="font-mono text-sm">
          {getEmployeeAssetCount(employee.id)} device(s)
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (employee: Employee) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/reports/employee/${employee.id}`);
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
      title="Employees" 
      subtitle="Manage employee records and assignments"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or badge ID..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="left">Left</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
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
              Add Employee
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Total Employees</p>
            <p className="text-2xl font-bold">{employees.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-status-active">
              {employees.filter(e => e.status === 'active').length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Left</p>
            <p className="text-2xl font-bold text-status-neutral">
              {employees.filter(e => e.status === 'left').length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground">Departments</p>
            <p className="text-2xl font-bold">{departments.length}</p>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredEmployees}
          columns={columns}
          onRowClick={(employee) => navigate(`/employees/${employee.id}`)}
        />
      </div>
    </MainLayout>
  );
}

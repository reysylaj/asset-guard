import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Pencil } from 'lucide-react';

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
  Eye,
  FileText,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '@/hooks/useEmployees';
import { useAssignments } from '@/hooks/useAssignments';
import { useAuth } from '@/contexts/AuthContext';
import { EmployeeFormDialog } from '@/components/forms/EmployeeFormDialog';
import { EmployeeDetailsDialog } from '@/components/employees/EmployeeDetailsDialog';
import type { Database } from '@/integrations/supabase/types';

type Employee = Database['public']['Tables']['employees']['Row'];

export default function Employees() {
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { data: employees = [], isLoading } = useEmployees();
  const { data: assignments = [] } = useAssignments();

  const canEdit = hasAnyRole(['hr', 'admin']);

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.badge_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getEmployeeAssetCount = (employeeId: string) => {
    return assignments.filter(a => a.employee_id === employeeId && a.status === 'active').length;
  };

  const handleExportPdf = () => {
  const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Employees Report', 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [[
        'Name',
        'Badge ID',
        'Department',
        'Status',
        'Start Date',
        'Assigned Assets'
      ]],
      body: filteredEmployees.map(e => [
        `${e.name} ${e.surname}`,
        e.badge_id,
        e.department,
        e.status,
        format(new Date(e.start_date), 'yyyy-MM-dd'),
        `${getEmployeeAssetCount(e.id)}`
      ]),
    });

    doc.save(`employees-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);


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
            <p className="text-xs text-muted-foreground">{employee.badge_id}</p>
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
      key: 'start_date',
      header: 'Start Date',
      render: (employee: Employee) => format(new Date(employee.start_date), 'MMM d, yyyy'),
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
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setViewEmployee(employee);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditingEmployee(employee);
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
      <MainLayout title="Employees" subtitle="Manage employee records and assignments">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

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
                  <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPdf}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {canEdit && (
              <Button size="sm" onClick={() => { setEditingEmployee(null); setFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            )}
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
          onRowClick={(employee) => setViewEmployee(employee)}
        />
      </div>

      <EmployeeFormDialog 
        open={formOpen} 
        onOpenChange={setFormOpen}
        employee={editingEmployee}
      />
      <EmployeeDetailsDialog
        open={!!viewEmployee}
        onOpenChange={(open) => !open && setViewEmployee(null)}
        employee={viewEmployee}
      />

    </MainLayout>
  );
}

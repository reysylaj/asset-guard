import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/ui/status-badge';
import { AssignmentHistoryList } from '@/components/assignments/AssignmentHistoryList';
import { ReturnAssetDialog } from '@/components/assignments/ReturnAssetDialog';
import { 
  User, 
  Briefcase, 
  Calendar, 
  CreditCard, 
  History,
  Laptop,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';
import type { AssignmentWithRelations } from '@/types/database';

type Employee = Database['public']['Tables']['employees']['Row'];

interface EmployeeDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function EmployeeDetailsDialog({ open, onOpenChange, employee }: EmployeeDetailsDialogProps) {
  const { hasAnyRole } = useAuth();
  const canManageAssets = hasAnyRole(['hr', 'it', 'admin']);
  
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithRelations | null>(null);

  // Fetch all assignments for this employee
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['assignments', 'employee', employee?.id],
    queryFn: async () => {
      if (!employee?.id) return [];
      
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          employee:employees(*),
          asset:assets(*)
        `)
        .eq('employee_id', employee.id)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as AssignmentWithRelations[];
    },
    enabled: !!employee?.id && open,
  });

  if (!employee) return null;

  const activeAssignments = assignments.filter(
    a => a.status === 'active' || a.status === 'pending_acceptance'
  );
  const pastAssignments = assignments.filter(
    a => a.status === 'returned' || a.status === 'pending_return'
  );

  const handleReturnAsset = (assignment: AssignmentWithRelations) => {
    setSelectedAssignment(assignment);
    setReturnDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-lg">
                {employee.name[0]}{employee.surname[0]}
              </div>
              <div>
                <h2 className="text-xl">{employee.name} {employee.surname}</h2>
                <p className="text-sm text-muted-foreground font-normal">{employee.department}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Info
              </TabsTrigger>
              <TabsTrigger value="current" className="flex items-center gap-2">
                <Laptop className="w-4 h-4" />
                Current ({activeAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                History ({pastAssignments.length})
              </TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <CreditCard className="w-4 h-4" />
                    Badge ID
                  </div>
                  <p className="font-mono">{employee.badge_id}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Briefcase className="w-4 h-4" />
                    Department
                  </div>
                  <p>{employee.department}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </div>
                  <p>{format(new Date(employee.start_date), 'MMMM d, yyyy')}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-sm">Status</span>
                  <div>
                    <StatusBadge status={employee.status} />
                  </div>
                </div>
                {employee.end_date && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-sm">End Date</span>
                    <p>{format(new Date(employee.end_date), 'MMMM d, yyyy')}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <span className="text-muted-foreground text-sm">Health Card ID</span>
                  <p className="font-mono">{employee.health_card_id}</p>
                </div>
              </div>
            </TabsContent>

            {/* Current Assets Tab */}
            <TabsContent value="current" className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : activeAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Laptop className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No assets currently assigned</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-4 rounded-lg border border-primary/50 bg-primary/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Laptop className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {assignment.asset?.manufacturer} {assignment.asset?.model}
                            </p>
                            <p className="text-sm font-mono text-muted-foreground">
                              {assignment.asset?.asset_id}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Since {format(new Date(assignment.start_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={assignment.status} />
                          {canManageAssets && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReturnAsset(assignment)}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Return
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <AssignmentHistoryList
                  assignments={pastAssignments}
                  viewMode="employee"
                  emptyMessage="No previous assignments"
                />
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ReturnAssetDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        assignment={selectedAssignment}
      />
    </>
  );
}

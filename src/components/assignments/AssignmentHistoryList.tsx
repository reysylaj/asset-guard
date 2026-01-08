import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Laptop, 
  User, 
  Calendar, 
  ArrowRight,
  CheckCircle,
  Clock,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import type { AssignmentWithRelations } from '@/types/database';

interface AssignmentHistoryListProps {
  assignments: AssignmentWithRelations[];
  viewMode: 'employee' | 'asset'; // Show asset info or employee info
  emptyMessage?: string;
}

const CHANGE_TYPE_LABELS: Record<string, string> = {
  upgrade: 'Upgrade',
  maintenance: 'Maintenance',
  damaged: 'Damaged',
  employee_left: 'Employee Left',
  reassignment: 'Reassignment',
  replacement: 'Replacement',
  end_of_life: 'End of Life',
  other: 'Other',
};

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  active: CheckCircle,
  pending_acceptance: Clock,
  pending_return: RotateCcw,
  returned: AlertCircle,
};

export function AssignmentHistoryList({ 
  assignments, 
  viewMode,
  emptyMessage = 'No assignment history found' 
}: AssignmentHistoryListProps) {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // Sort by start_date descending (most recent first)
  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedAssignments.map((assignment, index) => {
        const isActive = assignment.status === 'active' || assignment.status === 'pending_acceptance';
        const StatusIcon = STATUS_ICONS[assignment.status] || AlertCircle;
        
        return (
          <div
            key={assignment.id}
            className={`p-4 rounded-lg border ${
              isActive 
                ? 'border-primary/50 bg-primary/5' 
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                  {viewMode === 'employee' ? (
                    <Laptop className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  ) : (
                    <User className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                </div>
                
                <div className="space-y-1">
                  {/* Primary info based on view mode */}
                  {viewMode === 'employee' ? (
                    <>
                      <p className="font-medium">
                        {assignment.asset?.manufacturer} {assignment.asset?.model}
                      </p>
                      <p className="text-sm font-mono text-muted-foreground">
                        {assignment.asset?.asset_id}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">
                        {assignment.employee?.name} {assignment.employee?.surname}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.employee?.department} • {assignment.employee?.badge_id}
                      </p>
                    </>
                  )}
                  
                  {/* Date range */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(new Date(assignment.start_date), 'MMM d, yyyy')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>
                      {assignment.end_date 
                        ? format(new Date(assignment.end_date), 'MMM d, yyyy')
                        : 'Present'
                      }
                    </span>
                  </div>

                  {/* Change reason if returned */}
                  {assignment.status === 'returned' && (assignment as any).change_type && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {CHANGE_TYPE_LABELS[(assignment as any).change_type] || (assignment as any).change_type}
                      </Badge>
                      {(assignment as any).change_reason && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {(assignment as any).change_reason}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {assignment.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{assignment.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2">
                <StatusBadge status={assignment.status} />
                {isActive && index === 0 && (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    Current
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

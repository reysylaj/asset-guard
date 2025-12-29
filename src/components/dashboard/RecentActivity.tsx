import { formatDistanceToNow } from 'date-fns';
import { 
  Plus, 
  RefreshCw, 
  UserMinus, 
  UserPlus, 
  Wrench,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AuditLog } from '@/types';

interface RecentActivityProps {
  logs: AuditLog[];
}

const actionIcons: Record<string, typeof Plus> = {
  create: Plus,
  update: RefreshCw,
  delete: UserMinus,
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

export function RecentActivity({ logs }: RecentActivityProps) {
  return (
    <div className="space-y-4">
      {logs.slice(0, 5).map((log) => {
        const Icon = actionIcons[log.action] || RefreshCw;
        return (
          <div key={log.id} className="flex items-start gap-4">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              actionColors[log.action]
            )}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium capitalize">{log.action}</span>
                {' '}
                <span className="text-muted-foreground">{log.entityType}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
              </p>
            </div>
            <button className="p-1 rounded hover:bg-muted/50 transition-colors">
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

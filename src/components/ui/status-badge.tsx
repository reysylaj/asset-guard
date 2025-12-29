import { cn } from '@/lib/utils';
import type { 
  AssetStatus, 
  EmploymentStatus, 
  StorageHealth, 
  MaintenanceType,
  Ownership 
} from '@/types';

interface StatusBadgeProps {
  status: AssetStatus | EmploymentStatus | StorageHealth | MaintenanceType | Ownership | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Asset Status
  in_use: { label: 'In Use', className: 'bg-status-active/20 text-status-active border-status-active/30' },
  in_stock: { label: 'In Stock', className: 'bg-status-info/20 text-status-info border-status-info/30' },
  under_repair: { label: 'Under Repair', className: 'bg-status-warning/20 text-status-warning border-status-warning/30' },
  retired: { label: 'Retired', className: 'bg-status-neutral/20 text-status-neutral border-status-neutral/30' },
  
  // Employment Status
  active: { label: 'Active', className: 'bg-status-active/20 text-status-active border-status-active/30' },
  left: { label: 'Left', className: 'bg-status-neutral/20 text-status-neutral border-status-neutral/30' },
  
  // Storage Health
  healthy: { label: 'Healthy', className: 'bg-status-active/20 text-status-active border-status-active/30' },
  warning: { label: 'Warning', className: 'bg-status-warning/20 text-status-warning border-status-warning/30' },
  critical: { label: 'Critical', className: 'bg-status-danger/20 text-status-danger border-status-danger/30' },
  
  // Maintenance Type
  formatting: { label: 'Formatting', className: 'bg-status-info/20 text-status-info border-status-info/30' },
  repair: { label: 'Repair', className: 'bg-status-warning/20 text-status-warning border-status-warning/30' },
  upgrade: { label: 'Upgrade', className: 'bg-status-active/20 text-status-active border-status-active/30' },
  inspection: { label: 'Inspection', className: 'bg-status-info/20 text-status-info border-status-info/30' },
  replacement: { label: 'Replacement', className: 'bg-status-neutral/20 text-status-neutral border-status-neutral/30' },
  
  // Ownership
  TinextaCyber: { label: 'TinextaCyber', className: 'bg-ownership-tinexta/20 text-ownership-tinexta border-ownership-tinexta/30' },
  FDM: { label: 'FDM', className: 'bg-ownership-fdm/20 text-ownership-fdm border-ownership-fdm/30' },
  ServiceFactory: { label: 'ServiceFactory', className: 'bg-ownership-servicefactory/20 text-ownership-servicefactory border-ownership-servicefactory/30' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { 
    label: status, 
    className: 'bg-muted text-muted-foreground border-border' 
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

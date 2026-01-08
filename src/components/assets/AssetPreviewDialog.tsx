import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/ui/status-badge';

interface AssetPreviewDialogProps {
  asset: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetPreviewDialog({
  asset,
  open,
  onOpenChange,
}: AssetPreviewDialogProps) {
  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{asset.asset_id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <p><b>Type:</b> {asset.type}</p>
          <p><b>Manufacturer:</b> {asset.manufacturer}</p>
          <p><b>Model:</b> {asset.model}</p>
          <p><b>Serial:</b> {asset.serial_number}</p>
          <p><b>Status:</b> <StatusBadge status={asset.status} /></p>
          <p><b>Ownership:</b> {asset.ownership}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

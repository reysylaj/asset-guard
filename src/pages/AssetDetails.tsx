import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumbs } from '@/components/breadcrumbs/breadcrumbs'
import { ArrowLeft, Download } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect } from 'react';

import {
  useAssetWithHistory,
  useUpdateAssetStatus
} from '@/hooks/useAssets';

export default function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const { data: asset, isLoading } = useAssetWithHistory(id);
  const updateStatus = useUpdateAssetStatus();

  const exportPdf = () => {
  if (!asset) return;

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Asset Report', 14, 20);

  let y = 30;

  // ASSET DETAILS
  autoTable(doc, {
    startY: y,
    head: [['Field', 'Value']],
    body: [
      ['Asset ID', asset.asset_id],
      ['Type', asset.type],
      ['Status', asset.status],
      ['Ownership', asset.ownership],
      ['Manufacturer', asset.manufacturer],
      ['Model', asset.model],
      ['Serial', asset.serial_number],
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ASSIGNMENT HISTORY
  if (asset.assignments.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Employee', 'From', 'To', 'Status']],
      body: asset.assignments.map(a => [
        `${a.employee?.name ?? ''} ${a.employee?.surname ?? ''}`,
        a.start_date,
        a.end_date ?? 'Present',
        a.status,
      ]),
    });
  }

  doc.save(`asset-${asset.asset_id}.pdf`);
};


  useEffect(() => {
    if (asset && params.get('export') === 'pdf') {
      exportPdf();
    }
  }, [asset]);

  if (isLoading) {
    return (
        <MainLayout title="Loading...">
        <div className="p-6 text-muted-foreground">Loading asset…</div>
        </MainLayout>
    );
    }

    if (!asset) {
    return (
        <MainLayout title="Asset not found">
        <Button onClick={() => navigate('/assets')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assets
        </Button>
        </MainLayout>
    );
   }


  return (
  <MainLayout title="Asset Details" subtitle={asset.asset_id}>
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Assets', href: '/assets' },
          { label: asset.asset_id },
        ]}
      />

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate('/assets')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button onClick={exportPdf}>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-card border rounded-lg p-4">
        <div><b>Type:</b> {asset.type}</div>
        <div><b>Status:</b> <StatusBadge status={asset.status} /></div>
        <div><b>Manufacturer:</b> {asset.manufacturer}</div>
        <div><b>Model:</b> {asset.model}</div>
        <div><b>Serial:</b> {asset.serial_number}</div>
        <div><b>Ownership:</b> {asset.ownership}</div>
      </div>
    </div>
  </MainLayout>
);

}


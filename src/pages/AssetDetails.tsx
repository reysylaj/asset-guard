import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumbs } from '@/components/breadcrumbs/breadcrumbs';
import { AssignmentHistoryList } from '@/components/assignments/AssignmentHistoryList';
import { ArrowLeft, Download, Info, Users, Wrench, MapPin } from 'lucide-react';
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
    if (asset.assignments && asset.assignments.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Employee', 'From', 'To', 'Status', 'Reason']],
        body: asset.assignments.map((a: any) => [
          `${a.employee?.name ?? ''} ${a.employee?.surname ?? ''}`,
          a.start_date,
          a.end_date ?? 'Present',
          a.status,
          a.change_type ?? '—',
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

  const assignmentHistory = asset.assignments || [];
  const maintenanceHistory = asset.maintenance_events || [];

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

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User History ({assignmentHistory.length})
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Maintenance ({maintenanceHistory.length})
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-card border rounded-lg p-6">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Type</span>
                <p className="font-medium capitalize">{asset.type.replace('_', ' ')}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Status</span>
                <div><StatusBadge status={asset.status} /></div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Ownership</span>
                <p className="font-medium">{asset.ownership}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Manufacturer</span>
                <p className="font-medium">{asset.manufacturer}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Model</span>
                <p className="font-medium">{asset.model}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Serial Number</span>
                <p className="font-mono">{asset.serial_number}</p>
              </div>
              {asset.hostname && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Hostname</span>
                  <p className="font-mono">{asset.hostname}</p>
                </div>
              )}
              {asset.operating_system && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">OS</span>
                  <p>{asset.operating_system}</p>
                </div>
              )}
              {asset.purchase_date && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Purchase Date</span>
                  <p>{format(new Date(asset.purchase_date), 'MMM d, yyyy')}</p>
                </div>
              )}
              {asset.purchase_cost && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Purchase Cost</span>
                  <p className="font-medium">€{asset.purchase_cost.toLocaleString()}</p>
                </div>
              )}
              {asset.warranty_expiry && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Warranty Expiry</span>
                  <p>{format(new Date(asset.warranty_expiry), 'MMM d, yyyy')}</p>
                </div>
              )}
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Security Compliant</span>
                <p className={asset.security_compliant ? 'text-green-600' : 'text-red-600'}>
                  {asset.security_compliant ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* User History Tab */}
          <TabsContent value="users">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Assignment History</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete history of all employees who have been assigned this asset
              </p>
              <AssignmentHistoryList
                assignments={assignmentHistory as any}
                viewMode="asset"
                emptyMessage="This asset has never been assigned"
              />
            </div>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Maintenance History</h3>
              {maintenanceHistory.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No maintenance records found
                </p>
              ) : (
                <div className="space-y-3">
                  {maintenanceHistory.map((event: any) => (
                    <div key={event.id} className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">{event.type.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(event.date), 'MMM d, yyyy')} • By {event.performed_by}
                          </p>
                        </div>
                        {event.resulting_health && (
                          <StatusBadge status={event.resulting_health} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

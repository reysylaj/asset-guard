import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Printer, Download, ArrowLeft, HardDrive } from 'lucide-react';
import { format } from 'date-fns';
import { assets, employees, assignments, maintenanceEvents, locations, locationHistory } from '@/data/mockData';

export default function AssetReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const asset = assets.find(a => a.id === id);
  
  if (!asset) {
    return (
      <MainLayout title="Report Not Found" subtitle="Asset not found">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Asset not found</p>
          <Button onClick={() => navigate('/reports')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
        </div>
      </MainLayout>
    );
  }

  const assetAssignments = assignments.filter(a => a.assetId === asset.id);
  const currentAssignment = assetAssignments.find(a => !a.endDate);
  const pastAssignments = assetAssignments.filter(a => a.endDate);
  const assetMaintenance = maintenanceEvents.filter(m => m.assetId === asset.id);
  const assetLocations = locationHistory.filter(lh => lh.assetId === asset.id);
  const currentLocation = assetLocations.find(lh => !lh.endDate);

  const getEmployee = (employeeId: string) => employees.find(e => e.id === employeeId);
  const getLocation = (locationId: string) => locations.find(l => l.id === locationId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <MainLayout 
      title="Asset Report" 
      subtitle={asset.assetId}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Toolbar */}
        <div className="flex items-center justify-between no-print">
          <Button variant="outline" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-card border border-border rounded-xl p-8 print:p-0 print:border-0 print:bg-white">
          {/* Header */}
          <div className="border-b border-border pb-6 mb-6 print:border-black">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">Asset Report</h1>
                <p className="text-muted-foreground mt-1">
                  Generated on {format(new Date(), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Report ID</p>
                <p className="font-mono text-sm">AST-{asset.id.split('-')[1]}-{format(new Date(), 'yyyyMMdd')}</p>
              </div>
            </div>
          </div>

          {/* Asset Details */}
          <section className="print-section mb-8">
            <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Asset Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Asset ID</p>
                <p className="font-mono font-medium">{asset.assetId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{asset.type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={asset.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Manufacturer</p>
                <p className="font-medium">{asset.manufacturer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Model</p>
                <p className="font-medium">{asset.model}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Serial Number</p>
                <p className="font-mono">{asset.serialNumber}</p>
              </div>
              {asset.hostname && (
                <div>
                  <p className="text-sm text-muted-foreground">Hostname</p>
                  <p className="font-mono">{asset.hostname}</p>
                </div>
              )}
              {asset.operatingSystem && (
                <div>
                  <p className="text-sm text-muted-foreground">Operating System</p>
                  <p className="font-medium">{asset.operatingSystem}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Ownership</p>
                <StatusBadge status={asset.ownership} />
              </div>
              {asset.purchaseDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Date</p>
                  <p className="font-medium">{format(new Date(asset.purchaseDate), 'MMM d, yyyy')}</p>
                </div>
              )}
              {asset.warrantyExpiry && (
                <div>
                  <p className="text-sm text-muted-foreground">Warranty Expiry</p>
                  <p className="font-medium">{format(new Date(asset.warrantyExpiry), 'MMM d, yyyy')}</p>
                </div>
              )}
            </div>
          </section>

          {/* Hardware Specifications */}
          {asset.specs && (
            <section className="print-section mb-8">
              <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Hardware Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {asset.specs.cpu && (
                  <div>
                    <p className="text-sm text-muted-foreground">CPU</p>
                    <p className="font-medium">{asset.specs.cpu}</p>
                  </div>
                )}
                {asset.specs.ram && (
                  <div>
                    <p className="text-sm text-muted-foreground">RAM</p>
                    <p className="font-medium">{asset.specs.ram}</p>
                  </div>
                )}
                {asset.specs.motherboard && (
                  <div>
                    <p className="text-sm text-muted-foreground">Motherboard</p>
                    <p className="font-medium">{asset.specs.motherboard}</p>
                  </div>
                )}
                {asset.specs.graphics && (
                  <div>
                    <p className="text-sm text-muted-foreground">Graphics</p>
                    <p className="font-medium">{asset.specs.graphics}</p>
                  </div>
                )}
                {asset.specs.display && (
                  <div>
                    <p className="text-sm text-muted-foreground">Display</p>
                    <p className="font-medium">{asset.specs.display}</p>
                  </div>
                )}
              </div>

              {/* Storage Units */}
              {asset.specs.storage.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Storage Units</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {asset.specs.storage.map((storage) => (
                      <div 
                        key={storage.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                      >
                        <HardDrive className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{storage.type} - {storage.capacity}</p>
                        </div>
                        <StatusBadge status={storage.health} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Current Assignment */}
          <section className="print-section mb-8">
            <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Current Assignment</h2>
            {currentAssignment ? (
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  {(() => {
                    const employee = getEmployee(currentAssignment.employeeId);
                    return employee ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                          {employee.name[0]}{employee.surname[0]}
                        </div>
                        <div>
                          <p className="font-medium">{employee.name} {employee.surname}</p>
                          <p className="text-sm text-muted-foreground">{employee.department}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Since {format(new Date(currentAssignment.startDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4">This asset is not currently assigned to any employee</p>
            )}
          </section>

          {/* Assignment History */}
          <section className="print-section mb-8">
            <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">
              Assignment History ({pastAssignments.length})
            </h2>
            {pastAssignments.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Period</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {pastAssignments.map(assignment => {
                    const employee = getEmployee(assignment.employeeId);
                    if (!employee) return null;
                    return (
                      <tr key={assignment.id}>
                        <td>{employee.name} {employee.surname}</td>
                        <td>{employee.department}</td>
                        <td className="text-sm">
                          {format(new Date(assignment.startDate), 'MMM d, yyyy')} - {format(new Date(assignment.endDate!), 'MMM d, yyyy')}
                        </td>
                        <td className="text-sm text-muted-foreground">{assignment.notes || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-muted-foreground text-sm py-4">No previous assignments</p>
            )}
          </section>

          {/* Maintenance History */}
          <section className="print-section mb-8">
            <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">
              Maintenance History ({assetMaintenance.length})
            </h2>
            {assetMaintenance.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Performed By</th>
                    <th>Description</th>
                    <th>Health</th>
                  </tr>
                </thead>
                <tbody>
                  {assetMaintenance.map(event => (
                    <tr key={event.id}>
                      <td>{format(new Date(event.date), 'MMM d, yyyy')}</td>
                      <td><StatusBadge status={event.type} /></td>
                      <td>{event.performedBy}</td>
                      <td className="text-sm max-w-[200px] truncate">{event.description}</td>
                      <td><StatusBadge status={event.resultingHealth} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted-foreground text-sm py-4">No maintenance events recorded</p>
            )}
          </section>

          {/* Location History */}
          <section className="print-section mb-8">
            <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Location History</h2>
            {currentLocation && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Current Location</p>
                <div className="p-3 rounded-lg bg-muted/30">
                  {(() => {
                    const loc = getLocation(currentLocation.locationId);
                    return loc ? (
                      <div>
                        <p className="font-medium">{loc.name}</p>
                        {loc.building && <p className="text-sm text-muted-foreground">{loc.building}</p>}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            )}
            {assetLocations.filter(lh => lh.endDate).length > 0 && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Building</th>
                    <th>Period</th>
                  </tr>
                </thead>
                <tbody>
                  {assetLocations.filter(lh => lh.endDate).map(lh => {
                    const loc = getLocation(lh.locationId);
                    if (!loc) return null;
                    return (
                      <tr key={lh.id}>
                        <td>{loc.name}</td>
                        <td>{loc.building || '—'}</td>
                        <td className="text-sm">
                          {format(new Date(lh.startDate), 'MMM d, yyyy')} - {format(new Date(lh.endDate!), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>

          {/* Notes */}
          {asset.notes && (
            <section className="print-section mb-8">
              <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Notes</h2>
              <p className="text-sm">{asset.notes}</p>
            </section>
          )}

          {/* Footer */}
          <div className="border-t border-border pt-6 mt-8 text-center text-sm text-muted-foreground print:border-black">
            <p>This report is generated automatically and is valid without signature.</p>
            <p className="mt-1">AssetTrack IT Management System • Confidential</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

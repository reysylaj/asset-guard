import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useEmployees } from '@/hooks/useEmployees';
import { useAssignments } from '@/hooks/useAssignments';
import { useAssets } from '@/hooks/useAssets';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useNavigate } from 'react-router-dom';

export default function EmployeeReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: employees = [] } = useEmployees();
  const { data: assignments = [] } = useAssignments();
  const { data: assets = [] } = useAssets();

  const employee = employees.find(e => e.id === id);

  
  if (!employee) {
    return (
      <MainLayout title="Report Not Found" subtitle="Employee not found">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Employee not found</p>
          <Button onClick={() => navigate('/reports')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
        </div>
      </MainLayout>
    );
  }

  const employeeAssignments = assignments.filter(a => a.employee_id === employee.id);
  const currentAssignments = employeeAssignments.filter(a => !a.end_date);
  const pastAssignments = employeeAssignments.filter(a => a.end_date);

  const getAsset = (assetId: string) => assets.find(a => a.id === assetId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
  if (!employee) return;

  const doc = new jsPDF();
  let cursorY = 20;

  // ===== TITLE =====
  doc.setFontSize(16);
  doc.text('Employee Asset Report', 14, cursorY);
  cursorY += 8;

  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, 14, cursorY);
  cursorY += 6;
  doc.text(`Employee: ${employee.name} ${employee.surname}`, 14, cursorY);
  cursorY += 6;
  doc.text(`Department: ${employee.department}`, 14, cursorY);
  cursorY += 6;
  doc.text(`Status: ${employee.status}`, 14, cursorY);
  cursorY += 10;

  // ===== EMPLOYEE INFO TABLE =====
  autoTable(doc, {
    startY: cursorY,
    head: [['Field', 'Value']],
    body: [
      ['Full Name', `${employee.name} ${employee.surname}`],
      ['Badge ID', employee.badge_id],
      ['Health Card ID', employee.health_card_id || '—'],
      ['Start Date', format(new Date(employee.start_date), 'yyyy-MM-dd')],
      [
        'End Date',
        employee.end_date
          ? format(new Date(employee.end_date), 'yyyy-MM-dd')
          : '—',
      ],
    ],
  });

  cursorY = (doc as any).lastAutoTable.finalY + 12;

  // ===== CURRENT ASSETS =====
  doc.setFontSize(13);
  doc.text(
    `Currently Assigned Assets (${currentAssignments.length})`,
    14,
    cursorY
  );
  cursorY += 8;

  if (currentAssignments.length === 0) {
    doc.setFontSize(10);
    doc.text('No assets currently assigned', 14, cursorY);
    cursorY += 10;
  } else {
    autoTable(doc, {
      startY: cursorY,
      head: [['Asset ID', 'Type', 'Model', 'Serial', 'Assigned Since']],
      body: currentAssignments.map(a => {
        const asset = getAsset(a.asset_id)!;
        return [
          asset.asset_id,
          asset.type,
          `${asset.manufacturer} ${asset.model}`,
          asset.serial_number,
          format(new Date(a.start_date), 'yyyy-MM-dd'),
        ];
      }),
    });

    cursorY = (doc as any).lastAutoTable.finalY + 12;
  }

  // ===== HISTORICAL ASSETS =====
  doc.setFontSize(13);
  doc.text(
    `Historical Asset Assignments (${pastAssignments.length})`,
    14,
    cursorY
  );
  cursorY += 8;

  if (pastAssignments.length === 0) {
    doc.setFontSize(10);
    doc.text('No historical assignments', 14, cursorY);
    cursorY += 10;
  } else {
    autoTable(doc, {
      startY: cursorY,
      head: [['Asset ID', 'Type', 'Model', 'Period']],
      body: pastAssignments.map(a => {
        const asset = getAsset(a.asset_id)!;
        return [
          asset.asset_id,
          asset.type,
          `${asset.manufacturer} ${asset.model}`,
          `${format(new Date(a.start_date), 'yyyy-MM-dd')} → ${format(
            new Date(a.end_date!),
            'yyyy-MM-dd'
          )}`,
        ];
      }),
    });

    cursorY = (doc as any).lastAutoTable.finalY + 12;
  }

  // ===== SAVE =====
  doc.save(
    `employee-${employee.name}-${employee.surname}-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`
  );
};


  return (
    <MainLayout 
      title="Employee Report" 
      subtitle={`${employee.name} ${employee.surname}`}
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
            <Button onClick={handleDownloadPdf}>
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
                <h1 className="text-2xl font-bold">Employee Asset Report</h1>
                <p className="text-muted-foreground mt-1">
                  Generated on {format(new Date(), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Report ID</p>
                <p className="font-mono text-sm">EMP-{employee.id.split('-')[1]}-{format(new Date(), 'yyyyMMdd')}</p>
              </div>
            </div>
          </div>

          {/* Employee Details */}
          <section className="print-section mb-8">
            <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Employee Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{employee.name} {employee.surname}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{employee.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={employee.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Badge ID</p>
                <p className="font-mono">{employee.badge_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Health Card ID</p>
                <p className="font-mono">{employee.health_card_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employment Period</p>
                <p className="font-medium">
                  {format(new Date(employee.start_date), 'MMM d, yyyy')}
                  {employee.end_date && ` - ${format(new Date(employee.end_date), 'MMM d, yyyy')}`}
                </p>
              </div>
            </div>
          </section>

          {/* Current Assets */}
          <section className="print-section mb-8">
            <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">
              Currently Assigned Assets ({currentAssignments.length})
            </h2>
            {currentAssignments.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset ID</th>
                    <th>Type</th>
                    <th>Manufacturer / Model</th>
                    <th>Serial Number</th>
                    <th>Assigned Since</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAssignments.map(assignment => {
                    const asset = getAsset(assignment.asset_id);
                    if (!asset) return null;
                    return (
                      <tr key={assignment.id}>
                        <td className="font-mono text-sm">{asset.asset_id}</td>
                        <td className="capitalize">{asset.type.replace('_', ' ')}</td>
                        <td>{asset.manufacturer} {asset.model}</td>
                        <td className="font-mono text-sm">{asset.serial_number}</td>
                        <td>{format(new Date(assignment.start_date), 'MMM d, yyyy')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-muted-foreground text-sm py-4">No assets currently assigned</p>
            )}
          </section>

          {/* Historical Assets */}
          <section className="print-section mb-8">
            <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">
              Historical Asset Assignments ({pastAssignments.length})
            </h2>
            {pastAssignments.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset ID</th>
                    <th>Type</th>
                    <th>Manufacturer / Model</th>
                    <th>Period</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {pastAssignments.map(assignment => {
                    const asset = getAsset(assignment.asset_id);
                    if (!asset) return null;
                    return (
                      <tr key={assignment.id}>
                        <td className="font-mono text-sm">{asset.asset_id}</td>
                        <td className="capitalize">{asset.type.replace('_', ' ')}</td>
                        <td>{asset.manufacturer} {asset.model}</td>
                        <td className="text-sm">
                          {format(new Date(assignment.start_date), 'MMM d, yyyy')} - {format(new Date(assignment.end_date!), 'MMM d, yyyy')}
                        </td>
                        <td className="text-sm text-muted-foreground">{assignment.notes || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-muted-foreground text-sm py-4">No historical assignments</p>
            )}
          </section>

          {/* Footer */}
          <div className="border-t border-border pt-6 mt-8 text-center text-sm text-muted-foreground print:border-black">
            <p>This report is generated automatically and is valid without signature.</p>
            <p className="mt-1">AssetTrack IT Management System • Confidential • ServiceFactory</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

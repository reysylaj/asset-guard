import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  Monitor, 
  Building2,
  Calendar,
  Download,
  Printer,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { employees, assets } from '@/data/mockData';

const reportTypes = [
  {
    id: 'employee',
    title: 'Employee Reports',
    description: 'Generate detailed reports for individual employees including current and historical asset assignments.',
    icon: Users,
    color: 'bg-primary/10 text-primary',
    items: employees.slice(0, 5).map(e => ({
      id: e.id,
      label: `${e.name} ${e.surname}`,
      sublabel: e.department,
    })),
    path: '/reports/employee',
  },
  {
    id: 'asset',
    title: 'Asset Reports',
    description: 'Complete asset reports with technical specifications, maintenance history, and assignment timeline.',
    icon: Monitor,
    color: 'bg-status-info/10 text-status-info',
    items: assets.slice(0, 5).map(a => ({
      id: a.id,
      label: a.assetId,
      sublabel: `${a.manufacturer} ${a.model}`,
    })),
    path: '/reports/asset',
  },
  {
    id: 'inventory',
    title: 'Inventory Summary',
    description: 'Overview of all assets by type, status, and ownership. Ideal for management reviews.',
    icon: Building2,
    color: 'bg-status-active/10 text-status-active',
    action: 'Generate Report',
  },
  {
    id: 'audit',
    title: 'Audit Trail Report',
    description: 'Comprehensive log of all system changes for compliance and audit purposes.',
    icon: Calendar,
    color: 'bg-status-warning/10 text-status-warning',
    action: 'Generate Report',
  },
];

export default function Reports() {
  const navigate = useNavigate();

  return (
    <MainLayout 
      title="Reports" 
      subtitle="Generate printable reports for audits and management"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Report Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reportTypes.map((report) => (
            <div 
              key={report.id}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl ${report.color} flex items-center justify-center`}>
                  <report.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                </div>
              </div>

              {report.items ? (
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    Quick Access
                  </p>
                  {report.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigate(`${report.path}/${item.id}`)}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm">
                    <Printer className="w-4 h-4 mr-2" />
                    {report.action}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recent Reports */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-semibold mb-4">Recently Generated</h3>
          <div className="space-y-3">
            {[
              { type: 'Employee Report', name: 'Marco Rossi', date: '2024-03-15' },
              { type: 'Asset Report', name: 'TC-LAP-2024-001', date: '2024-03-14' },
              { type: 'Inventory Summary', name: 'Q1 2024', date: '2024-03-10' },
            ].map((report, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{report.type}</p>
                    <p className="text-xs text-muted-foreground">{report.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{report.date}</span>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

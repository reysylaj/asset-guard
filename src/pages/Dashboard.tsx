import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/stat-card';
import { AssetTypeChart } from '@/components/dashboard/AssetTypeChart';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { 
  Monitor, 
  Users, 
  AlertTriangle, 
  Package, 
  Server,
  TrendingUp
} from 'lucide-react';
import { employees, assets, assignments, auditLogs } from '@/data/mockData';

export default function Dashboard() {
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const totalAssets = assets.length;
  const assetsInUse = assets.filter(a => a.status === 'in_use').length;
  const assetsInStock = assets.filter(a => a.status === 'in_stock').length;
  const assetsUnderRepair = assets.filter(a => a.status === 'under_repair').length;
  const activeAssignments = assignments.filter(a => !a.endDate).length;

  return (
    <MainLayout 
      title="Dashboard" 
      subtitle="IT Asset Management Overview"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Assets"
            value={totalAssets}
            subtitle={`${assetsInUse} in use`}
            icon={Monitor}
            trend={{ value: 12, label: 'vs last month', positive: true }}
          />
          <StatCard
            title="Active Employees"
            value={activeEmployees}
            subtitle={`${employees.length} total in system`}
            icon={Users}
          />
          <StatCard
            title="Assets in Stock"
            value={assetsInStock}
            subtitle="Ready for assignment"
            icon={Package}
          />
          <StatCard
            title="Under Repair"
            value={assetsUnderRepair}
            subtitle="Needs attention"
            icon={AlertTriangle}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">Assets by Type</h3>
            <AssetTypeChart assets={assets} />
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">Assets by Status</h3>
            <StatusChart assets={assets} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <button className="text-sm text-primary hover:underline">View all</button>
            </div>
            <RecentActivity logs={auditLogs} />
          </div>

          {/* Quick Stats */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">Asset Ownership</h3>
            <div className="space-y-4">
              {['TinextaCyber', 'FDM', 'ServiceFactory'].map((owner) => {
                const count = assets.filter(a => a.ownership === owner).length;
                const percentage = Math.round((count / totalAssets) * 100);
                return (
                  <div key={owner} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{owner}</span>
                      <span className="font-medium">{count} assets</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          owner === 'TinextaCyber' ? 'bg-ownership-tinexta' :
                          owner === 'FDM' ? 'bg-ownership-fdm' : 'bg-ownership-servicefactory'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeAssignments}</p>
                  <p className="text-xs text-muted-foreground">Active Assignments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

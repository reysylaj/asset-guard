import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/stat-card';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { 
  Monitor, 
  Users, 
  AlertTriangle, 
  Package, 
  TrendingUp,
  Loader2
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: auditLogs = [], isLoading: logsLoading } = useAuditLogs();

  if (statsLoading) {
    return (
      <MainLayout title="Dashboard" subtitle="IT Asset Management Overview">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const recentLogs = auditLogs.slice(0, 10);
  
  // Transform stats for charts
  const assetTypeData = stats?.assets?.byType 
    ? Object.entries(stats.assets.byType).map(([name, value]) => ({ name, value }))
    : [];
  
  const assetStatusData = stats?.assets?.byStatus
    ? Object.entries(stats.assets.byStatus).map(([name, value]) => ({ name, value }))
    : [];

  const ownershipData = stats?.assets?.byOwnership
    ? Object.entries(stats.assets.byOwnership).map(([name, value]) => ({ name, value }))
    : [];

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
            value={stats?.assets?.total || 0}
            subtitle={`${stats?.assets?.byStatus?.in_use || 0} in use`}
            icon={Monitor}
          />
          <StatCard
            title="Active Employees"
            value={stats?.employees?.active || 0}
            subtitle={`${stats?.employees?.total || 0} total in system`}
            icon={Users}
          />
          <StatCard
            title="Assets in Stock"
            value={stats?.assets?.byStatus?.spare || 0}
            subtitle="Ready for assignment"
            icon={Package}
          />
          <StatCard
            title="Under Repair"
            value={stats?.assets?.byStatus?.under_repair || 0}
            subtitle="Needs attention"
            icon={AlertTriangle}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">Assets by Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={assetTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {assetTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">Assets by Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={assetStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {assetStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
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
            {logsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {recentLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                ) : (
                  recentLogs.map(log => (
                    <div key={log.id} className="flex items-center gap-3 text-sm">
                      <span className="capitalize font-medium">{log.action}</span>
                      <span className="text-muted-foreground">{log.entity_type}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">Asset Ownership</h3>
            <div className="space-y-4">
              {ownershipData.map((item) => {
                const total = stats?.assets?.total || 1;
                const percentage = Math.round((item.value / total) * 100);
                return (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{item.name}</span>
                      <span className="font-medium">{item.value} assets</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 bg-primary"
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
                  <p className="text-2xl font-bold">{stats?.assignments?.active || 0}</p>
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

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Asset } from '@/types';

interface StatusChartProps {
  assets: Asset[];
}

const statusLabels: Record<string, string> = {
  in_use: 'In Use',
  in_stock: 'In Stock',
  under_repair: 'Under Repair',
  retired: 'Retired',
};

const statusColors: Record<string, string> = {
  in_use: 'hsl(142, 71%, 45%)',
  in_stock: 'hsl(199, 89%, 48%)',
  under_repair: 'hsl(38, 92%, 50%)',
  retired: 'hsl(222, 30%, 40%)',
};

export function StatusChart({ assets }: StatusChartProps) {
  const statusCounts = assets.reduce((acc, asset) => {
    acc[asset.status] = (acc[asset.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: statusLabels[status] || status,
    count,
    fill: statusColors[status],
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
          <XAxis type="number" stroke="hsl(215, 20%, 55%)" fontSize={12} />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="hsl(215, 20%, 55%)" 
            fontSize={12}
            width={100}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(222, 47%, 11%)', 
              border: '1px solid hsl(222, 30%, 20%)',
              borderRadius: '8px',
              color: 'hsl(210, 20%, 95%)'
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Asset } from '@/types';

interface AssetTypeChartProps {
  assets: Asset[];
}

const COLORS = [
  'hsl(217, 91%, 60%)',   // Primary - Laptops
  'hsl(142, 71%, 45%)',   // Green - Desktops
  'hsl(38, 92%, 50%)',    // Amber - Monitors
  'hsl(262, 83%, 58%)',   // Purple - Servers
  'hsl(199, 89%, 48%)',   // Cyan - Network
  'hsl(0, 72%, 51%)',     // Red - Accessories
];

const typeLabels: Record<string, string> = {
  laptop: 'Laptops',
  desktop: 'Desktops',
  monitor: 'Monitors',
  server: 'Servers',
  network_device: 'Network Devices',
  accessory: 'Accessories',
};

export function AssetTypeChart({ assets }: AssetTypeChartProps) {
  const typeCounts = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(typeCounts).map(([type, count]) => ({
    name: typeLabels[type] || type,
    value: count,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(222, 47%, 11%)', 
              border: '1px solid hsl(222, 30%, 20%)',
              borderRadius: '8px',
              color: 'hsl(210, 20%, 95%)'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value) => <span style={{ color: 'hsl(210, 20%, 85%)' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

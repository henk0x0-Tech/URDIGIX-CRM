import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export interface DoughnutChartWidgetProps {
  data: { name: string; value: number; color: string }[];
}

export const DoughnutChartWidget: React.FC<DoughnutChartWidgetProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="w-full h-72 flex flex-col items-center justify-center relative">
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              fontWeight: 600
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
        <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{total}</span>
      </div>

      {/* Custom Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-4 text-xs font-semibold text-slate-500">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span>{entry.name} ({entry.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoughnutChartWidget;

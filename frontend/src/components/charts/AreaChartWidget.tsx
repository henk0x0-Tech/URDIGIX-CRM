import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export interface AreaChartWidgetProps {
  data: any[];
  dataKeyX: string;
  dataKeyY: string;
  fillColor?: string;
  strokeColor?: string;
}

export const AreaChartWidget: React.FC<AreaChartWidgetProps> = ({
  data,
  dataKeyX,
  dataKeyY,
  fillColor = '#3b82f6',
  strokeColor = '#2563eb',
}) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorProject" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey={dataKeyX} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              fontSize: '12px',
              fontFamily: 'Inter',
              fontWeight: 600
            }}
          />
          <Area 
            type="monotone" 
            dataKey={dataKeyY} 
            stroke={strokeColor} 
            strokeWidth={2.5} 
            fillOpacity={1} 
            fill="url(#colorProject)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChartWidget;

import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis } from 'recharts';
import { ForecastDay } from '../types';
import { GlassCard } from './GlassCard';

interface ForecastChartProps {
  data: ForecastDay[];
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ data }) => {
  const chartData = data.map(day => ({
    name: day.dayName.substring(0, 3),
    temp: day.temp_high_c,
    fullDate: day.date
  }));

  return (
    <GlassCard className="p-6 h-[300px] flex flex-col">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
        Temperature Trend
      </h3>
      <div className="flex-1 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.4)" 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.4)" 
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 12 }}
              unit="°"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(20, 20, 40, 0.8)', 
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#fb923c" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTemp)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

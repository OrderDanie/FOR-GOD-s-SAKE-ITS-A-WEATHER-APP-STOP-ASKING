import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis, CartesianGrid } from 'recharts';
import { ForecastDay } from '../types';
import { GlassCard } from './GlassCard';
import { useTheme } from '../context/ThemeContext';
import { convertTemperature } from '../constants';
import { Activity, Droplets } from 'lucide-react';

interface ForecastChartProps {
  data: ForecastDay[];
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ data }) => {
  const { tempUnit, isDarkMode } = useTheme();
  const [metric, setMetric] = useState<'temp' | 'rain'>('temp');

  const chartData = data.map(day => ({
    name: day.dayName.substring(0, 3),
    temp: convertTemperature(day.temp_high_c, tempUnit),
    tempLow: convertTemperature(day.temp_low_c, tempUnit),
    rain: day.chance_of_rain,
    condition: day.condition_text,
    fullDate: day.date
  }));

  return (
    <GlassCard className="p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <Activity className="w-4 h-4 text-zinc-400" />
          <span>Forecast Analytics</span>
        </div>

        {/* Tab switcher: Temp vs Rain with fluid layout animation */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 text-xs">
          <button
            onClick={() => setMetric('temp')}
            className={`relative px-3 py-1 rounded-lg transition-colors font-medium outline-none ${
              metric === 'temp'
                ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {metric === 'temp' && (
              <motion.div
                layoutId="activeMetricTab"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg shadow-sm"
                style={{ zIndex: 0 }}
              />
            )}
            <span className="relative z-10">Temperature</span>
          </button>
          <button
            onClick={() => setMetric('rain')}
            className={`relative px-3 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 outline-none ${
              metric === 'rain'
                ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {metric === 'rain' && (
              <motion.div
                layoutId="activeMetricTab"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg shadow-sm"
                style={{ zIndex: 0 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-blue-500 dark:text-blue-400" />
              Rain
            </span>
          </button>
        </div>
      </div>

      <div className="h-48 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="5%" 
                  stopColor={metric === 'temp' ? '#38bdf8' : '#60a5fa'} 
                  stopOpacity={0.2}
                />
                <stop 
                  offset="95%" 
                  stopColor={metric === 'temp' ? '#38bdf8' : '#60a5fa'} 
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#27272a' : '#e4e4e7'} vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#71717a" 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#71717a' }}
            />
            <YAxis 
              stroke="#71717a" 
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 11, fill: '#71717a' }}
              unit={metric === 'temp' ? '°' : '%'}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-lg bg-zinc-900 border border-zinc-700 p-2.5 shadow-xl text-xs space-y-1">
                      <div className="font-semibold text-zinc-200">{label} • {item.condition}</div>
                      {metric === 'temp' ? (
                        <div className="text-zinc-300 font-mono">
                          High: <strong className="text-zinc-100">{item.temp}°{tempUnit}</strong> (Low: {item.tempLow}°{tempUnit})
                        </div>
                      ) : (
                        <div className="text-blue-400 font-mono">
                          Rain probability: <strong>{item.rain}%</strong>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey={metric === 'temp' ? 'temp' : 'rain'} 
              stroke={metric === 'temp' ? '#38bdf8' : '#60a5fa'} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#metricGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

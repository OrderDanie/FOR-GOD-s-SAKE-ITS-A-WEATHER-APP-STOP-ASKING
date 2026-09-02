import React from 'react';
import { motion } from 'framer-motion';
import { WeatherData } from '../types';
import { GlassCard } from './GlassCard';
import { 
  Droplets, 
  Wind, 
  SunMedium, 
  Gauge, 
  Eye, 
  Sunrise, 
  Sunset,
  Navigation
} from 'lucide-react';

interface WeatherStatsProps {
  data: WeatherData;
}

export const WeatherStats: React.FC<WeatherStatsProps> = ({ data }) => {
  const current = data.current;

  // Staggered variants for cards
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
    >
      {/* Wind Card */}
      <motion.div variants={item}>
        <GlassCard className="p-4 h-full flex flex-col justify-between" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium">Wind</span>
            <Wind className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
              {current.wind_kph} <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">km/h</span>
            </div>
            {/* Animated Wind Velocity Mini Bar */}
            <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (current.wind_kph / 70) * 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-teal-500 rounded-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <motion.div
              animate={{ rotate: current.wind_direction }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="flex items-center justify-center"
            >
              <Navigation className="w-3 h-3 text-zinc-600 dark:text-zinc-300" />
            </motion.div>
            <span>{current.wind_direction_cardinal} ({current.wind_direction}°)</span>
          </div>
        </GlassCard>
      </motion.div>

      {/* Humidity Card */}
      <motion.div variants={item}>
        <GlassCard className="p-4 h-full flex flex-col justify-between" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium">Humidity</span>
            <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
              {current.humidity}<span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">%</span>
            </div>
            {/* Animated Humidity Mini Bar */}
            <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${current.humidity}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {current.humidity > 65 ? 'Humid' : current.humidity < 35 ? 'Dry' : 'Comfortable'}
          </div>
        </GlassCard>
      </motion.div>

      {/* UV Index Card */}
      <motion.div variants={item}>
        <GlassCard className="p-4 h-full flex flex-col justify-between" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium">UV Index</span>
            <SunMedium className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
              {current.uv}
            </div>
            {/* Animated UV Mini Bar */}
            <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (current.uv / 11) * 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
                className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full"
              />
            </div>
          </div>
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            {current.uv_level}
          </div>
        </GlassCard>
      </motion.div>

      {/* Pressure Card */}
      <motion.div variants={item}>
        <GlassCard className="p-4 h-full flex flex-col justify-between" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium">Pressure</span>
            <Gauge className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
              {current.pressure_hpa} <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">hPa</span>
            </div>
            {/* Animated Bar */}
            <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(10, ((current.pressure_hpa - 970) / 70) * 100))}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </div>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {current.pressure_hpa >= 1013 ? 'Standard' : 'Low pressure'}
          </div>
        </GlassCard>
      </motion.div>

      {/* Visibility Card */}
      <motion.div variants={item}>
        <GlassCard className="p-4 h-full flex flex-col justify-between" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium">Visibility</span>
            <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
              {current.visibility_km} <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">km</span>
            </div>
            {/* Animated Visibility Bar */}
            <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (current.visibility_km / 16) * 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.25 }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {current.visibility_km >= 10 ? 'Clear line of sight' : 'Reduced visibility'}
          </div>
        </GlassCard>
      </motion.div>

      {/* Sun Times Card */}
      <motion.div variants={item}>
        <GlassCard className="p-4 h-full flex flex-col justify-between" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium">Sun Cycle</span>
            <Sunrise className="w-4 h-4 text-amber-500 dark:text-amber-300" />
          </div>
          <div className="my-2 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500 dark:text-zinc-400">Rise</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{current.sunrise}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500 dark:text-zinc-400">Set</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{current.sunset}</span>
            </div>
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Sunset className="w-3 h-3 text-orange-500 dark:text-orange-400 inline" />
            <span>Daily cycle</span>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};

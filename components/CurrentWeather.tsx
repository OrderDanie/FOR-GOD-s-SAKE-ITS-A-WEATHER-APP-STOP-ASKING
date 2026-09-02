import React from 'react';
import { motion } from 'framer-motion';
import { WeatherData } from '../types';
import { GlassCard } from './GlassCard';
import { WeatherIcon } from './WeatherIcon';
import { MapPin, ArrowUp, ArrowDown, Info, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { formatTemperature } from '../constants';

interface CurrentWeatherProps {
  data: WeatherData;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({ data }) => {
  const { tempUnit } = useTheme();
  const current = data.current;

  return (
    <GlassCard className="p-6 md:p-8 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Location & Primary Temperature */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            <MapPin className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <span className="tracking-tight text-zinc-800 dark:text-zinc-200 font-semibold">{data.city}</span>
            <span className="text-zinc-400 dark:text-zinc-600">•</span>
            <span className="text-zinc-600 dark:text-zinc-400">{data.country}</span>
            <span className="text-zinc-400 dark:text-zinc-600">•</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {current.last_updated}
            </span>
          </div>

          <div className="flex items-baseline gap-4 mt-2">
            <motion.div 
              key={`${current.temp_c}-${tempUnit}`}
              initial={{ opacity: 0, scale: 0.95, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-7xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-100 font-mono"
            >
              {formatTemperature(current.temp_c, tempUnit)}
            </motion.div>

            <div className="space-y-1.5">
              <motion.div 
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-200 shadow-sm cursor-default"
              >
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <WeatherIcon condition={current.condition_text} className="w-4 h-4" />
                </motion.div>
                <span>{current.condition_text}</span>
              </motion.div>

              <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 pl-1">
                <span>Feels like {formatTemperature(current.feels_like_c, tempUnit)}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <ArrowUp className="w-3 h-3 text-rose-500 dark:text-rose-400" />
                  {formatTemperature(current.temp_max_today, tempUnit)}
                </span>
                <span className="flex items-center gap-0.5">
                  <ArrowDown className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                  {formatTemperature(current.temp_min_today, tempUnit)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Atmospheric Summary Badge */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/40 flex items-center justify-between gap-4 text-xs transition-colors"
          >
            <span className="text-zinc-500 dark:text-zinc-400">Atmosphere</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{current.condition_text}</span>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/40 flex items-center justify-between gap-4 text-xs transition-colors"
          >
            <span className="text-zinc-500 dark:text-zinc-400">Precipitation Index</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {data.hourly[0]?.chance_of_rain ?? 0}%
            </span>
          </motion.div>
        </div>
      </div>

      {/* Meteorological Advisory Note */}
      {data.weatherInsight && (
        <motion.div 
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/60 flex items-start gap-3 text-sm"
        >
          <Info className="w-4 h-4 text-zinc-400 dark:text-zinc-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-zinc-700 dark:text-zinc-300 font-normal">
            {data.weatherInsight}
          </p>
        </motion.div>
      )}
    </GlassCard>
  );
};

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { HourlyForecastData } from '../types';
import { GlassCard } from './GlassCard';
import { WeatherIcon } from './WeatherIcon';
import { Clock, Droplets, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { formatTemperature } from '../constants';

interface HourlyForecastProps {
  data: HourlyForecastData[];
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ data }) => {
  const { tempUnit } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) return null;

  const handleScroll = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <GlassCard className="p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          <Clock className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          <span>24-Hour Timeline</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mr-1 hidden sm:inline">Hourly interval</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleScroll(-220)}
            className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleScroll(220)}
            className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto pb-2 gap-2 scrollbar-thin scroll-smooth"
        style={{ scrollbarWidth: 'thin' }}
      >
        {data.map((hour, index) => (
          <motion.div
            key={`${hour.time}-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
            whileHover={{ y: -4, scale: 1.04 }}
            className="flex-shrink-0 flex flex-col items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/30 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors w-[78px] text-center cursor-default"
          >
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{hour.time}</span>
            
            <div className="my-2.5">
              <WeatherIcon condition={hour.condition_text} className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                {formatTemperature(hour.temp_c, tempUnit)}
              </div>
              
              {hour.chance_of_rain > 0 ? (
                <div className="flex items-center justify-center gap-0.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  <Droplets className="w-2.5 h-2.5" />
                  <span>{hour.chance_of_rain}%</span>
                </div>
              ) : (
                <div className="text-[11px] text-zinc-400 dark:text-zinc-600 font-mono">0%</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ForecastDay } from '../types';
import { GlassCard } from './GlassCard';
import { WeatherIcon } from './WeatherIcon';
import { Calendar, Droplets, Sunrise, Sunset, Sun, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { formatTemperature } from '../constants';

interface ForecastListProps {
  forecast: ForecastDay[];
}

export const ForecastList: React.FC<ForecastListProps> = ({ forecast }) => {
  const { tempUnit } = useTheme();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const minTempWeek = Math.min(...forecast.map((d) => d.temp_low_c));
  const maxTempWeek = Math.max(...forecast.map((d) => d.temp_high_c));
  const tempSpan = Math.max(1, maxTempWeek - minTempWeek);

  const toggleDay = (date: string) => {
    setExpandedDay((prev) => (prev === date ? null : date));
  };

  return (
    <GlassCard className="p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <span>7-Day Outlook</span>
          </div>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Daily min/max</span>
        </div>

        <div className="space-y-1">
          {forecast.map((day, idx) => {
            const leftPercent = ((day.temp_low_c - minTempWeek) / tempSpan) * 100;
            const rightPercent = ((maxTempWeek - day.temp_high_c) / tempSpan) * 100;
            const isExpanded = expandedDay === day.date;

            return (
              <div key={day.date} className="rounded-xl overflow-hidden">
                <motion.div
                  whileHover={{ x: 2, transition: { duration: 0.15 } }}
                  onClick={() => toggleDay(day.date)}
                  className={`flex items-center justify-between py-2.5 px-2 rounded-xl hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 cursor-pointer text-sm gap-2 transition-colors ${
                    isExpanded ? 'bg-zinc-100/80 dark:bg-zinc-800/60' : ''
                  }`}
                >
                  {/* Day name */}
                  <div className="w-16 shrink-0">
                    <span
                      className={`font-medium ${
                        idx === 0
                          ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                          : 'text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {day.dayName}
                    </span>
                  </div>

                  {/* Weather Condition Icon & Rain */}
                  <div className="flex items-center gap-2 w-28 shrink-0">
                    <WeatherIcon condition={day.condition_text} className="w-5 h-5 shrink-0" />
                    {day.chance_of_rain > 0 ? (
                      <span className="flex items-center gap-0.5 text-xs text-blue-600 dark:text-blue-400 font-mono">
                        <Droplets className="w-3 h-3" />
                        {day.chance_of_rain}%
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {day.condition_text}
                      </span>
                    )}
                  </div>

                  {/* Min Temp */}
                  <span className="w-8 text-right font-mono text-zinc-500 dark:text-zinc-400 text-xs shrink-0">
                    {formatTemperature(day.temp_low_c, tempUnit)}
                  </span>

                  {/* Temperature Range Bar */}
                  <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full relative overflow-hidden hidden sm:block">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.6, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-400 via-amber-400 to-rose-400 rounded-full opacity-80"
                      style={{
                        originX: 0,
                        left: `${Math.max(0, leftPercent)}%`,
                        right: `${Math.max(0, rightPercent)}%`,
                      }}
                    />
                  </div>

                  {/* Max Temp */}
                  <span className="w-8 text-right font-mono text-zinc-900 dark:text-zinc-100 font-semibold text-xs shrink-0">
                    {formatTemperature(day.temp_high_c, tempUnit)}
                  </span>

                  {/* Chevron Toggle Indicator */}
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-zinc-400 shrink-0"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </motion.div>
                </motion.div>

                {/* Animated Expanded Day Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="px-3 py-2.5 bg-zinc-100/50 dark:bg-zinc-800/30 rounded-b-xl mb-1 text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-200/50 dark:border-zinc-700/30"
                    >
                      <div className="grid grid-cols-3 gap-2 text-center py-1">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-zinc-400">UV Index</span>
                          <span className="font-semibold text-amber-500 font-mono mt-0.5 flex items-center gap-1">
                            <Sun className="w-3 h-3" /> {day.uv_index}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-zinc-400">Sunrise</span>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono mt-0.5 flex items-center gap-1">
                            <Sunrise className="w-3 h-3 text-amber-400" /> {day.sunrise}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-zinc-400">Sunset</span>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono mt-0.5 flex items-center gap-1">
                            <Sunset className="w-3 h-3 text-orange-400" /> {day.sunset}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 text-xs text-zinc-500 flex justify-between items-center">
        <span>
          Week Low:{' '}
          <strong className="text-zinc-700 dark:text-zinc-300 font-mono">
            {formatTemperature(minTempWeek, tempUnit)}
          </strong>
        </span>
        <span>
          Week High:{' '}
          <strong className="text-zinc-700 dark:text-zinc-300 font-mono">
            {formatTemperature(maxTempWeek, tempUnit)}
          </strong>
        </span>
      </div>
    </GlassCard>
  );
};

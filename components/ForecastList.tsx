import React from 'react';
import { ForecastDay } from '../types';
import { GlassCard } from './GlassCard';
import { WeatherIcon } from './WeatherIcon';
import { motion } from 'framer-motion';

interface ForecastListProps {
  forecast: ForecastDay[];
}

export const ForecastList: React.FC<ForecastListProps> = ({ forecast }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {forecast.map((day, index) => (
        <GlassCard 
          key={day.date}
          intensity="low"
          className="p-4 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-colors"
          custom={index}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { delay: index * 0.1 }
            }
          }}
        >
          <span className="text-white/60 text-sm font-medium uppercase tracking-wider">
            {day.dayName}
          </span>
          <WeatherIcon condition={day.condition_text} className="w-10 h-10 text-white/90" />
          <div className="flex items-end gap-2">
            <span className="text-xl font-bold text-white">{Math.round(day.temp_high_c)}°</span>
            <span className="text-base font-medium text-white/40">{Math.round(day.temp_low_c)}°</span>
          </div>
          <span className="text-xs text-white/50 text-center line-clamp-1">
            {day.condition_text}
          </span>
        </GlassCard>
      ))}
    </div>
  );
};

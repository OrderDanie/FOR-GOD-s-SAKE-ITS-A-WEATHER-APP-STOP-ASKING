import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { HourlyForecastData } from '../types';
import { GlassCard } from './GlassCard';
import { WeatherIcon } from './WeatherIcon';
import { Droplets, Clock } from 'lucide-react';

interface HourlyForecastProps {
  data: HourlyForecastData[];
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) return null;

  return (
    <GlassCard className="p-6 w-full">
      <div className="flex items-center gap-2 mb-4 text-white/90">
        <Clock className="w-5 h-5 text-cyan-300" />
        <h3 className="text-lg font-medium">Hourly Forecast</h3>
      </div>
      
      <div 
        ref={containerRef}
        className="flex overflow-x-auto pb-2 gap-3 -mx-2 px-2 scroll-smooth"
        style={{ scrollbarWidth: 'thin' }}
      >
        {data.map((hour, index) => (
          <motion.div
            key={`${hour.time}-${index}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex-shrink-0"
          >
            <div className="flex flex-col items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 min-w-[70px] h-32 hover:bg-white/10 transition-colors group">
              <span className="text-sm font-medium text-white/70">{hour.time}</span>
              
              <div className="group-hover:scale-110 transition-transform duration-300">
                 <WeatherIcon condition={hour.condition_text} className="w-8 h-8 my-2" />
              </div>
              
              <div className="text-center flex flex-col items-center gap-1">
                <span className="text-lg font-bold text-white leading-none">{Math.round(hour.temp_c)}°</span>
                
                {hour.chance_of_rain > 0 ? (
                  <div className="flex items-center gap-0.5 text-blue-300/80">
                    <Droplets size={10} />
                    <span className="text-[10px] font-medium">{hour.chance_of_rain}%</span>
                  </div>
                ) : (
                  <div className="h-3.5"></div> // Spacer to keep alignment
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
};
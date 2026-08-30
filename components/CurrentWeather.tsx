import React, { useEffect, useRef } from 'react';
import { WeatherData } from '../types';
import { GlassCard } from './GlassCard';
import { WeatherIcon } from './WeatherIcon';
import { Droplets, Wind, ThermometerSun, MapPin, SunMedium, Compass } from 'lucide-react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';

interface CurrentWeatherProps {
  data: WeatherData;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const animation = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({ data }) => {
  return (
    <GlassCard className="p-8 w-full relative group">
      {/* Background glow effect for visual depth */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        
        {/* Main Info */}
        <div className="flex flex-col">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-white/80 mb-1"
          >
            <MapPin size={18} />
            <span className="text-lg font-medium tracking-wide">{data.city}, {data.country}</span>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent tracking-tighter flex">
              <AnimatedNumber value={data.current.temp_c} />°
            </h1>
            <div className="flex flex-col gap-2">
              <WeatherIcon condition={data.current.condition_text} className="w-12 h-12 text-yellow-300" />
              <span className="text-xl md:text-2xl font-light text-white/90">
                {data.current.condition_text}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm flex flex-col items-center justify-center gap-1 min-w-[100px]"
          >
            <Droplets className="w-6 h-6 text-blue-300" />
            <span className="text-sm text-white/60">Humidity</span>
            <span className="text-lg font-semibold">{data.current.humidity}%</span>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm flex flex-col items-center justify-center gap-1 min-w-[100px]"
          >
            <Wind className="w-6 h-6 text-teal-300" />
            <span className="text-sm text-white/60">Wind</span>
            <span className="text-lg font-semibold">{data.current.wind_kph} <span className="text-xs">km/h</span></span>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm flex flex-col items-center justify-center gap-1 min-w-[100px]"
          >
            <ThermometerSun className="w-6 h-6 text-orange-300" />
            <span className="text-sm text-white/60">Feels Like</span>
            <span className="text-lg font-semibold"><AnimatedNumber value={data.current.feels_like_c} />°</span>
          </motion.div>

           <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm flex flex-col items-center justify-center gap-1 min-w-[100px]"
          >
            <SunMedium className="w-6 h-6 text-yellow-300" />
            <span className="text-sm text-white/60">UV Index</span>
            <span className="text-lg font-semibold">{data.current.uv}</span>
          </motion.div>
        </div>
      </div>

      {/* Daily Advisory */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-white/10 rounded-xl p-4 border border-white/10 flex gap-3 items-start"
      >
        <Compass className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />
        <p className="text-white/90 text-sm leading-relaxed font-light">
          {data.weatherInsight || data.aiInsight}
        </p>
      </motion.div>
    </GlassCard>
  );
};

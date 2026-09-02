import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface WeatherBackgroundProps {
  condition: string;
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ condition }) => {
  const { isDarkMode } = useTheme();
  const lower = (condition || '').toLowerCase();

  const isRain = lower.includes('rain') || lower.includes('shower') || lower.includes('drizzle');
  const isStorm = lower.includes('thunder') || lower.includes('storm');
  const isSnow = lower.includes('snow') || lower.includes('ice');
  const isClear = lower.includes('sunny') || lower.includes('clear');

  let ambientGradient = '';
  if (isRain) {
    ambientGradient = isDarkMode
      ? 'from-blue-950/25 via-zinc-950 to-zinc-950'
      : 'from-blue-100/50 via-zinc-50 to-zinc-100';
  } else if (isStorm) {
    ambientGradient = isDarkMode
      ? 'from-indigo-950/35 via-zinc-950 to-zinc-950'
      : 'from-slate-200/60 via-zinc-50 to-zinc-100';
  } else if (isSnow) {
    ambientGradient = isDarkMode
      ? 'from-cyan-950/25 via-zinc-950 to-zinc-950'
      : 'from-cyan-50/60 via-zinc-50 to-zinc-100';
  } else if (isClear) {
    ambientGradient = isDarkMode
      ? 'from-amber-950/20 via-zinc-950 to-zinc-950'
      : 'from-amber-50/50 via-zinc-50 to-zinc-100';
  } else {
    // Cloud / Overcast / Default
    ambientGradient = isDarkMode
      ? 'from-zinc-900/50 via-zinc-950 to-zinc-950'
      : 'from-zinc-200/50 via-zinc-50 to-zinc-100';
  }

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 transition-colors duration-1000 bg-gradient-to-b ${ambientGradient} overflow-hidden`}>
      {/* Primary Floating Atmospheric Glow Orb */}
      <motion.div
        animate={{
          x: ['-5%', '5%', '-5%'],
          y: ['0%', '8%', '0%'],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[450px] opacity-35 blur-[120px] rounded-full pointer-events-none ${
          isClear
            ? isDarkMode ? 'bg-amber-600/20' : 'bg-amber-300/40'
            : isRain
            ? isDarkMode ? 'bg-blue-600/20' : 'bg-blue-300/40'
            : isStorm
            ? isDarkMode ? 'bg-indigo-600/25' : 'bg-indigo-300/40'
            : isDarkMode ? 'bg-zinc-700/20' : 'bg-zinc-300/35'
        }`}
      />

      {/* Secondary Ambient Lateral Glow Orb */}
      <motion.div
        animate={{
          x: ['5%', '-8%', '5%'],
          y: ['10%', '-5%', '10%'],
          scale: [1.05, 0.95, 1.05],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute top-[25%] right-[-10%] w-[500px] h-[400px] opacity-25 blur-[100px] rounded-full pointer-events-none ${
          isClear
            ? isDarkMode ? 'bg-orange-500/15' : 'bg-amber-200/30'
            : isRain
            ? isDarkMode ? 'bg-teal-500/15' : 'bg-sky-200/30'
            : isDarkMode ? 'bg-zinc-800/20' : 'bg-zinc-400/20'
        }`}
      />

      {/* Weather particles: Gentle Falling Rain Drops (when raining) */}
      {isRain && (
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`rain-${i}`}
              initial={{ y: -50, x: `${(i * 8.5) % 100}vw` }}
              animate={{ y: '110vh' }}
              transition={{
                duration: 1.2 + (i % 5) * 0.2,
                repeat: Infinity,
                delay: (i * 0.15),
                ease: 'linear',
              }}
              className="absolute w-[1px] h-8 bg-gradient-to-b from-transparent via-sky-400 to-transparent"
            />
          ))}
        </div>
      )}

      {/* Weather particles: Warm Solar Radiance Shimmer (when clear/sunny) */}
      {isClear && (
        <motion.div
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 blur-[130px] rounded-full pointer-events-none"
        />
      )}
    </div>
  );
};

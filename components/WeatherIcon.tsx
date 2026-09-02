import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  Wind, 
  CloudFog, 
  Moon, 
  CloudSun
} from 'lucide-react';

interface WeatherIconProps {
  condition: string;
  className?: string;
  isNight?: boolean;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, className = 'w-6 h-6', isNight = false }) => {
  const lower = (condition || '').toLowerCase();

  if (lower.includes('thunder') || lower.includes('storm')) {
    return (
      <motion.div
        animate={{ 
          filter: ['drop-shadow(0 0 2px rgba(251, 191, 36, 0.4))', 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.9))', 'drop-shadow(0 0 2px rgba(251, 191, 36, 0.4))'],
          scale: [1, 1.05, 1] 
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex items-center justify-center"
      >
        <CloudLightning className={`${className} text-amber-400`} strokeWidth={1.75} />
      </motion.div>
    );
  }

  if (lower.includes('rain') || lower.includes('shower') || lower.includes('drizzle')) {
    return (
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex items-center justify-center"
      >
        <CloudRain className={`${className} text-blue-400`} strokeWidth={1.75} />
      </motion.div>
    );
  }

  if (lower.includes('snow') || lower.includes('ice') || lower.includes('hail') || lower.includes('freezing')) {
    return (
      <motion.div
        animate={{ rotate: [-6, 6, -6], scale: [1, 1.04, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex items-center justify-center"
      >
        <CloudSnow className={`${className} text-cyan-300`} strokeWidth={1.75} />
      </motion.div>
    );
  }

  if (lower.includes('fog') || lower.includes('mist') || lower.includes('rime')) {
    return (
      <motion.div
        animate={{ x: [-2, 2, -2], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex items-center justify-center"
      >
        <CloudFog className={`${className} text-zinc-400`} strokeWidth={1.75} />
      </motion.div>
    );
  }

  if (lower.includes('wind')) {
    return (
      <motion.div
        animate={{ x: [-2, 3, -2] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex items-center justify-center"
      >
        <Wind className={`${className} text-teal-400`} strokeWidth={1.75} />
      </motion.div>
    );
  }

  if (lower.includes('partly') || lower.includes('mainly clear')) {
    return (
      <motion.div
        animate={{ y: [0, -1.5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex items-center justify-center"
      >
        <CloudSun className={`${className} text-amber-300`} strokeWidth={1.75} />
      </motion.div>
    );
  }

  if (lower.includes('cloud') || lower.includes('overcast')) {
    return (
      <motion.div
        animate={{ x: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex items-center justify-center"
      >
        <Cloud className={`${className} text-zinc-400`} strokeWidth={1.75} />
      </motion.div>
    );
  }

  if (lower.includes('clear') || lower.includes('sunny')) {
    if (isNight) {
      return (
        <motion.div
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center justify-center"
        >
          <Moon className={`${className} text-indigo-300`} strokeWidth={1.75} />
        </motion.div>
      );
    }
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="inline-flex items-center justify-center"
      >
        <Sun className={`${className} text-amber-500`} strokeWidth={1.75} />
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      className="inline-flex items-center justify-center"
    >
      <Sun className={`${className} text-amber-500`} strokeWidth={1.75} />
    </motion.div>
  );
};

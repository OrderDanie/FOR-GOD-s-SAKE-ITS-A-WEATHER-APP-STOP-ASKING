import React from 'react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  Wind, 
  CloudFog, 
  Moon,
  CloudDrizzle,
  CloudSun
} from 'lucide-react';
import { motion } from 'framer-motion';

interface WeatherIconProps {
  condition: string;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, className }) => {
  const lowerCondition = condition.toLowerCase();

  const iconVariants = {
    hover: { scale: 1.1, rotate: 5 },
    tap: { scale: 0.95 },
  };

  const sunAnimation = {
    animate: { rotate: 360 },
    transition: { repeat: Infinity, duration: 12, ease: "linear" }
  };

  const cloudAnimation = {
    animate: { x: [-3, 3, -3] },
    transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
  };

  const rainAnimation = {
    animate: { y: [0, 3, 0] },
    transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
  };

  const windAnimation = {
    animate: { x: [-2, 5, -2] },
    transition: { repeat: Infinity, duration: 1, ease: "easeInOut" }
  };

  const pulseAnimation = {
    animate: { scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] },
    transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
  };

  let IconComponent: React.ReactNode;

  // Determine Icon and Animation based on condition
  if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) {
    IconComponent = (
      <motion.div {...pulseAnimation} className="relative">
         <CloudLightning className={className} />
      </motion.div>
    );
  } else if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
    IconComponent = (
      <motion.div {...rainAnimation}>
        <CloudRain className={className} />
      </motion.div>
    );
  } else if (lowerCondition.includes('drizzle')) {
    IconComponent = (
      <motion.div {...rainAnimation}>
        <CloudDrizzle className={className} />
      </motion.div>
    );
  } else if (lowerCondition.includes('snow') || lowerCondition.includes('ice')) {
    IconComponent = (
      <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
        <CloudSnow className={className} />
      </motion.div>
    );
  } else if (lowerCondition.includes('wind')) {
    IconComponent = (
      <motion.div {...windAnimation}>
        <Wind className={className} />
      </motion.div>
    );
  } else if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
    IconComponent = (
      <motion.div animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ repeat: Infinity, duration: 5 }}>
        <CloudFog className={className} />
      </motion.div>
    );
  } else if (lowerCondition.includes('partly cloudy')) {
    IconComponent = (
       <div className="relative">
         <motion.div className="absolute inset-0" {...sunAnimation} style={{ opacity: 0.5, scale: 0.8, x: 10, y: -5 }}>
           <Sun className={className} />
         </motion.div>
         <motion.div {...cloudAnimation} className="relative z-10">
           <Cloud className={className} />
         </motion.div>
       </div>
    );
  } else if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
    IconComponent = (
      <motion.div {...cloudAnimation}>
        <Cloud className={className} />
      </motion.div>
    );
  } else if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
    IconComponent = (
      <motion.div {...sunAnimation}>
        <Sun className={className} />
      </motion.div>
    );
  } else {
    IconComponent = <Sun className={className} />;
  }

  return (
    <div className="inline-block" title={condition}>
      {IconComponent}
    </div>
  );
};

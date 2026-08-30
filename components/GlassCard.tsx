import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../context/ThemeContext';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  intensity = 'medium',
  ...props 
}) => {
  const { isDarkMode } = useTheme();

  const intensityClasses = {
    low: 'bg-white/5 backdrop-blur-sm border-white/10',
    medium: 'bg-white/10 backdrop-blur-md border-white/20',
    high: 'bg-white/20 backdrop-blur-xl border-white/30',
  };

  // Dark mode uses darker backgrounds with higher opacity for better contrast
  const darkIntensityClasses = {
    low: 'bg-gray-900/60 backdrop-blur-md border-white/5',
    medium: 'bg-gray-900/80 backdrop-blur-xl border-white/10',
    high: 'bg-black/80 backdrop-blur-2xl border-white/15',
  };

  const selectedClasses = isDarkMode ? darkIntensityClasses[intensity] : intensityClasses[intensity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={twMerge(
        'relative rounded-3xl border shadow-xl overflow-hidden group',
        selectedClasses,
        className
      )}
      {...props}
    >
      {/* Shine effect on hover (subtler in dark mode) */}
      <div className={`absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent ${isDarkMode ? 'via-white/5' : 'via-white/10'} to-transparent pointer-events-none`} />
      
      {children}
    </motion.div>
  );
};

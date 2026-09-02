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

  const baseClasses = isDarkMode
    ? 'bg-zinc-900/80 border border-zinc-800/80 text-zinc-100 backdrop-blur-md shadow-sm'
    : 'bg-white border border-zinc-200/90 text-zinc-900 shadow-sm';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.25, ease: "easeOut" } }}
      className={twMerge(
        'relative rounded-2xl transition-colors duration-300 overflow-hidden',
        baseClasses,
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

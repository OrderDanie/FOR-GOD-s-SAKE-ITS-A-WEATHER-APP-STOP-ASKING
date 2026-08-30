import React from 'react';
import { Palette, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEMES } from '../constants';
import { AppTheme } from '../types';
import { GlassCard } from './GlassCard';
import { useTheme } from '../context/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { theme: currentTheme, setTheme, isDarkMode, toggleDarkMode } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative z-40 flex items-center gap-3">
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white"
        aria-label="Toggle Dark Mode"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isDarkMode ? 'moon' : 'sun'}
            initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {isDarkMode ? <Moon size={20} className="text-indigo-300" /> : <Sun size={20} className="text-yellow-300" />}
          </motion.div>
        </AnimatePresence>
      </button>

      {/* Theme Palette */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white"
          aria-label="Change Theme"
        >
          <Palette size={20} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
               initial={{ opacity: 0, scale: 0.9, x: 20 }}
               animate={{ opacity: 1, scale: 1, x: 0 }}
               exit={{ opacity: 0, scale: 0.9, x: 20 }}
               className="absolute right-0 mt-3 w-48 origin-top-right"
            >
               <GlassCard intensity="high" className="p-2 flex flex-col gap-1">
                 {Object.values(AppTheme).map((themeKey) => {
                   const themeConfig = THEMES[themeKey];
                   const isActive = currentTheme === themeKey;
                   return (
                     <button
                       key={themeKey}
                       onClick={() => {
                         setTheme(themeKey);
                         setIsOpen(false);
                       }}
                       className={`
                         flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left w-full
                         ${isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}
                       `}
                     >
                       <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${themeConfig.gradient}`}></div>
                       {themeConfig.name}
                     </button>
                   );
                 })}
               </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { isDarkMode, toggleDarkMode, tempUnit, toggleTempUnit } = useTheme();

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {/* °C / °F Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTempUnit}
        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 border border-zinc-200 dark:border-zinc-700/60 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors font-mono shadow-sm"
        aria-label="Toggle Temperature Unit"
        title="Switch between Celsius and Fahrenheit"
      >
        <motion.span
          key={tempUnit}
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 3 }}
          transition={{ duration: 0.2 }}
          className="inline-block"
        >
          °{tempUnit}
        </motion.span>
      </motion.button>

      {/* Dark / Light Mode Toggle */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: 15 }}
        whileTap={{ scale: 0.95, rotate: -20 }}
        onClick={toggleDarkMode}
        className="p-1.5 rounded-lg bg-white dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shadow-sm"
        aria-label="Toggle Dark / Light Mode"
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDarkMode ? (
            <motion.div
              key="sun"
              initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Sun className="w-4 h-4 text-amber-400" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0.5, rotate: 90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: -90, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Moon className="w-4 h-4 text-indigo-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

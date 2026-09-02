import React, { createContext, useContext, useState, useEffect } from 'react';
import { TemperatureUnit } from '../types';

interface AppSettingsContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  tempUnit: TemperatureUnit;
  toggleTempUnit: () => void;
  setTempUnit: (unit: TemperatureUnit) => void;
}

export const ThemeContext = createContext<AppSettingsContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('atlas_dark_mode');
      if (saved !== null) return saved === 'true';
      return true; // Default to sleek dark mode
    }
    return true;
  });

  const [tempUnit, setTempUnitState] = useState<TemperatureUnit>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('atlas_temp_unit');
      return (saved === 'F' ? 'F' : 'C') as TemperatureUnit;
    }
    return 'C';
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('atlas_dark_mode', String(next));
      return next;
    });
  };

  const toggleTempUnit = () => {
    setTempUnitState(prev => {
      const next = prev === 'C' ? 'F' : 'C';
      localStorage.setItem('atlas_temp_unit', next);
      return next;
    });
  };

  const setTempUnit = (unit: TemperatureUnit) => {
    setTempUnitState(unit);
    localStorage.setItem('atlas_temp_unit', unit);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, tempUnit, toggleTempUnit, setTempUnit }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

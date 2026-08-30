import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWeather } from './services/weatherService';
import { WeatherData, AppTheme } from './types';
import { THEMES } from './constants';
import { SearchBar } from './components/SearchBar';
import { CurrentWeather } from './components/CurrentWeather';
import { ForecastList } from './components/ForecastList';
import { ForecastChart } from './components/ForecastChart';
import { HourlyForecast } from './components/HourlyForecast';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { WeatherBackground } from './components/WeatherBackground';
import { ThemeContext } from './context/ThemeContext';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const [city, setCity] = useState<string>('Casablanca');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Access theme context
  const { theme, isDarkMode } = React.useContext(ThemeContext)!;

  const handleSearch = async (searchCity: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(searchCity);
      setWeather(data);
      setCity(searchCity);
    } catch (err) {
      setError("Unable to find weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch('Casablanca');
  }, []);

  const currentThemeConfig = THEMES[theme];

  // If Dark Mode is active, override the gradient with a dark gray/black background
  const backgroundClass = isDarkMode 
    ? 'bg-gray-950' 
    : `bg-gradient-to-br ${currentThemeConfig.gradient}`;

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${backgroundClass} relative overflow-hidden`}>
      
      {/* Interactive Background */}
      <WeatherBackground 
        condition={weather?.current.condition_text || 'clear'} 
        theme={theme} 
      />

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.7 }}
              className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center border border-white/30 shadow-lg cursor-pointer"
            >
               <span className="text-xl">🏔️</span>
            </motion.div>
            <span className="text-2xl font-bold text-white tracking-tight hidden sm:block">Atlas Sky</span>
          </div>
          
          <div className="flex-1 max-w-xl mx-4">
             <SearchBar onSearch={handleSearch} isLoading={loading} />
          </div>

          <ThemeSwitcher />
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
             {loading && !weather ? (
               <motion.div 
                 key="loader"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="flex flex-col items-center justify-center h-[50vh] text-white"
               >
                 <Loader2 className="w-12 h-12 animate-spin mb-4 text-cyan-300" />
                 <p className="text-lg font-light tracking-wider animate-pulse">Reading atmospheric conditions...</p>
               </motion.div>
             ) : error ? (
               <motion.div
                 key="error"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex flex-col items-center justify-center h-[50vh] text-white"
               >
                 <span className="text-6xl mb-4">🌪️</span>
                 <p className="text-xl font-semibold mb-2">Oops!</p>
                 <p className="text-white/60 mb-6">{error}</p>
                 <button 
                   onClick={() => handleSearch(city)}
                   className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all"
                 >
                   Try Again
                 </button>
               </motion.div>
             ) : weather ? (
               <motion.div
                 key="content"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ duration: 0.5 }}
                 className="grid grid-cols-1 lg:grid-cols-3 gap-6"
               >
                  {/* Left Column: Current Weather & Hourly & Chart */}
                  <div className="lg:col-span-2 space-y-6">
                    <CurrentWeather data={weather} />
                    <HourlyForecast data={weather.hourly} />
                    <ForecastChart data={weather.forecast} />
                  </div>

                  {/* Right Column: Forecast List */}
                  <div className="lg:col-span-1">
                     <div className={`
                        border rounded-3xl p-6 h-full backdrop-blur-md transition-colors duration-500
                        ${isDarkMode ? 'bg-gray-900/80 border-white/10' : 'bg-white/5 border-white/10'}
                     `}>
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                          <span className="text-cyan-300">📅</span> 4-Day Forecast
                        </h2>
                        <ForecastList forecast={weather.forecast} />
                     </div>
                  </div>
               </motion.div>
             ) : null}
          </AnimatePresence>
        </main>

        <footer className="mt-12 text-center text-white/30 text-sm py-4">
          <p>© {new Date().getFullYear()} Atlas Sky. Made by a human on earth.</p>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<AppTheme>(AppTheme.OCEAN);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, toggleDarkMode }}>
      <AppContent />
    </ThemeContext.Provider>
  );
};

export default App;

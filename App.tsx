import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWeather, fetchWeatherByCoordinates } from './services/weatherService';
import { fetchNewsArticles } from './services/newsService';
import { WeatherData, NewsArticle } from './types';
import { MOROCCO_CITIES } from './constants';
import { SearchBar } from './components/SearchBar';
import { CurrentWeather } from './components/CurrentWeather';
import { WeatherStats } from './components/WeatherStats';
import { ForecastList } from './components/ForecastList';
import { ForecastChart } from './components/ForecastChart';
import { HourlyForecast } from './components/HourlyForecast';
import { NewsTicker } from './components/NewsTicker';
import { WeatherNews } from './components/WeatherNews';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { WeatherBackground } from './components/WeatherBackground';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CloudSun, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('Casablanca');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [locating, setLocating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Live news state
  const [tickerArticles, setTickerArticles] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState<boolean>(true);
  const [activeNewsModal, setActiveNewsModal] = useState<NewsArticle | null>(null);

  const { isDarkMode } = useTheme();

  const loadWeather = async (cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(cityName);
      setWeather(data);
      setSelectedCity(cityName);
    } catch (err: any) {
      setError(err?.message || "Unable to fetch meteorological data. Please check location name.");
    } finally {
      setLoading(false);
    }
  };

  const loadInitialNews = async () => {
    try {
      setNewsLoading(true);
      const news = await fetchNewsArticles('all');
      setTickerArticles(news);
    } catch (err) {
      console.warn('Initial news wire fetch failed:', err);
    } finally {
      setNewsLoading(false);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const data = await fetchWeatherByCoordinates(latitude, longitude);
          setWeather(data);
          setSelectedCity(data.city);
        } catch (err: any) {
          setError("Failed to retrieve weather for current location.");
        } finally {
          setLocating(false);
        }
      },
      (geoErr) => {
        setLocating(false);
        setError("Location access was declined or unavailable.");
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    loadWeather('Casablanca');
    loadInitialNews();
  }, []);

  const quickCities = [
    'Casablanca',
    'Rabat',
    'Marrakech',
    'Tangier',
    'Fes',
    'Agadir',
    'Essaouira',
    'Ifrane'
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 relative ${
      isDarkMode ? 'bg-[#0d1117] text-zinc-100' : 'bg-[#f4f5f7] text-zinc-900'
    }`}>
      {/* Subtle Atmospheric Backdrop with motion particles */}
      <WeatherBackground condition={weather?.current.condition_text || 'Clear'} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col min-h-screen">
        
        {/* Clean Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center justify-between">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2.5 cursor-pointer select-none" 
              onClick={() => loadWeather('Casablanca')}
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-sky-400 shadow-sm">
                <CloudSun className="w-5 h-5 text-sky-400 animate-pulse" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 font-sans">
                  THE weather
                </h1>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-none">Meteorological Station</p>
              </div>
            </motion.div>

            {/* Mobile controls */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeSwitcher />
            </div>
          </div>

          {/* Search bar */}
          <div className="w-full md:max-w-md">
            <SearchBar 
              onSearch={loadWeather} 
              onLocateMe={handleLocateMe}
              isLoading={loading}
              isLocating={locating}
            />
          </div>

          {/* Desktop controls */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.08, rotate: 180 }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.35 }}
              onClick={() => loadWeather(selectedCity)}
              disabled={loading}
              title="Refresh meteorological observation"
              className="p-1.5 rounded-lg bg-white dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-500' : ''}`} />
            </motion.button>
            <ThemeSwitcher />
          </div>
        </header>

        {/* Quick Cities Pill Filter with Fluid Layout Animation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {quickCities.map((cityName) => {
            const isActive = selectedCity.toLowerCase() === cityName.toLowerCase();
            return (
              <button
                key={cityName}
                onClick={() => loadWeather(cityName)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap outline-none ${
                  isActive
                    ? 'text-zinc-900 dark:text-zinc-950 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCityPill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 bg-white dark:bg-zinc-100 rounded-full shadow-sm"
                    style={{ zIndex: 0 }}
                  />
                )}
                <span className="relative z-10">{cityName}</span>
              </button>
            );
          })}
        </div>

        {/* Live News Wire Ticker */}
        <NewsTicker 
          articles={tickerArticles} 
          isLoading={newsLoading} 
          onArticleClick={(art) => setActiveNewsModal(art)} 
        />

        {/* Main Meteorological & News Content Area */}
        <main className="flex-1 space-y-6">
          <AnimatePresence mode="wait">
            {loading && !weather ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[50vh] text-zinc-400"
              >
                <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-3" />
                <span className="text-sm font-medium">Fetching meteorological observation...</span>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center max-w-md mx-auto my-12"
              >
                <AlertCircle className="w-8 h-8 text-rose-400 mb-3" />
                <h2 className="text-base font-semibold text-zinc-100 mb-1">Weather Data Unavailable</h2>
                <p className="text-xs text-zinc-400 mb-4">{error}</p>
                <button
                  onClick={() => loadWeather('Casablanca')}
                  className="px-4 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg transition-colors"
                >
                  Reset to Casablanca
                </button>
              </motion.div>
            ) : weather ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* 1. Hero Weather Card */}
                <CurrentWeather data={weather} />

                {/* 2. Detailed Meteorological Metrics Bento */}
                <WeatherStats data={weather} />

                {/* 3. Secondary Layout: Left 24h & Chart, Right 7-Day Outlook */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-5">
                    <HourlyForecast data={weather.hourly} />
                    <ForecastChart data={weather.forecast} />
                  </div>

                  <div className="lg:col-span-1">
                    <ForecastList forecast={weather.forecast} />
                  </div>
                </div>

                {/* 4. Meteorological & Global Dispatches News Section */}
                <WeatherNews 
                  activeModalArticle={activeNewsModal} 
                  onSelectArticle={setActiveNewsModal} 
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>

        {/* Clean, Understated Footer */}
        <footer className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800/60 text-center text-xs text-zinc-500 dark:text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">THE weather</span>
            <span>•</span>
            <span>Real-time Meteorological Station & News Feed</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span>Currents Wire Syndicated</span>
            <span>•</span>
            <span>Made by a human on earth</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;

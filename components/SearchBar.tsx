import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, X, LocateFixed, Loader2 } from 'lucide-react';
import { MOROCCO_CITIES } from '../constants';
import { CityOption } from '../types';

interface SearchBarProps {
  onSearch: (city: string) => void;
  onLocateMe?: () => void;
  isLoading: boolean;
  isLocating?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onLocateMe,
  isLoading,
  isLocating = false
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setIsFocused(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredCities = query 
    ? MOROCCO_CITIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : MOROCCO_CITIES.slice(0, 5);

  return (
    <div className="relative w-full z-30" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative w-full flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search city (e.g., Casablanca, Rabat, Marrakech)..."
            className="w-full bg-white dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60 rounded-xl py-2.5 pl-10 pr-20 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-sky-500 dark:focus:border-zinc-500 focus:bg-white dark:focus:bg-zinc-800 transition-all font-normal shadow-sm"
            disabled={isLoading}
          />

          <div className="absolute right-2.5 flex items-center gap-1">
            {query && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}

            {onLocateMe && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={onLocateMe}
                disabled={isLocating || isLoading}
                title="Use current location"
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors disabled:opacity-50"
                aria-label="Use current location"
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
                ) : (
                  <LocateFixed className="w-3.5 h-3.5 text-zinc-400 hover:text-sky-500 transition-colors" />
                )}
              </motion.button>
            )}
          </div>
        </div>
      </form>

      {/* Autocomplete Suggestions Menu */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full mt-1.5 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden py-1 z-50"
          >
            <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              {query ? 'Matching Locations' : 'Popular Cities'}
            </div>

            <div className="max-h-56 overflow-y-auto">
              {filteredCities.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => {
                    setQuery(city.name);
                    onSearch(city.name);
                    setIsFocused(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs text-zinc-700 dark:text-zinc-200 group"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200" />
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{city.name}</span>
                    {city.region && (
                      <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">{city.region}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">Select</span>
                </button>
              ))}

              {filteredCities.length === 0 && (
                <div className="px-3 py-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  Press Enter to search global index for "{query}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

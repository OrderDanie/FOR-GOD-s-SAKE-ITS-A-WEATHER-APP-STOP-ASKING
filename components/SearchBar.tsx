import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOROCCO_CITIES } from '../constants';
import { CityOption } from '../types';

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
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

  const suggestions = query 
    ? MOROCCO_CITIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : MOROCCO_CITIES;

  return (
    <div className="relative w-full max-w-md mx-auto z-50" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search city (e.g., Casablanca)..."
          className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-3 pl-12 pr-4 text-white placeholder-white/50 outline-none focus:bg-white/20 focus:border-white/40 transition-all shadow-lg"
          disabled={isLoading}
        />
        <Search className={`absolute left-4 top-3.5 w-5 h-5 ${isLoading ? 'animate-pulse text-cyan-300' : 'text-white/60'}`} />
      </form>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 w-full bg-[#1a1a2e]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-2">
              <span className="text-xs text-white/40 font-semibold px-3 py-1 block">SUGGESTED CITIES</span>
              <div className="max-h-60 overflow-y-auto">
                {suggestions.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => {
                      setQuery(city.name);
                      onSearch(city.name);
                      setIsFocused(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-xl transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                      <MapPin size={14} className="text-white/60 group-hover:text-cyan-300" />
                    </div>
                    <span className="text-white/90 text-sm font-medium">{city.name}</span>
                  </button>
                ))}
                {suggestions.length === 0 && (
                   <div className="px-3 py-4 text-center text-white/50 text-sm">
                     Press Enter to search for "{query}"
                   </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

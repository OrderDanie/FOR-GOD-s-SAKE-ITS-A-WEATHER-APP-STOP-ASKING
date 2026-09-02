import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, ChevronRight, ChevronLeft, ExternalLink, Sparkles } from 'lucide-react';
import { NewsArticle } from '../types';
import { formatRelativeTime } from '../services/newsService';

interface NewsTickerProps {
  articles: NewsArticle[];
  isLoading: boolean;
  onArticleClick?: (article: NewsArticle) => void;
}

export const NewsTicker: React.FC<NewsTickerProps> = ({
  articles,
  isLoading,
  onArticleClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const headlineArticles = articles.slice(0, 8);

  useEffect(() => {
    if (isPaused || headlineArticles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % headlineArticles.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, headlineArticles.length]);

  if (isLoading && headlineArticles.length === 0) {
    return (
      <div className="w-full mb-6 p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex items-center gap-3 text-xs text-zinc-400 animate-pulse">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Connecting to live meteorological news wire...</span>
      </div>
    );
  }

  if (headlineArticles.length === 0) return null;

  const current = headlineArticles[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + headlineArticles.length) % headlineArticles.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % headlineArticles.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full mb-6 group relative overflow-hidden rounded-xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all duration-300"
    >
      <div className="flex items-center justify-between px-3.5 py-2 gap-3">
        {/* Live Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-900 dark:text-zinc-100 flex items-center gap-1 font-mono">
            <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
            <span className="hidden sm:inline">Live Wire</span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
        </div>

        {/* Animated Headline Text */}
        <div className="flex-1 min-w-0 overflow-hidden relative h-5 flex items-center">
          <AnimatePresence mode="wait">
            <motion.a
              key={current.id || currentIndex}
              href={current.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (onArticleClick) {
                  e.preventDefault();
                  onArticleClick(current);
                }
              }}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2 text-xs text-zinc-800 dark:text-zinc-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors truncate cursor-pointer font-medium"
            >
              <span className="truncate">{current.title}</span>
              <span className="shrink-0 text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">
                • {formatRelativeTime(current.published)}
              </span>
              <ExternalLink className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </motion.a>
          </AnimatePresence>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-1 shrink-0 text-zinc-400">
          <span className="text-[10px] font-mono mr-1 hidden sm:inline text-zinc-500">
            {currentIndex + 1}/{headlineArticles.length}
          </span>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={handlePrev}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            aria-label="Previous headline"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={handleNext}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            aria-label="Next headline"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

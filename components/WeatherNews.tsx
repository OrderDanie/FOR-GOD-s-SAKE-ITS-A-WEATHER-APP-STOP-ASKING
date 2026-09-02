import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Newspaper, 
  ExternalLink, 
  RefreshCw, 
  Clock, 
  Globe2, 
  Share2, 
  Check, 
  Sparkles,
  BookOpen,
  X,
  Layers,
  Leaf,
  Cpu,
  Compass
} from 'lucide-react';
import { NewsArticle, NewsCategory } from '../types';
import { fetchNewsArticles, formatRelativeTime } from '../services/newsService';
import { GlassCard } from './GlassCard';

interface WeatherNewsProps {
  initialArticles?: NewsArticle[];
  activeModalArticle?: NewsArticle | null;
  onSelectArticle?: (article: NewsArticle | null) => void;
}

const CATEGORIES: { id: NewsCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'all', label: 'All Dispatches', icon: Layers },
  { id: 'environment', label: 'Climate & Earth', icon: Leaf },
  { id: 'science', label: 'Science', icon: Compass },
  { id: 'world', label: 'World', icon: Globe2 },
  { id: 'technology', label: 'Tech', icon: Cpu },
];

export const WeatherNews: React.FC<WeatherNewsProps> = ({
  activeModalArticle: externalModalArticle,
  onSelectArticle: setExternalModalArticle,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('environment');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [internalModalArticle, setInternalModalArticle] = useState<NewsArticle | null>(null);

  const activeArticle = externalModalArticle !== undefined ? externalModalArticle : internalModalArticle;
  const setActiveArticle = (art: NewsArticle | null) => {
    if (setExternalModalArticle) {
      setExternalModalArticle(art);
    } else {
      setInternalModalArticle(art);
    }
  };

  const loadNews = async (category: NewsCategory, force: boolean = false) => {
    if (force) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await fetchNewsArticles(category, force);
      setArticles(data);
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews(selectedCategory);
  }, [selectedCategory]);

  const handleRefresh = () => {
    loadNews(selectedCategory, true);
  };

  const handleShare = async (e: React.MouseEvent, article: NewsArticle) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(article.url);
        setCopiedId(article.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch {
      // Fallback ignored
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } 
    },
  };

  return (
    <section className="mt-10" id="weather-news-section">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 dark:text-sky-400 shadow-xs">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Atmospheric & Global Dispatches
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                Live Feed
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Real-time meteorological intelligence, planetary climate developments, and science reporting.
            </p>
          </div>
        </div>

        {/* Category Pills & Refresh */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center p-1 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap outline-none flex items-center gap-1.5 ${
                    isActive
                      ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNewsCategoryPill"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-lg shadow-xs"
                      style={{ zIndex: 0 }}
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-sky-500' : 'text-zinc-400'}`} />
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}
          </div>

          <motion.button
            whileHover={{ scale: 1.08, rotate: 180 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.3 }}
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            title="Refresh news feed"
            className="p-2 rounded-xl bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-50 shrink-0 shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="rounded-2xl p-4 bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 animate-pulse space-y-3"
            >
              <div className="w-full h-44 rounded-xl bg-zinc-200 dark:bg-zinc-800/60" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800/60 rounded w-1/3" />
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800/60 rounded w-5/6" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800/60 rounded w-full" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800/60 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Articles Grid */}
      {!isLoading && articles.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {articles.map((article) => {
            const hasCopied = copiedId === article.id;
            return (
              <motion.div
                key={article.id}
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
                className="group flex flex-col justify-between rounded-2xl p-4 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => setActiveArticle(article)}
              >
                <div>
                  {/* Article Thumbnail with Smooth Image Zoom */}
                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-3.5">
                    <motion.img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback on broken image
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Category pill on image */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-black/60 backdrop-blur-md text-white border border-white/20">
                        {article.category[0] || 'Meteorology'}
                      </span>
                    </div>

                    {/* Published time pill */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-[11px] text-zinc-200 font-mono bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-sky-400" />
                      <span>{formatRelativeTime(article.published)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug mb-2">
                    {article.title}
                  </h3>

                  {/* Description snippet */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                    {article.description}
                  </p>
                </div>

                {/* Footer / Meta */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-auto">
                  <span className="truncate max-w-[150px] font-medium text-zinc-700 dark:text-zinc-300">
                    {article.author}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Share Button */}
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => handleShare(e, article)}
                      title="Copy article link"
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                    >
                      {hasCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </motion.button>

                    {/* Read action */}
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline pl-1"
                    >
                      <span>Read</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && articles.length === 0 && (
        <GlassCard className="p-8 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No news dispatches currently recorded for this filter. Tap refresh to update feeds.
          </p>
        </GlassCard>
      )}

      {/* Article Detail Modal with Spring Animations */}
      <AnimatePresence>
        {activeArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveArticle(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Cover Image */}
              <div className="relative w-full h-56 sm:h-64 shrink-0 bg-zinc-900 overflow-hidden">
                <img
                  src={activeArticle.image}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveArticle(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>

                {/* Tags on Image */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500 text-white">
                      {activeArticle.category[0] || 'News'}
                    </span>
                    <span className="text-zinc-300 font-mono text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      {formatRelativeTime(activeArticle.published)}
                    </span>
                  </div>
                  <span className="text-zinc-300 font-medium text-[11px] truncate max-w-[200px]">
                    By {activeArticle.author}
                  </span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-4">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {activeArticle.title}
                </h3>

                <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal space-y-3">
                  <p>{activeArticle.description}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 border-l-2 border-sky-500 pl-3 py-1 italic">
                    Original dispatch syndicated through Currents global meteorological news network.
                  </p>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:px-6 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => handleShare(e, activeArticle)}
                  className="px-4 py-2 rounded-xl bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedId === activeArticle.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Story</span>
                    </>
                  )}
                </motion.button>

                <motion.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  href={activeArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Full Article</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </motion.a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

import { AppTheme, CityOption, ThemeConfig } from './types';

export const MOROCCO_CITIES: CityOption[] = [
  { name: 'Casablanca', lat: 33.5731, lng: -7.5898 },
  { name: 'Rabat', lat: 34.0209, lng: -6.8416 },
  { name: 'Marrakech', lat: 31.6295, lng: -7.9811 },
  { name: 'Tangier', lat: 35.7595, lng: -5.8340 },
  { name: 'Fes', lat: 34.0331, lng: -5.0003 },
  { name: 'Agadir', lat: 30.4278, lng: -9.5981 },
  { name: 'Chefchaouen', lat: 35.1716, lng: -5.2696 },
  { name: 'Essaouira', lat: 31.5085, lng: -9.7595 },
];

export const THEMES: Record<AppTheme, ThemeConfig> = {
  [AppTheme.OCEAN]: {
    name: 'Atlantic Blue',
    gradient: 'from-blue-900 via-cyan-800 to-teal-900',
    glassColor: 'bg-blue-500/10',
    accent: 'text-cyan-300'
  },
  [AppTheme.SUNSET]: {
    name: 'Maghreb Sunset',
    gradient: 'from-purple-900 via-rose-800 to-orange-800',
    glassColor: 'bg-rose-500/10',
    accent: 'text-orange-300'
  },
  [AppTheme.FOREST]: {
    name: 'Atlas Cedar',
    gradient: 'from-emerald-900 via-green-800 to-teal-950',
    glassColor: 'bg-emerald-500/10',
    accent: 'text-emerald-300'
  },
  [AppTheme.MIDNIGHT]: {
    name: 'Desert Night',
    gradient: 'from-gray-900 via-slate-900 to-black',
    glassColor: 'bg-slate-500/10',
    accent: 'text-indigo-300'
  },
  [AppTheme.SAHARA]: {
    name: 'Sahara Dunes',
    gradient: 'from-orange-900 via-amber-800 to-yellow-900',
    glassColor: 'bg-amber-500/10',
    accent: 'text-amber-300'
  }
};

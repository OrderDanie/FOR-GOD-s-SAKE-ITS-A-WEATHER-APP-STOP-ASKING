import { CityOption } from './types';

export const MOROCCO_CITIES: CityOption[] = [
  { name: 'Casablanca', region: 'Casablanca-Settat', country: 'Morocco', lat: 33.5731, lng: -7.5898 },
  { name: 'Rabat', region: 'Rabat-Salé-Kénitra', country: 'Morocco', lat: 34.0209, lng: -6.8416 },
  { name: 'Marrakech', region: 'Marrakesh-Safi', country: 'Morocco', lat: 31.6295, lng: -7.9811 },
  { name: 'Tangier', region: 'Tanger-Tetouan-Al Hoceima', country: 'Morocco', lat: 35.7595, lng: -5.8340 },
  { name: 'Fes', region: 'Fès-Meknès', country: 'Morocco', lat: 34.0331, lng: -5.0003 },
  { name: 'Agadir', region: 'Souss-Massa', country: 'Morocco', lat: 30.4278, lng: -9.5981 },
  { name: 'Chefchaouen', region: 'Tanger-Tetouan-Al Hoceima', country: 'Morocco', lat: 35.1716, lng: -5.2696 },
  { name: 'Essaouira', region: 'Marrakesh-Safi', country: 'Morocco', lat: 31.5085, lng: -9.7595 },
  { name: 'Ouarzazate', region: 'Drâa-Tafilalet', country: 'Morocco', lat: 30.9335, lng: -6.9370 },
  { name: 'Ifrane', region: 'Fès-Meknès', country: 'Morocco', lat: 33.5273, lng: -5.1094 }
];

export const formatTemperature = (tempC: number, unit: 'C' | 'F'): string => {
  if (unit === 'F') {
    return `${Math.round((tempC * 9) / 5 + 32)}°`;
  }
  return `${Math.round(tempC)}°`;
};

export const convertTemperature = (tempC: number, unit: 'C' | 'F'): number => {
  if (unit === 'F') {
    return Math.round((tempC * 9) / 5 + 32);
  }
  return Math.round(tempC);
};

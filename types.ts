export type TemperatureUnit = 'C' | 'F';

export interface HourlyForecastData {
  time: string;
  isoTime: string;
  temp_c: number;
  condition_text: string;
  chance_of_rain: number;
  wind_kph: number;
}

export interface ForecastDay {
  date: string;
  dayName: string;
  temp_high_c: number;
  temp_low_c: number;
  condition_text: string;
  chance_of_rain: number;
  uv_index: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  city: string;
  country: string;
  timezone: string;
  lat: number;
  lng: number;
  current: {
    temp_c: number;
    condition_text: string;
    humidity: number;
    wind_kph: number;
    wind_direction: number;
    wind_direction_cardinal: string;
    feels_like_c: number;
    pressure_hpa: number;
    visibility_km: number;
    uv: number;
    uv_level: string;
    temp_max_today: number;
    temp_min_today: number;
    sunrise: string;
    sunset: string;
    last_updated: string;
  };
  hourly: HourlyForecastData[];
  forecast: ForecastDay[];
  weatherInsight: string;
  aiInsight?: string;
}

export interface CityOption {
  name: string;
  region?: string;
  country?: string;
  lat: number;
  lng: number;
}

export enum AppTheme {
  SLATE = 'slate',
  OCEAN = 'ocean',
  MONO = 'mono'
}

export interface ThemeConfig {
  name: string;
  accent: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string;
  image?: string;
  language: string;
  category: string[];
  published: string;
}

export type NewsCategory = 'all' | 'environment' | 'world' | 'science' | 'technology';

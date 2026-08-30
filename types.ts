export interface HourlyForecastData {
  time: string;
  temp_c: number;
  condition_text: string;
  chance_of_rain: number;
}

export interface ForecastDay {
  date: string;
  dayName: string;
  temp_high_c: number;
  temp_low_c: number;
  condition_text: string;
}

export interface WeatherData {
  city: string;
  country: string;
  current: {
    temp_c: number;
    condition_text: string;
    humidity: number;
    wind_kph: number;
    feels_like_c: number;
    uv: number;
    last_updated: string;
  };
  hourly: HourlyForecastData[];
  forecast: ForecastDay[];
  weatherInsight: string;
  aiInsight?: string;
}

export interface CityOption {
  name: string;
  lat: number;
  lng: number;
}

export enum AppTheme {
  OCEAN = 'ocean',
  SUNSET = 'sunset',
  FOREST = 'forest',
  MIDNIGHT = 'midnight',
  SAHARA = 'sahara'
}

export interface ThemeConfig {
  name: string;
  gradient: string;
  glassColor: string;
  accent: string;
}

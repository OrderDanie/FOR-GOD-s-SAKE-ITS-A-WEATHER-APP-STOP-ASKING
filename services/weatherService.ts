import { WeatherData, HourlyForecastData, ForecastDay } from "../types";
import { MOROCCO_CITIES } from "../constants";

// WMO Weather interpretation codes
const weatherCodeMap: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  62: 'Rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

const getConditionText = (code: number): string => {
  return weatherCodeMap[code] || 'Partly cloudy';
};

const generateHumanAdvisory = (
  tempC: number,
  feelsLikeC: number,
  conditionText: string,
  windKph: number,
  uv: number,
  humidity: number,
  cityName: string
): string => {
  const lowerCondition = conditionText.toLowerCase();

  if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) {
    return `Thunderstorm activity detected in ${cityName}. Seek shelter indoors and keep electronic devices protected.`;
  }
  if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle') || lowerCondition.includes('shower')) {
    return `Precipitation expected in ${cityName}. Keep an umbrella nearby and take care on slick roads.`;
  }
  if (lowerCondition.includes('snow') || lowerCondition.includes('ice')) {
    return `Winter conditions in ${cityName}. Bundle up with warm insulation and watch for icy patches.`;
  }
  if (uv >= 8) {
    return `High UV intensity (${uv}) in ${cityName}. Broad-spectrum sunscreen, sunglasses, and shade are strongly advised.`;
  }
  if (windKph > 35) {
    return `Brisk winds reaching ${windKph} km/h in ${cityName}. Secure loose outdoor items and wear a windbreaker.`;
  }
  if (tempC >= 32) {
    return `Hot conditions today in ${cityName} (${Math.round(tempC)}°C). Stay well hydrated and limit intense midday sun exposure.`;
  }
  if (tempC <= 10) {
    return `Cool temperatures in ${cityName} (${Math.round(tempC)}°C). A warm coat or layered clothing will keep you comfortable.`;
  }
  if (humidity > 80 && tempC > 22) {
    return `High humidity levels (${humidity}%) making it feel like ${Math.round(feelsLikeC)}°C. Breathable cotton fabrics are ideal.`;
  }

  return `Pleasant, moderate atmospheric conditions in ${cityName}. Ideal weather for outdoor strolls and activities.`;
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const fetchWeather = async (city: string): Promise<WeatherData> => {
  const normalizedSearch = city.trim();
  
  // Check known Morocco cities first for instant exact match
  const matchedMoroccoCity = MOROCCO_CITIES.find(
    c => c.name.toLowerCase() === normalizedSearch.toLowerCase()
  );

  let lat: number;
  let lng: number;
  let resolvedCityName = normalizedSearch;
  let resolvedCountry = 'Morocco';

  if (matchedMoroccoCity) {
    lat = matchedMoroccoCity.lat;
    lng = matchedMoroccoCity.lng;
    resolvedCityName = matchedMoroccoCity.name;
    resolvedCountry = 'Morocco';
  } else {
    // Use Open-Meteo free geocoding API
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(normalizedSearch)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geocodingUrl);
    if (!geoRes.ok) {
      throw new Error(`Failed to locate city: ${city}`);
    }
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`City "${city}" could not be found.`);
    }

    const place = geoData.results[0];
    lat = place.latitude;
    lng = place.longitude;
    resolvedCityName = place.name;
    resolvedCountry = place.country || 'Global';
  }

  // Fetch forecast data from Open-Meteo
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;

  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) {
    throw new Error(`Weather service is currently unavailable.`);
  }
  const weatherJson = await weatherRes.json();

  const current = weatherJson.current;
  const hourly = weatherJson.hourly;
  const daily = weatherJson.daily;

  const currentTemp = Math.round(current?.temperature_2m ?? 20);
  const feelsLike = Math.round(current?.apparent_temperature ?? currentTemp);
  const currentCondition = getConditionText(current?.weather_code ?? 0);
  const humidity = Math.round(current?.relative_humidity_2m ?? 50);
  const windKph = Math.round(current?.wind_speed_10m ?? 10);
  const uv = Math.round(current?.uv_index ?? daily?.uv_index_max?.[0] ?? 4);

  // Parse Hourly Forecast (next 24 hours starting from current hour)
  const currentIsoHour = new Date().getHours();
  const hourlyDataList: HourlyForecastData[] = [];
  
  if (hourly?.time && Array.isArray(hourly.time)) {
    // Find index near current hour
    const startIndex = Math.min(Math.max(0, currentIsoHour), Math.max(0, hourly.time.length - 24));
    const next24 = hourly.time.slice(startIndex, startIndex + 24);

    next24.forEach((isoTime: string, idx: number) => {
      const realIdx = startIndex + idx;
      const dateObj = new Date(isoTime);
      const hoursStr = String(dateObj.getHours()).padStart(2, '0') + ':00';
      const temp = Math.round(hourly.temperature_2m?.[realIdx] ?? currentTemp);
      const rainChance = Math.round(hourly.precipitation_probability?.[realIdx] ?? 0);
      const condition = getConditionText(hourly.weather_code?.[realIdx] ?? 0);

      hourlyDataList.push({
        time: hoursStr,
        temp_c: temp,
        condition_text: condition,
        chance_of_rain: rainChance,
      });
    });
  }

  // Parse 4-day Daily Forecast
  const forecastList: ForecastDay[] = [];
  if (daily?.time && Array.isArray(daily.time)) {
    const next4Days = daily.time.slice(0, 4);
    next4Days.forEach((dateStr: string, idx: number) => {
      const d = new Date(dateStr);
      const dayName = idx === 0 ? 'Today' : dayNames[d.getDay()];
      const high = Math.round(daily.temperature_2m_max?.[idx] ?? currentTemp + 2);
      const low = Math.round(daily.temperature_2m_min?.[idx] ?? currentTemp - 4);
      const condition = getConditionText(daily.weather_code?.[idx] ?? 0);

      forecastList.push({
        date: dateStr,
        dayName,
        temp_high_c: high,
        temp_low_c: low,
        condition_text: condition,
      });
    });
  }

  const advisory = generateHumanAdvisory(
    currentTemp,
    feelsLike,
    currentCondition,
    windKph,
    uv,
    humidity,
    resolvedCityName
  );

  const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    city: resolvedCityName,
    country: resolvedCountry,
    current: {
      temp_c: currentTemp,
      condition_text: currentCondition,
      humidity,
      wind_kph: windKph,
      feels_like_c: feelsLike,
      uv,
      last_updated: nowFormatted,
    },
    hourly: hourlyDataList,
    forecast: forecastList,
    weatherInsight: advisory,
    aiInsight: advisory,
  };
};

// Backwards-compatible alias for any callers
export const fetchWeatherWithGemini = fetchWeather;

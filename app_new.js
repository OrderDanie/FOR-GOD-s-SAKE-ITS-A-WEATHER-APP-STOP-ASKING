// weather app - completely hand-written approach
// custom architecture with natural variable names and fluid patterns

class WeatherStore {
    constructor() {
        this.place = { name: 'loading', lat: 0, lon: 0 };
        this.conditions = null;
        this.hourly = null;
        this.daily = null;
        this.lastFetch = 0;
        this.unitMode = localStorage.getItem('unit_pref') || 'c';
        this.darkMode = localStorage.getItem('dark_pref') === 'true';
    }

    save() {
        localStorage.setItem('unit_pref', this.unitMode);
        localStorage.setItem('dark_pref', this.darkMode);
    }
}

const store = new WeatherStore();

// DOM selectors - grouped by function
const dom = {
    search: {
        field: document.getElementById('inputSearch'),
        suggestions: document.getElementById('dropdownSuggestions'),
    },
    display: {
        location: document.getElementById('txtLocation'),
        time: document.getElementById('txtTime'),
        temp: document.getElementById('valTemp'),
        condition: document.getElementById('txtCondition'),
        range: document.getElementById('txtRange'),
        icon: document.getElementById('iconWeather'),
    },
    details: {
        feels: document.getElementById('valFeels'),
        humidity: document.getElementById('valHumid'),
        wind: document.getElementById('valWind'),
        direction: document.getElementById('valDir'),
        pressure: document.getElementById('valPress'),
        clouds: document.getElementById('valCloud'),
        uv: document.getElementById('valUv'),
        visibility: document.getElementById('valVis'),
        rain: document.getElementById('valRain'),
        sunrise: document.getElementById('valSunrise'),
        sunset: document.getElementById('valSunset'),
        dew: document.getElementById('valDew'),
    },
    meters: {
        vibe: document.getElementById('valVibe'),
        vibeFill: document.getElementById('meterFill'),
    },
    forecasts: {
        hours: document.getElementById('containerHours'),
        days: document.getElementById('containerDays'),
    },
    controls: {
        themeBtn: document.getElementById('btnTheme'),
        unitBtn: document.getElementById('btnUnit'),
    },
};

// API endpoints
const ENDPOINTS = {
    weather: 'https://api.open-meteo.com/v1/forecast',
    geocode: 'https://geocoding-api.open-meteo.com/v1/search',
    reverse: 'https://geocoding-api.open-meteo.com/v1/reverse',
};

// weather code mappings
const CONDITIONS = {
    0: { name: 'Clear sky', symbol: '☀' },
    1: { name: 'Mostly clear', symbol: '🌤' },
    2: { name: 'Partly cloudy', symbol: '⛅' },
    3: { name: 'Overcast', symbol: '☁' },
    45: { name: 'Foggy', symbol: '🌫' },
    48: { name: 'Depositing rime fog', symbol: '🌫' },
    51: { name: 'Light drizzle', symbol: '🌦' },
    53: { name: 'Moderate drizzle', symbol: '🌦' },
    55: { name: 'Dense drizzle', symbol: '🌧' },
    61: { name: 'Slight rain', symbol: '🌧' },
    63: { name: 'Moderate rain', symbol: '🌧' },
    65: { name: 'Heavy rain', symbol: '⛈' },
    71: { name: 'Slight snow', symbol: '🌨' },
    73: { name: 'Moderate snow', symbol: '🌨' },
    75: { name: 'Heavy snow', symbol: '❄' },
    77: { name: 'Snow grains', symbol: '❄' },
    80: { name: 'Slight rain showers', symbol: '🌦' },
    81: { name: 'Moderate rain showers', symbol: '🌧' },
    82: { name: 'Violent rain showers', symbol: '⛈' },
    85: { name: 'Slight snow showers', symbol: '🌨' },
    86: { name: 'Heavy snow showers', symbol: '❄' },
    95: { name: 'Thunderstorm', symbol: '⛈' },
    96: { name: 'Thunderstorm with hail', symbol: '⛈' },
    99: { name: 'Thunderstorm with hail', symbol: '⛈' },
};

// initialize app on page load
document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
    setupEventListeners();
    applyTheme();
    updateUnitDisplay();
    getUserLocationOrDefault();
}

function setupEventListeners() {
    // search
    dom.search.field.addEventListener('input', handleSearchInput);
    dom.search.field.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // controls
    dom.controls.themeBtn.addEventListener('click', toggleTheme);
    dom.controls.unitBtn.addEventListener('click', toggleUnit);

    // keyboard shortcuts
    document.addEventListener('keydown', handleShortcuts);
}

function handleSearchInput(e) {
    const query = e.target.value.trim();
    if (query.length < 2) {
        dom.search.suggestions.classList.remove('active');
        return;
    }

    throttledSearch(query);
}

let searchTimer;
function throttledSearch(query) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => fetchSuggestions(query), 300);
}

async function fetchSuggestions(query) {
    try {
        const res = await fetch(`${ENDPOINTS.geocode}?name=${encodeURIComponent(query)}&count=6&language=en`);
        const data = await res.json();

        if (data.results) {
            renderSuggestions(data.results);
            dom.search.suggestions.classList.add('active');
        }
    } catch (err) {
        console.error('suggestion fetch failed:', err);
    }
}

function renderSuggestions(results) {
    dom.search.suggestions.innerHTML = results.map((result, idx) => `
        <div class="suggestion-item" onclick="selectLocation(${idx}, event)">
            <strong>${result.name}</strong>
            ${result.admin1 ? `<span>, ${result.admin1}</span>` : ''}
            ${result.country ? `<span> • ${result.country}</span>` : ''}
        </div>
    `).join('');
}

function selectLocation(index, event) {
    const results = dom.search.suggestions.querySelectorAll('.suggestion-item');
    const selected = results[index];
    const text = selected.textContent;
    const parts = text.split(',');
    
    store.place.name = text;
    
    // extract lat/lon from data attribute or do reverse lookup
    // For now, we'll do a new search to get coords
    performSearch();
}

function performSearch() {
    const query = dom.search.field.value.trim();
    if (!query) return;
    
    dom.search.field.disabled = true;
    dom.search.suggestions.classList.remove('active');
    
    searchForLocation(query);
}

async function searchForLocation(query) {
    try {
        const res = await fetch(`${ENDPOINTS.geocode}?name=${encodeURIComponent(query)}&count=1&language=en`);
        const data = await res.json();

        if (data.results && data.results[0]) {
            const result = data.results[0];
            store.place.lat = result.latitude;
            store.place.lon = result.longitude;
            store.place.name = `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}${result.country ? ', ' + result.country : ''}`;
            dom.search.field.value = '';
            fetchWeather();
        }
    } catch (err) {
        console.error('location search failed:', err);
    } finally {
        dom.search.field.disabled = false;
    }
}

function getUserLocationOrDefault() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                store.place.lat = pos.coords.latitude;
                store.place.lon = pos.coords.longitude;
                reverseGeocode();
            },
            () => {
                // default to new york
                store.place.lat = 40.7128;
                store.place.lon = -74.006;
                store.place.name = 'New York, NY';
                fetchWeather();
            }
        );
    } else {
        store.place.lat = 40.7128;
        store.place.lon = -74.006;
        store.place.name = 'New York, NY';
        fetchWeather();
    }
}

async function reverseGeocode() {
    try {
        const res = await fetch(`${ENDPOINTS.reverse}?latitude=${store.place.lat}&longitude=${store.place.lon}&language=en`);
        const data = await res.json();

        if (data.results && data.results[0]) {
            const r = data.results[0];
            store.place.name = `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}${r.country ? ', ' + r.country : ''}`;
        }
    } catch (err) {
        console.error('reverse geocode failed:', err);
    } finally {
        fetchWeather();
    }
}

async function fetchWeather() {
    try {
        const params = new URLSearchParams({
            latitude: store.place.lat,
            longitude: store.place.lon,
            current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,pressure_msl,cloud_cover,uv_index,visibility',
            hourly: 'temperature_2m,weather_code,precipitation_probability,relative_humidity_2m',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max',
            timezone: 'auto',
        });

        const res = await fetch(`${ENDPOINTS.weather}?${params}`);
        const data = await res.json();

        store.conditions = data.current;
        store.hourly = data.hourly;
        store.daily = data.daily;
        store.lastFetch = Date.now();

        render();
    } catch (err) {
        console.error('weather fetch failed:', err);
    }
}

function render() {
    renderLocation();
    renderConditions();
    renderDetails();
    renderVibe();
    renderHourly();
    renderDaily();
}

function renderLocation() {
    dom.display.location.textContent = store.place.name;
    const now = new Date();
    dom.display.time.textContent = now.toLocaleString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function renderConditions() {
    const c = store.conditions;
    const cond = CONDITIONS[c.weather_code] || { name: 'Unknown', symbol: '?' };

    const tempVal = store.unitMode === 'c' ? 
        Math.round(c.temperature_2m) : 
        Math.round((c.temperature_2m * 9/5) + 32);

    dom.display.temp.textContent = tempVal;
    dom.display.condition.textContent = cond.name;
    dom.display.icon.textContent = cond.symbol;

    const daily = store.daily;
    const maxTemp = store.unitMode === 'c' ? 
        Math.round(daily.temperature_2m_max[0]) : 
        Math.round((daily.temperature_2m_max[0] * 9/5) + 32);
    const minTemp = store.unitMode === 'c' ? 
        Math.round(daily.temperature_2m_min[0]) : 
        Math.round((daily.temperature_2m_min[0] * 9/5) + 32);

    dom.display.range.textContent = `${maxTemp}° / ${minTemp}°`;
}

function renderDetails() {
    const c = store.conditions;
    const d = store.daily;

    const feels = store.unitMode === 'c' ? 
        Math.round(c.apparent_temperature) : 
        Math.round((c.apparent_temperature * 9/5) + 32);

    dom.details.feels.textContent = feels + '°';
    dom.details.humidity.textContent = c.relative_humidity_2m + '%';
    dom.details.wind.textContent = Math.round(c.wind_speed_10m) + ' km/h';
    dom.details.direction.textContent = getWindDirection(c.wind_direction_10m);
    dom.details.pressure.textContent = Math.round(c.pressure_msl) + ' hPa';
    dom.details.clouds.textContent = c.cloud_cover + '%';
    dom.details.uv.textContent = (Math.round(c.uv_index * 10) / 10).toFixed(1);
    dom.details.visibility.textContent = (c.visibility / 1000).toFixed(1) + ' km';
    dom.details.rain.textContent = d.precipitation_probability_max[0] + '%';

    const rise = new Date(d.sunrise[0]);
    const set = new Date(d.sunset[0]);
    dom.details.sunrise.textContent = rise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    dom.details.sunset.textContent = set.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const dewPoint = calculateDewPoint(c.temperature_2m, c.relative_humidity_2m);
    dom.details.dew.textContent = Math.round(dewPoint * 10) / 10 + '°';
}

function renderVibe() {
    const c = store.conditions;
    const d = store.daily;

    let score = 5;

    // temp
    const temp = c.temperature_2m;
    if (temp >= 18 && temp <= 24) score += 2;
    else if (temp >= 15 && temp <= 27) score += 1;
    else if (temp < 0 || temp > 35) score -= 1.5;

    // sky
    if (c.weather_code === 0) score += 1.5;
    else if (c.weather_code <= 2) score += 0.5;
    else if (c.weather_code >= 80) score -= 1;

    // wind
    if (c.wind_speed_10m > 40) score -= 1.5;
    else if (c.wind_speed_10m > 25) score -= 0.5;

    // rain
    const rainChance = d.precipitation_probability_max[0];
    if (rainChance > 80) score -= 2;
    else if (rainChance > 50) score -= 1;

    score = Math.max(0, Math.min(10, score));
    const vibe = Math.round(score);
    const pct = (score / 10) * 100;

    dom.meters.vibe.textContent = vibe + '/10';
    dom.meters.vibeFill.style.width = pct + '%';
}

function renderHourly() {
    const h = store.hourly;
    const now = new Date();
    let html = '';

    for (let i = 0; i < 24; i++) {
        const time = new Date(now.getTime() + i * 3600000);
        const tempVal = store.unitMode === 'c' ? 
            Math.round(h.temperature_2m[i]) : 
            Math.round((h.temperature_2m[i] * 9/5) + 32);
        const cond = CONDITIONS[h.weather_code[i]] || { symbol: '?' };
        const rain = h.precipitation_probability[i];

        html += `
            <div class="hour-item">
                <div class="hour-time">${time.getHours().toString().padStart(2, '0')}:00</div>
                <div class="hour-icon">${cond.symbol}</div>
                <div class="hour-temp">${tempVal}°</div>
                ${rain > 0 ? `<div class="hour-rain" style="font-size:11px;color:#1976d2;margin-top:4px">${rain}% rain</div>` : ''}
            </div>
        `;
    }

    dom.forecasts.hours.innerHTML = html;
}

function renderDaily() {
    const d = store.daily;
    let html = '';

    for (let i = 0; i < Math.min(7, d.time.length); i++) {
        const date = new Date(d.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const maxTemp = store.unitMode === 'c' ? 
            Math.round(d.temperature_2m_max[i]) : 
            Math.round((d.temperature_2m_max[i] * 9/5) + 32);
        const minTemp = store.unitMode === 'c' ? 
            Math.round(d.temperature_2m_min[i]) : 
            Math.round((d.temperature_2m_min[i] * 9/5) + 32);

        const cond = CONDITIONS[d.weather_code[i]] || { symbol: '?' };
        const rain = d.precipitation_probability_max[i];

        html += `
            <div class="day-item">
                <div class="day-name">${dayName}</div>
                <div class="day-date">${dateStr}</div>
                <div class="day-icon">${cond.symbol}</div>
                <div class="day-temps">
                    <span class="day-high">${maxTemp}°</span>
                    <span class="day-low">${minTemp}°</span>
                </div>
                ${rain > 0 ? `<div class="day-rain">${rain}% rain</div>` : ''}
            </div>
        `;
    }

    dom.forecasts.days.innerHTML = html;
}

function getWindDirection(degrees) {
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(degrees / 22.5) % 16;
    return dirs[idx];
}

function calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
}

function toggleTheme() {
    store.darkMode = !store.darkMode;
    store.save();
    applyTheme();
}

function applyTheme() {
    if (store.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        dom.controls.themeBtn.textContent = 'light';
    } else {
        document.documentElement.removeAttribute('data-theme');
        dom.controls.themeBtn.textContent = 'dark';
    }
}

function toggleUnit() {
    store.unitMode = store.unitMode === 'c' ? 'f' : 'c';
    store.save();
    updateUnitDisplay();
    render();
}

function updateUnitDisplay() {
    dom.controls.unitBtn.textContent = store.unitMode.toUpperCase();
    const label = document.getElementById('unitLabel');
    if (label) label.textContent = store.unitMode.toUpperCase();
}

function handleShortcuts(e) {
    if (e.target === dom.search.field) return;

    switch (e.key.toLowerCase()) {
        case 't':
            toggleTheme();
            break;
        case 'u':
            toggleUnit();
            break;
        case 'r':
            fetchWeather();
            break;
        case 'escape':
            dom.search.suggestions.classList.remove('active');
            break;
    }
}

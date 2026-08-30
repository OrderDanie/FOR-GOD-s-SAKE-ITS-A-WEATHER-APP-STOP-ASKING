// just fetch weather data lol, uses open-meteo cause its free and they don't make u deal w api keys
const API_BASE = 'https://api.open-meteo.com/v1';
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1';

// keeping track of stuff
let currentLocation = { lat: 0, lon: 0, name: 'Unknown' };
let weatherData = null;
let searchTimeout;
let useCelsius = true; // unit toggle
let favorites = JSON.parse(localStorage.getItem('weatherFavorites') || '[]');

// grab all the things from the html so we can poke them
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const unitToggle = document.getElementById('unitToggle');
const suggestionsDiv = document.getElementById('suggestions');
const currentWeatherDiv = document.getElementById('currentWeather');
const hourlyForecastDiv = document.getElementById('hourlyForecast');
const dailyForecastDiv = document.getElementById('dailyForecast');
const alertsContainer = document.getElementById('alertsContainer');
const loadingOverlay = document.getElementById('loadingOverlay');
const favoritesList = document.getElementById('favoritesList');
const addFavoriteBtn = document.getElementById('addFavoriteBtn');

// start it up when the page loads
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderFavorites();
    getLocationAndWeather();
});

// keyboard shortcuts for power users
document.addEventListener('keydown', (e) => {
    // ignore if typing in input
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.key.toLowerCase()) {
        case 'l':
            getCurrentLocationWeather();
            break;
        case 'u':
            toggleUnits();
            break;
        case 'f':
            if (favorites.length > 0) loadFavorite(0);
            break;
        case 'r':
            fetchWeather(currentLocation.lat, currentLocation.lon);
            break;
        case '/':
            e.preventDefault();
            searchInput.focus();
            break;
    }
});

// ok so when the user does stuff, do things
function setupEventListeners() {
    searchBtn.addEventListener('click', searchWeather);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchWeather();
    });
    searchInput.addEventListener('input', handleSearchInput);
    locationBtn.addEventListener('click', getCurrentLocationWeather);
    unitToggle.addEventListener('click', toggleUnits);
    addFavoriteBtn.addEventListener('click', addToFavorites);
}

// toggle between C and F
function toggleUnits() {
    useCelsius = !useCelsius;
    unitToggle.textContent = useCelsius ? '°C' : '°F';
    // update the main temperature unit display
    document.querySelector('.temp-unit').textContent = useCelsius ? '°C' : '°F';
    if (weatherData) {
        updateCurrentWeather();
        updateHourlyForecast();
        updateDailyForecast();
    }
}

// show/hide loading
function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

// try to find where the user is at
function getCurrentLocationWeather() {
    locationBtn.textContent = '⏳';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation.lat = position.coords.latitude;
                currentLocation.lon = position.coords.longitude;
                fetchWeatherAndReverseGeocode();
            },
            (error) => {
                alert('couldnt find u, heres new york instead lol');
                locationBtn.textContent = '📍';
            }
        );
    }
}

// save current location to favorites
function addToFavorites() {
    const exists = favorites.some(fav => 
        Math.abs(fav.lat - currentLocation.lat) < 0.01 && 
        Math.abs(fav.lon - currentLocation.lon) < 0.01
    );
    
    if (exists) {
        alert('already saved dummy');
        return;
    }
    
    favorites.push({
        lat: currentLocation.lat,
        lon: currentLocation.lon,
        name: currentLocation.name
    });
    
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    renderFavorites();
}

// show saved locations
function renderFavorites() {
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="no-favs">no saved spots yet, hit + to add this one</p>';
        return;
    }
    
    favoritesList.innerHTML = favorites.map((fav, index) => `
        <div class="favorite-item" onclick="loadFavorite(${index})">
            <span class="fav-name">${fav.name}</span>
            <button class="fav-delete" onclick="event.stopPropagation(); deleteFavorite(${index})">×</button>
        </div>
    `).join('');
}

// load a saved location
function loadFavorite(index) {
    const fav = favorites[index];
    currentLocation = { lat: fav.lat, lon: fav.lon, name: fav.name };
    fetchWeather(fav.lat, fav.lon);
}

// delete a favorite
function deleteFavorite(index) {
    favorites.splice(index, 1);
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    renderFavorites();
}

// figure out the city name from the coords
async function fetchWeatherAndReverseGeocode() {
    try {
        const response = await fetch(
            `${GEOCODING_API}/reverse?latitude=${currentLocation.lat}&longitude=${currentLocation.lon}&language=en`
        );
        const data = await response.json();
        
        if (data.results && data.results[0]) {
            const result = data.results[0];
            currentLocation.name = `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}${result.country ? ', ' + result.country : ''}`;
        }
        
        await fetchWeather(currentLocation.lat, currentLocation.lon);
        locationBtn.textContent = '📍';
    } catch (error) {
        console.error('oops reverse geocoding failed:', error);
        await fetchWeather(currentLocation.lat, currentLocation.lon);
        locationBtn.textContent = '📍';
    }
}

// when the app starts, just give them new york (sorry ny, ur not that special but u load first)
function getLocationAndWeather() {
    currentLocation = { lat: 40.7128, lon: -74.0060, name: 'New York, NY' };
    fetchWeather(currentLocation.lat, currentLocation.lon);
}

// find weather for a city the user typed
async function searchWeather() {
    const city = searchInput.value.trim();
    if (!city) return;

    try {
        const response = await fetch(
            `${GEOCODING_API}/search?name=${encodeURIComponent(city)}&count=1&language=en`
        );
        const data = await response.json();

        if (data.results && data.results[0]) {
            const result = data.results[0];
            currentLocation.lat = result.latitude;
            currentLocation.lon = result.longitude;
            currentLocation.name = `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}${result.country ? ', ' + result.country : ''}`;
            
            searchInput.value = '';
            suggestionsDiv.classList.remove('show');
            await fetchWeather(currentLocation.lat, currentLocation.lon);
        }
    } catch (error) {
        console.error('search broke:', error);
    }
}

// as user types, suggest cities (no wait thats annoying, give them 0.3 seconds of peace)
async function handleSearchInput(e) {
    const value = e.target.value.trim();
    
    if (value.length < 2) {
        suggestionsDiv.classList.remove('show');
        return;
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(
                `${GEOCODING_API}/search?name=${encodeURIComponent(value)}&count=5&language=en`
            );
            const data = await response.json();

            if (data.results) {
                suggestionsDiv.innerHTML = data.results
                    .map((result) => `
                        <div class="suggestion-item" onclick="selectSuggestion('${result.latitude}', '${result.longitude}', '${result.name}', '${result.admin1 || ''}', '${result.country || ''}')">
                            ${result.name}${result.admin1 ? ', ' + result.admin1 : ''}${result.country ? ', ' + result.country : ''}
                        </div>
                    `)
                    .join('');
                suggestionsDiv.classList.add('show');
            }
        } catch (error) {
            console.error('suggestions failed:', error);
        }
    }, 300);
}

// user picked a city from the list
function selectSuggestion(lat, lon, name, admin1, country) {
    currentLocation = {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        name: `${name}${admin1 ? ', ' + admin1 : ''}${country ? ', ' + country : ''}`
    };
    searchInput.value = '';
    suggestionsDiv.classList.remove('show');
    fetchWeather(currentLocation.lat, currentLocation.lon);
}

// get the actual weather numbers n stuff
async function fetchWeather(lat, lon) {
    showLoading(true);
    try {
        const response = await fetch(
            `${API_BASE}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,uv_index,visibility,cloud_cover&hourly=temperature_2m,weather_code,relative_humidity_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset,precipitation_sum,precipitation_probability_max&timezone=auto`
        );
        const data = await response.json();
        weatherData = data;
        
        updateCurrentWeather();
        updateHourlyForecast();
        updateDailyForecast();
        updateCurrentTime();
        updateDayScore();
        updateLastUpdated();
        
        // keep the time updated every minute
        setInterval(updateCurrentTime, 60000);
    } catch (error) {
        console.error('weather fetch went boom:', error);
        alert('couldnt get weather data rn');
    } finally {
        showLoading(false);
    }
}

// update last updated time
function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('lastUpdated').textContent = `updated ${timeString}`;
}

// convert the weather code number to an actual description (thx wmo)
function getWeatherDescription(code) {
    const descriptions = {
        0: { desc: 'Clear Sky', emoji: '☀️' },
        1: { desc: 'Mostly Clear', emoji: '🌤️' },
        2: { desc: 'Some clouds', emoji: '⛅' },
        3: { desc: 'Cloudy af', emoji: '☁️' },
        45: { desc: 'Foggy', emoji: '🌫️' },
        48: { desc: 'Rime fog (weird)', emoji: '🌫️' },
        51: { desc: 'Light drizzle', emoji: '🌦️' },
        53: { desc: 'Drizzling', emoji: '🌦️' },
        55: { desc: 'Heavy drizzle', emoji: '🌧️' },
        61: { desc: 'Light rain', emoji: '🌧️' },
        63: { desc: 'Raining', emoji: '🌧️' },
        65: { desc: 'Heavy rain', emoji: '⛈️' },
        71: { desc: 'Light snow', emoji: '🌨️' },
        73: { desc: 'Snowing', emoji: '🌨️' },
        75: { desc: 'Heavy snow', emoji: '❄️' },
        77: { desc: 'Snow grains', emoji: '🌨️' },
        80: { desc: 'Rain showers', emoji: '🌦️' },
        81: { desc: 'Heavy rain showers', emoji: '🌧️' },
        82: { desc: 'Violent rain (rip)', emoji: '⛈️' },
        85: { desc: 'Snow showers', emoji: '🌨️' },
        86: { desc: 'Heavy snow showers', emoji: '❄️' },
        95: { desc: 'Thunderstorm', emoji: '⛈️' },
        96: { desc: 'Thunderstorm w hail', emoji: '⛈️' },
        99: { desc: 'Hail everywhere', emoji: '⛈️' },
    };
    return descriptions[code] || { desc: 'idk what this is', emoji: '🌐' };
}

// emoji weather icon (its good enough)
function getWeatherIcon(code) {
    const { emoji } = getWeatherDescription(code);
    return emoji;
}

// convert degrees to compass direction (N, NE, E, etc)
function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

// calculate dew point from temp and humidity (science time baby)
function calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7; // celsius
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    return Math.round(dewPoint * 10) / 10;
}

// convert celsius to fahrenheit
function cToF(celsius) {
    return Math.round(celsius * 9/5 + 32);
}

// convert km/h to mph
function kmhToMph(kmh) {
    return Math.round(kmh * 0.621371);
}

// convert km to miles
function kmToMiles(km) {
    return Math.round(km * 0.621371 * 10) / 10;
}

// get display temp based on unit setting
function getDisplayTemp(celsius) {
    return useCelsius ? Math.round(celsius) + '°C' : cToF(celsius) + '°F';
}

// get display wind speed
function getDisplayWind(kmh) {
    return useCelsius ? Math.round(kmh) + ' km/h' : kmhToMph(kmh) + ' mph';
}

// get display visibility
function getDisplayVisibility(meters) {
    const km = meters / 1000;
    return useCelsius ? km.toFixed(1) + ' km' : kmToMiles(km) + ' mi';
}

// calculate day score (0-10) based on weather conditions
function calculateDayScore() {
    const current = weatherData.current;
    const daily = weatherData.daily;
    let score = 10; // start perfect
    
    // temperature penalty (ideal 20-25°C)
    const temp = current.temperature_2m;
    if (temp > 30) score -= 2;
    else if (temp > 27) score -= 1;
    else if (temp < 0) score -= 3;
    else if (temp < 5) score -= 2;
    else if (temp < 10) score -= 1;
    
    // rain penalty
    const rainChance = daily.precipitation_probability_max[0];
    if (rainChance > 80) score -= 3;
    else if (rainChance > 50) score -= 2;
    else if (rainChance > 20) score -= 1;
    
    // wind penalty
    const wind = current.wind_speed_10m;
    if (wind > 40) score -= 2;
    else if (wind > 25) score -= 1;
    
    // uv penalty
    const uv = current.uv_index || 0;
    if (uv > 8) score -= 1;
    else if (uv > 6) score -= 0.5;
    
    // cloud penalty (too cloudy is meh)
    const clouds = current.cloud_cover || 0;
    if (clouds > 90) score -= 1;
    else if (clouds > 70) score -= 0.5;
    
    // humidity penalty
    const humidity = current.relative_humidity_2m;
    if (humidity > 85) score -= 1;
    else if (humidity > 70) score -= 0.5;
    
    // visibility bonus/penalty
    const vis = current.visibility || 10000;
    if (vis < 1000) score -= 2;
    else if (vis < 5000) score -= 1;
    
    return Math.max(0, Math.min(10, Math.round(score * 2) / 2)); // round to 0.5
}

// update day score display
function updateDayScore() {
    const score = calculateDayScore();
    const scoreBar = document.getElementById('scoreBar');
    const scoreText = document.getElementById('scoreText');
    
    scoreBar.style.width = (score * 10) + '%';
    scoreText.textContent = score + '/10';
    
    // color the score text based on value
    if (score >= 8) scoreText.style.color = '#6bcf7f';
    else if (score >= 5) scoreText.style.color = '#ffd93d';
    else scoreText.style.color = '#ff6b6b';
}

// show what its like rn where the user is at
function updateCurrentWeather() {
    const current = weatherData.current;
    const daily = weatherData.daily;
    const { desc, emoji } = getWeatherDescription(current.weather_code);

    document.getElementById('locationName').textContent = currentLocation.name;
    document.getElementById('temperature').textContent = useCelsius ? Math.round(current.temperature_2m) : cToF(current.temperature_2m);
    document.getElementById('weatherDesc').textContent = desc;
    document.getElementById('feelsLike').textContent = getDisplayTemp(current.apparent_temperature);
    document.getElementById('humidity').textContent = current.relative_humidity_2m + '%';
    document.getElementById('windSpeed').textContent = getDisplayWind(current.wind_speed_10m);
    document.getElementById('windDirection').textContent = getWindDirection(current.wind_direction_10m) + ' (' + Math.round(current.wind_direction_10m) + '°)';
    document.getElementById('pressure').textContent = Math.round(current.pressure_msl) + ' hPa';
    document.getElementById('cloudCover').textContent = current.cloud_cover + '%';
    document.getElementById('uvIndex').textContent = current.uv_index ? Math.round(current.uv_index * 10) / 10 : '--';
    document.getElementById('visibility').textContent = getDisplayVisibility(current.visibility);
    document.getElementById('rainChance').textContent = daily.precipitation_probability_max[0] + '%';
    document.getElementById('dewPoint').textContent = getDisplayTemp(calculateDewPoint(current.temperature_2m, current.relative_humidity_2m));
    
    // sunrise and sunset time
    const sunriseTime = new Date(daily.sunrise[0]);
    const sunsetTime = new Date(daily.sunset[0]);
    document.getElementById('sunrise').textContent = sunriseTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('sunset').textContent = sunsetTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const maxTemp = Math.round(daily.temperature_2m_max[0]);
    const minTemp = Math.round(daily.temperature_2m_min[0]);
    document.getElementById('tempRange').textContent = getDisplayTemp(maxTemp) + ' / ' + getDisplayTemp(minTemp);

    // the big emoji weather thing
    const iconDiv = document.getElementById('weatherIcon');
    iconDiv.textContent = emoji;

    // generate tips based on weather
    generateTips();
}

// break down the next 24 hours hour by hour (with rain chance baby)
function updateHourlyForecast() {
    const hourly = weatherData.hourly;
    const now = new Date(weatherData.current_time || new Date());
    
    let html = '';
    for (let i = 0; i < 24; i++) {
        const hourTime = new Date(now.getTime() + i * 60 * 60 * 1000);
        const hour = hourTime.getHours().toString().padStart(2, '0');
        const temp = useCelsius ? Math.round(hourly.temperature_2m[i]) : cToF(hourly.temperature_2m[i]);
        const code = hourly.weather_code[i];
        const icon = getWeatherIcon(code);
        const rainChance = hourly.precipitation_probability[i];

        html += `
            <div class="hourly-item">
                <div class="hourly-time">${hour}:00</div>
                <div class="hourly-icon">${icon}</div>
                <div class="hourly-temp">${temp}${useCelsius ? '°' : '°'}</div>
                <div class="hourly-rain" ${rainChance > 0 ? `style="color: #4ecdc4; font-size: 0.85em;"` : ''}>${rainChance > 0 ? rainChance + '% 💧' : ''}</div>
            </div>
        `;
    }
    hourlyForecastDiv.innerHTML = html;
}

// next 7 days prediction (spoiler: weather is weird)
function updateDailyForecast() {
    const daily = weatherData.daily;
    const timezone = weatherData.timezone || 'UTC';
    
    let html = '';
    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const maxTemp = useCelsius ? Math.round(daily.temperature_2m_max[i]) : cToF(daily.temperature_2m_max[i]);
        const minTemp = useCelsius ? Math.round(daily.temperature_2m_min[i]) : cToF(daily.temperature_2m_min[i]);
        const code = daily.weather_code[i];
        const icon = getWeatherIcon(code);
        const rainChance = daily.precipitation_probability_max[i];

        html += `
            <div class="daily-item">
                <div class="daily-date">${dayName}<br>${monthDay}</div>
                <div class="daily-icon">${icon}</div>
                <div class="daily-temps">
                    <span class="daily-max">${maxTemp}${useCelsius ? '°' : '°'}</span>
                    <span class="daily-min">${minTemp}${useCelsius ? '°' : '°'}</span>
                </div>
                ${rainChance > 0 ? `<div class="daily-rain">💧 ${rainChance}%</div>` : ''}
            </div>
        `;
    }
    dailyForecastDiv.innerHTML = html;
}

// generate some helpful tips based on weather (or just roast the conditions lol)
function generateTips() {
    const current = weatherData.current;
    const daily = weatherData.daily;
    const tips = [];

    // temperature tips
    if (current.temperature_2m > 30) {
        tips.push({ emoji: '☀️', tip: 'its hot out, drink water or u gonna regret it' });
    } else if (current.temperature_2m < 0) {
        tips.push({ emoji: '❄️', tip: 'cold af, bundle up unless u like being a popsicle' });
    } else if (current.temperature_2m > 20) {
        tips.push({ emoji: '😎', tip: 'nice weather, go outside for real' });
    }

    // rain tips
    if (daily.precipitation_probability_max[0] > 70) {
        tips.push({ emoji: '☔', tip: 'bring an umbrella unless u wanna be a wet noodle' });
    }

    // wind tips
    if (current.wind_speed_10m > 30) {
        tips.push({ emoji: '💨', tip: 'its windy af, hold onto ur hat. and ur dignity.' });
    } else if (current.wind_speed_10m > 15) {
        tips.push({ emoji: '🌬️', tip: 'breeze is pretty strong, fair warning' });
    }

    // uv tips
    if (current.uv_index > 6) {
        tips.push({ emoji: '🧴', tip: 'uv index is brutal, sunscreen or look like a lobster later' });
    } else if (current.uv_index > 3) {
        tips.push({ emoji: '😎', tip: 'sunscreen not a bad idea if ur outside for a bit' });
    }

    // humidity tips
    if (current.relative_humidity_2m > 80) {
        tips.push({ emoji: '💦', tip: 'humidity is insane, ur gonna be sweaty just existing' });
    }

    // visibility tips
    if (current.visibility < 1000) {
        tips.push({ emoji: '🌫️', tip: 'visibility is bad, drive careful or smack into something' });
    }

    // default tips if none generated
    if (tips.length === 0) {
        tips.push({ emoji: '🤷', tip: 'nothing terrible out there, guess its a normal day' });
    }

    // render the tips
    const tipsContainer = document.getElementById('tipsContainer');
    tipsContainer.innerHTML = tips.map(t => `
        <div class="tip-card">
            <span class="tip-emoji">${t.emoji}</span>
            <span class="tip-text">${t.tip}</span>
        </div>
    `).join('');
}

// keep the time up to date (duh)
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('currentTime').textContent = `${dateString} • ${timeString}`;
}

// make the time show up rn
updateCurrentTime();

// just fetch weather data lol, uses open-meteo cause its free and they don't make u deal w api keys
const API_BASE = 'https://api.open-meteo.com/v1';
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1';

// keeping track of stuff
let currentLocation = { lat: 0, lon: 0, name: 'Unknown' };
let weatherData = null;
let searchTimeout;

// grab all the things from the html so we can poke them
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const refreshBtn = document.getElementById('refreshBtn');
const themeBtn = document.getElementById('themeBtn');
const favBtn = document.getElementById('favBtn');
const suggestionsDiv = document.getElementById('suggestions');
const currentWeatherDiv = document.getElementById('currentWeather');
const hourlyForecastDiv = document.getElementById('hourlyForecast');
const dailyForecastDiv = document.getElementById('dailyForecast');
const alertsContainer = document.getElementById('alertsContainer');
const favoritesContainer = document.getElementById('favoritesContainer');

// local storage keys (save stuff so the app remembers u)
const FAVORITES_KEY = 'weather_favorites';
const THEME_KEY = 'weather_theme';
let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
let isDarkMode = localStorage.getItem(THEME_KEY) === 'dark';

// fun easter eggs and stuff
const easterEggs = [
    { trigger: 'london', message: 'london. yeah, it\'s raining' },
    { trigger: 'las vegas', message: 'desert vibes, literally no rain' },
    { trigger: 'alaska', message: 'that\'s some cold weather' },
    { trigger: 'dubai', message: 'it\'s hot enough to fry an egg out there' },
    { trigger: 'iceland', message: 'cold and hot at the same time, somehow' },
    { trigger: 'seattle', message: 'coffee and rain, the seattle experience' }
];

// haptic feedback visual effect (we cant actually vibrate ur phone from web lol)
function hapticFeedback(element) {
    element.style.transform = 'scale(0.98)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 50);
}

// toggle between light and dark mode (its called preference but we know ur just following the vibe)
function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
    applyTheme();
    themeBtn.style.animation = 'subtleRotate 0.6s ease-in-out';
    setTimeout(() => { themeBtn.style.animation = 'none'; }, 600);
}

// apply the theme (light or dark, ur choice bestie)
function applyTheme() {
    if (isDarkMode) {
        document.documentElement.style.colorScheme = 'dark';
        themeBtn.textContent = 'light';
        document.body.style.filter = 'invert(0.9) hue-rotate(180deg)';
    } else {
        document.documentElement.style.colorScheme = 'light';
        themeBtn.textContent = 'dark';
        document.body.style.filter = 'none';
    }
}

// refresh weather data (sometimes things need a fresh start)
function refreshWeather() {
    refreshBtn.style.animation = 'subtleRotate 0.8s ease-in-out';
    fetchWeather(currentLocation.lat, currentLocation.lon);
    setTimeout(() => { refreshBtn.style.animation = 'none'; }, 800);
}

// save current location as a favorite (so u can find it again)
function toggleFavorite() {
    const isFavorited = favorites.some(fav => 
        fav.lat === currentLocation.lat && fav.lon === currentLocation.lon
    );
    
    if (isFavorited) {
        favorites = favorites.filter(fav => 
            !(fav.lat === currentLocation.lat && fav.lon === currentLocation.lon)
        );
        favBtn.textContent = 'save';
        showEasterEggMessage('removed from saved');
    } else {
        favorites.push({
            name: currentLocation.name,
            lat: currentLocation.lat,
            lon: currentLocation.lon
        });
        favBtn.textContent = 'saved';
        showEasterEggMessage('added to saved');
    }
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    loadFavorites();
}

// check if location is favorited and update button
function updateFavButton() {
    const isFavorited = favorites.some(fav => 
        fav.lat === currentLocation.lat && fav.lon === currentLocation.lon
    );
    favBtn.textContent = isFavorited ? 'saved' : 'save';
}

// load and display favorite locations
function loadFavorites() {
    if (favorites.length === 0) {
        favoritesContainer.innerHTML = '';
        return;
    }
    
    let html = '<div class="fav-label">ur faves</div><div class="fav-list">';
    favorites.forEach(fav => {
        html += `
            <button class="fav-item" onclick="fetchWeatherForFavorite('${fav.lat}', '${fav.lon}', '${fav.name}')">
                ${fav.name.split(',')[0]}
            </button>
        `;
    });
    html += '</div>';
    favoritesContainer.innerHTML = html;
}

// load weather for a favorited location
function fetchWeatherForFavorite(lat, lon, name) {
    currentLocation = {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        name: name
    };
    searchInput.value = '';
    suggestionsDiv.classList.remove('show');
    fetchWeather(currentLocation.lat, currentLocation.lon);
}

// keyboard shortcuts (power user moves)
function handleKeyboardShortcuts(e) {
    // R to refresh
    if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) {
        if (document.activeElement === searchInput) return;
        refreshWeather();
    }
    // T to toggle theme
    if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.metaKey) {
        if (document.activeElement === searchInput) return;
        toggleTheme();
    }
    // S to save location
    if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.metaKey) {
        if (document.activeElement === searchInput) return;
        toggleFavorite();
    }
    // Escape to clear search suggestions
    if (e.key === 'Escape') {
        suggestionsDiv.classList.remove('show');
    }
}

// start it up when the page loads
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    getLocationAndWeather();
    showFirstTimeHint();
});

// ok so when the user does stuff, do things
function setupEventListeners() {
    searchBtn.addEventListener('click', () => {
        hapticFeedback(searchBtn);
        searchWeather();
    });
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            hapticFeedback(searchInput);
            searchWeather();
        }
    });
    searchInput.addEventListener('input', handleSearchInput);
    locationBtn.addEventListener('click', () => {
        hapticFeedback(locationBtn);
        getCurrentLocationWeather();
    });
    
    // new buttons
    refreshBtn.addEventListener('click', () => {
        hapticFeedback(refreshBtn);
        refreshWeather();
    });
    
    themeBtn.addEventListener('click', () => {
        hapticFeedback(themeBtn);
        toggleTheme();
    });
    
    favBtn.addEventListener('click', () => {
        hapticFeedback(favBtn);
        toggleFavorite();
    });

    // fun easter eggs on location name
    currentWeatherDiv.addEventListener('click', checkLocationEasterEgg);
    
    // keyboard shortcuts (because we're fancy like that)
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // load theme preference
    applyTheme();
    loadFavorites();
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
            checkLocationEasterEgg();
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
        checkWeatherAlerts();
        
        // update time display every minute (keep it fresh)
        setInterval(updateCurrentTime, 60000);
    } catch (error) {
        console.error('weather fetch went boom:', error);
        alert('couldnt get weather data rn');
    }
}

// easter egg checker (if the city name matches, we roast it lol)
function checkLocationEasterEgg() {
    const cityLower = currentLocation.name.toLowerCase();
    const egg = easterEggs.find(e => cityLower.includes(e.trigger));
    
    if (egg) {
        showEasterEggMessage(egg.message);
    }
}

// show easter egg message with fun animation (pops up real quick)
function showEasterEggMessage(message) {
    const existingMsg = document.querySelector('.easter-egg-msg');
    if (existingMsg) existingMsg.remove();
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'easter-egg-msg';
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%) scale(0);
        background: linear-gradient(135deg, var(--accent), #4ecdc4);
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: springPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    `;
    document.body.appendChild(msgDiv);
    
    // yeet it after 3 seconds
    setTimeout(() => {
        msgDiv.style.animation = 'fadeOut 0.4s ease-out forwards';
        setTimeout(() => msgDiv.remove(), 400);
    }, 3000);
}

// fun weather reactions (click the weather icon for easter eggs)
function showWeatherReaction(temp, desc) {
    const reactions = {
        cold: ['that\'s cold', 'yikes', 'nope'],
        hot: ['it\'s hot out', 'help', 'rip'],
        rainy: ['cozy vibes?', 'soup weather', 'imagine going outside'],
        sunny: ['touch some grass', 'nice day', 'perfect'],
        normal: ['nothing crazy', 'mid weather', 'it\'s fine']
    };
    
    let reaction = reactions.normal;
    if (temp < 0) reaction = reactions.cold;
    else if (temp > 30) reaction = reactions.hot;
    else if (desc.toLowerCase().includes('rain') || desc.toLowerCase().includes('drizzle')) reaction = reactions.rainy;
    else if (desc.toLowerCase().includes('clear') || desc.toLowerCase().includes('sunny')) reaction = reactions.sunny;
    
    const randomReaction = reaction[Math.floor(Math.random() * reaction.length)];
    showEasterEggMessage(randomReaction);
}

// celebrate when the day is perfect (nice weather = nice time)
function celebrateVibes(vibe) {
    if (vibe >= 9) {
        createConfetti();
        showEasterEggMessage('perfect day ahead');
    } else if (vibe >= 7) {
        showEasterEggMessage('pretty nice weather');
    }
}

// create a subtle confetti effect when the weather is perfect
function createConfetti() {
    const confettiPieces = 30;
    for (let i = 0; i < confettiPieces; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${getRandomConfettiColor()};
                left: ${Math.random() * 100}vw;
                top: -10px;
                pointer-events: none;
                z-index: 1000;
                border-radius: 50%;
                animation: fallConfetti ${2 + Math.random() * 2}s ease-in forwards;
            `;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

// random confetti colors (pretty vibes)
function getRandomConfettiColor() {
    const colors = ['#4ecdc4', '#ff6b6b', '#ffd93d', '#6bcf7f', '#a8e6cf'];
    return colors[Math.floor(Math.random() * colors.length)];
}
// show keyboard shortcuts hint (only once per session, chill out)
function showFirstTimeHint() {
    if (sessionStorage.getItem('weather_hint_shown')) return;
    
    setTimeout(() => {
        showEasterEggMessage('tip: press R to refresh, T for theme, S to save locations');
        sessionStorage.setItem('weather_hint_shown', 'true');
    }, 1500);
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

// show what its like rn where the user is at
function updateCurrentWeather() {
    const current = weatherData.current;
    const daily = weatherData.daily;
    const { desc, emoji } = getWeatherDescription(current.weather_code);

    document.getElementById('locationName').textContent = currentLocation.name;
    document.getElementById('temperature').textContent = Math.round(current.temperature_2m);
    document.getElementById('weatherDesc').textContent = desc;
    document.getElementById('feelsLike').textContent = Math.round(current.apparent_temperature) + '°C';
    document.getElementById('humidity').textContent = current.relative_humidity_2m + '%';
    document.getElementById('windSpeed').textContent = Math.round(current.wind_speed_10m) + ' km/h';
    document.getElementById('windDirection').textContent = getWindDirection(current.wind_direction_10m) + ' (' + Math.round(current.wind_direction_10m) + '°)';
    document.getElementById('pressure').textContent = Math.round(current.pressure_msl) + ' hPa';
    document.getElementById('cloudCover').textContent = current.cloud_cover + '%';
    document.getElementById('uvIndex').textContent = current.uv_index ? Math.round(current.uv_index * 10) / 10 : '--';
    document.getElementById('visibility').textContent = (current.visibility / 1000).toFixed(1) + ' km';
    document.getElementById('rainChance').textContent = daily.precipitation_probability_max[0] + '%';
    document.getElementById('dewPoint').textContent = calculateDewPoint(current.temperature_2m, current.relative_humidity_2m) + '°C';
    
    // sunrise and sunset time
    const sunriseTime = new Date(daily.sunrise[0]);
    const sunsetTime = new Date(daily.sunset[0]);
    document.getElementById('sunrise').textContent = sunriseTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('sunset').textContent = sunsetTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const maxTemp = Math.round(daily.temperature_2m_max[0]);
    const minTemp = Math.round(daily.temperature_2m_min[0]);
    document.getElementById('tempRange').textContent = `${maxTemp}° / ${minTemp}°`;

    // the big emoji weather thing (make it clickable for fun)
    const iconDiv = document.getElementById('weatherIcon');
    iconDiv.textContent = emoji;
    iconDiv.style.fontSize = '60px';
    iconDiv.style.cursor = 'pointer';
    iconDiv.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    iconDiv.addEventListener('click', () => {
        iconDiv.style.animation = 'subtleRotate 0.6s ease-in-out';
        showWeatherReaction(current.temperature_2m, desc);
        setTimeout(() => { iconDiv.style.animation = 'none'; }, 600);
    });

    // calculate and show the day vibe score (0-10, based on how nice the weather is)
    const dayVibe = calculateDayVibe(current, daily);
    const vibe = Math.round(dayVibe);
    const vibePercent = (dayVibe / 10) * 100;
    document.getElementById('scoreBar').style.width = vibePercent + '%';
    document.getElementById('scoreText').textContent = vibe + '/10';

    // celebrate if the vibes are immaculate
    celebrateVibes(vibe);

    // check if this location is a favorite
    updateFavButton();
    
    // generate tips based on weather
    generateTips();
}

// calculate how vibes the day is (science of vibes tbh)
function calculateDayVibe(current, daily) {
    let vibe = 5; // baseline, ur not vibing but not falling apart either
    
    // temp is perfect for vibes? (fun fact : 18-24°C is the sweet spot btw )
    const temp = current.temperature_2m;
    if (temp >= 18 && temp <= 24) vibe += 2;
    else if (temp >= 15 && temp <= 27) vibe += 1;
    else if (temp < 0 || temp > 35) vibe -= 1.5;
    
    // clear skies slap
    if (current.weather_code === 0) vibe += 1.5;
    else if (current.weather_code === 1 || current.weather_code === 2) vibe += 0.5;
    else if (current.weather_code >= 80) vibe -= 1;
    
    // too windy = not vibing
    if (current.wind_speed_10m > 40) vibe -= 1.5;
    else if (current.wind_speed_10m > 25) vibe -= 0.5;
    
    // rain chance (best weather idc what anyone says)
    if (daily.precipitation_probability_max[0] > 80) vibe -= 2;
    else if (daily.precipitation_probability_max[0] > 50) vibe -= 1;
    
    // extreme uv = :(
    if (current.uv_index > 8) vibe -= 0.5;
    
    // clamp that vibe score to 0-10
    return Math.max(0, Math.min(10, vibe));
}

// break down the next 24 hours hour by hour (with rain chance baby ofc)
function updateHourlyForecast() {
    const hourly = weatherData.hourly;
    const now = new Date(weatherData.current_time || new Date());
    
    let html = '';
    for (let i = 0; i < 24; i++) {
        const hourTime = new Date(now.getTime() + i * 60 * 60 * 1000);
        const hour = hourTime.getHours().toString().padStart(2, '0');
        const temp = Math.round(hourly.temperature_2m[i]);
        const code = hourly.weather_code[i];
        const icon = getWeatherIcon(code);
        const rainChance = hourly.precipitation_probability[i];
        const humidity = hourly.relative_humidity_2m[i];

        html += `
            <div class="hourly-item" onclick="showHourlyDetail(${i}, '${hour}:00', ${temp}, ${rainChance}, ${humidity}, '${getWeatherDescription(code).desc}')">
                <div class="hourly-time">${hour}:00</div>
                <div class="hourly-icon">${icon}</div>
                <div class="hourly-temp">${temp}°</div>
                <div class="hourly-rain" ${rainChance > 0 ? `style="color: #4ecdc4; font-size: 0.85em;"` : ''}>${rainChance > 0 ? rainChance + '% 💧' : ''}</div>
            </div>
        `;
    }
    hourlyForecastDiv.innerHTML = html;
}

// show detailed info when clicking hourly item (iOS-style detail view)
function showHourlyDetail(index, time, temp, rain, humidity, desc) {
    const details = `
        <div class="hourly-detail-popup">
            <div class="detail-popup-header">${time}</div>
            <div class="detail-popup-content">
                <div class="detail-row">
                    <span class="detail-label">temperature</span>
                    <span class="detail-value">${temp}°C</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">condition</span>
                    <span class="detail-value">${desc}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">rain chance</span>
                    <span class="detail-value">${rain}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">humidity</span>
                    <span class="detail-value">${humidity}%</span>
                </div>
            </div>
        </div>
    `;
    showDetailPopup(details);
}

// show a popup with weather details (modal style)
function showDetailPopup(content) {
    const existing = document.querySelector('.detail-popup-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'detail-popup-overlay';
    overlay.innerHTML = `
        <div class="detail-popup-container">
            ${content}
            <button class="detail-popup-close" onclick="this.closest('.detail-popup-overlay').remove()">✕</button>
        </div>
    `;
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

// next 7 days prediction (spoiler: weather is weird, so dont trust it too much, but its fun to look at, and it gives u a general idea ,so dont be mad if it says sunny and it rains, ok? thats not my fault blame the weather gods)
function updateDailyForecast() {
    const daily = weatherData.daily;
    const timezone = weatherData.timezone || 'UTC';
    
    let html = '';
    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const code = daily.weather_code[i];
        const icon = getWeatherIcon(code);
        const rainChance = daily.precipitation_probability_max[i];
        const { desc } = getWeatherDescription(code);

        html += `
            <div class="daily-item" onclick="showDailyDetail(${i}, '${dayName} ${monthDay}', ${maxTemp}, ${minTemp}, ${rainChance}, '${desc}')">
                <div class="daily-date">${dayName}<br>${monthDay}</div>
                <div class="daily-icon">${icon}</div>
                <div class="daily-temps">
                    <span class="daily-max">${maxTemp}°</span>
                    <span class="daily-min">${minTemp}°</span>
                </div>
                ${rainChance > 0 ? `<div class="daily-rain">💧 ${rainChance}%</div>` : ''}
            </div>
        `;
    }
    dailyForecastDiv.innerHTML = html;
}

// show detailed forecast day info (click a day card to see more)
function showDailyDetail(index, date, high, low, rainChance, desc) {
    const details = `
        <div class="hourly-detail-popup">
            <div class="detail-popup-header">${date}</div>
            <div class="detail-popup-content">
                <div class="detail-row">
                    <span class="detail-label">high temp</span>
                    <span class="detail-value">${high}°C</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">low temp</span>
                    <span class="detail-value">${low}°C</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">condition</span>
                    <span class="detail-value">${desc}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">rain chance</span>
                    <span class="detail-value">${rainChance}%</span>
                </div>
            </div>
        </div>
    `;
    showDetailPopup(details);
}

// generate some helpful tips based on weather (or just roast the conditions lol)
function generateTips() {
    const current = weatherData.current;
    const daily = weatherData.daily;
    const tips = [];

    // temperature tips, and no the tips are not in celsius, they are in the language of the people (aka english) also, yes, i know the temp is in celsius, but the tips are in english, so deal with it. and no the emojies are not ai
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

// update the time display with current date and time (yeah its separate for a reason)
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

// check if theres any extreme weather stuff that needs a warning (ur mom should know this)
function checkWeatherAlerts() {
    const current = weatherData.current;
    const daily = weatherData.daily;
    const alerts = [];

    // EXTREME COLD - ur gonna freeze
    if (current.temperature_2m < -10) {
        alerts.push({
            level: 'danger',
            emoji: '❄️',
            title: 'EXTREME COLD WARNING',
            message: 'its BRUTAL out there, frostbite risk fr fr'
        });
    }

    // EXTREME HEAT - its hot girl summer but make it dangerous
    if (current.temperature_2m > 40) {
        alerts.push({
            level: 'danger',
            emoji: '🔥',
            title: 'EXTREME HEAT WARNING',
            message: 'its literally cooking, heat exhaustion is real'
        });
    }

    // SEVERE STORM - run indoors lol
    if (current.weather_code >= 95 && current.weather_code <= 99) {
        alerts.push({
            level: 'danger',
            emoji: '⛈️',
            title: 'SEVERE THUNDERSTORM WARNING',
            message: 'theres literal lightning happening, maybe stay inside'
        });
    }

    // HEAVY RAIN - ur gonna get soaked, but hey its fun, just dont get struck by lightning
    if (daily.precipitation_probability_max[0] > 90) {
        alerts.push({
            level: 'warning',
            emoji: '🌧️',
            title: 'HEAVY RAIN EXPECTED',
            message: 'pack an umbrella or accept ur fate'
        });
    }

    // EXTREME WIND - hold onto ur hat fr fr
    if (current.wind_speed_10m > 50) {
        alerts.push({
            level: 'danger',
            emoji: '🌪️',
            title: 'EXTREME WIND WARNING',
            message: 'wind is crazy, secure anything that isnt bolted down'
        });
    }

    // BRUTAL UV - sunburn speedrun, 10/10 would not recommend
    if (current.uv_index > 10) {
        alerts.push({
            level: 'warning',
            emoji: '☀️',
            title: 'EXTREME UV INDEX',
            message: 'uv is absolutely bonkers, ur gonna burn in like 5 mins'
        });
    }

    // render the alerts if there are any, otherwise clear the alerts container
    const alertsContainer = document.getElementById('alertsContainer');
    if (alerts.length > 0) {
        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert alert-${alert.level}">
                <div class="alert-title">${alert.emoji} ${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
            </div>
        `).join('');
    } else {
        alertsContainer.innerHTML = '';
    }
}

// call the alerts check after updating weather
// this gets added to the fetchWeather function callback

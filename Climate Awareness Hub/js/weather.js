// Weather page logic - only runs when #weather-app exists
(function () {
  const app = document.getElementById('weather-app');
  if (!app) return;

  const API_KEY = 'e2992a2811451459607a491a65d17dae'; // <-- inserted API key
  const el = {
    location: document.getElementById('w-location'),
    icon: document.getElementById('w-icon'),
    temp: document.getElementById('w-temp'),
    condition: document.getElementById('w-condition'),
    humidity: document.getElementById('w-humidity'),
    wind: document.getElementById('w-wind'),
    alert: document.getElementById('alert'),
    display: document.getElementById('weather-display'),
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    detectBtn: document.getElementById('detect-btn')
  };

  function setAlert(msg) {
    if (!el.alert) return;
    el.alert.textContent = msg;
    el.alert.classList.remove('hidden');
  }
  function clearAlert() {
    if (!el.alert) return;
    el.alert.classList.add('hidden');
    el.alert.textContent = '';
  }

  function mapToIconAndBg(weather) {
    const id = weather.id;
    const icon = weather.icon || '';
    // simple icon mapping
    let emoji = '🌤️', bg = 'bg-sunny';
    if (id >= 200 && id < 600) { emoji = '🌧️'; bg = 'bg-rainy'; }
    else if (id >= 600 && id < 700) { emoji = '❄️'; bg = 'bg-cloudy'; }
    else if (id >= 700 && id < 800) { emoji = '🌫️'; bg = 'bg-cloudy'; }
    else if (id === 800) { emoji = icon.includes('n') ? '🌙' : '☀️'; bg = icon.includes('n') ? 'bg-night' : 'bg-sunny'; }
    else if (id > 800) { emoji = '☁️'; bg = 'bg-cloudy'; }
    return { emoji, bg };
  }

  function setBackground(bgClass) {
    document.body.classList.remove('bg-sunny', 'bg-rainy', 'bg-cloudy', 'bg-night');
    if (bgClass) document.body.classList.add(bgClass);
  }

  async function fetchByCoords(lat, lon) {
    try {
      clearAlert();
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather fetch failed');
      const data = await res.json();
      renderWeather(data);
    } catch (err) {
      setAlert('Unable to fetch weather. Check API key and network.');
      console.error(err);
    }
  }

  async function fetchByCity(city) {
    if (!city) return;
    try {
      clearAlert();
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('City not found');
      const data = await res.json();
      renderWeather(data);
    } catch (err) {
      setAlert('City not found or API error.');
      console.error(err);
    }
  }

  function renderWeather(data) {
    const w = data.weather && data.weather[0] ? data.weather[0] : {};
    const main = data.main || {};
    const wind = data.wind || {};
    el.location.textContent = `${data.name}, ${data.sys && data.sys.country ? data.sys.country : ''}`;
    el.icon.textContent = mapToIconAndBg({ id: w.id, icon: w.icon }).emoji;
    el.temp.textContent = `${Math.round(main.temp)}°C`;
    el.condition.textContent = `${w.main || '—'} (${w.description || ''})`;
    el.humidity.textContent = `Humidity: ${main.humidity ?? '--'}%`;
    el.wind.textContent = `Wind: ${wind.speed ?? '--'} m/s`;

    // background and flood alert
    const { bg } = mapToIconAndBg({ id: w.id, icon: w.icon });
    setBackground(bg);

    // flood / heavy rain risk: if raining or thunderstorm or heavy wind
    const isRain = w.id >= 200 && w.id < 600;
    const strongWind = wind.speed && wind.speed > 12; // m/s approx storm
    if (isRain && (main.rain || main.humidity > 80 || strongWind)) {
      setAlert('Flood risk: heavy rain or conditions detected. Follow local guidance.');
    } else {
      clearAlert();
    }
  }

  // event handlers
  el.searchBtn?.addEventListener('click', () => fetchByCity(el.cityInput.value.trim()));
  el.cityInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchByCity(el.cityInput.value.trim()); });
  el.detectBtn?.addEventListener('click', () => {
    if (!navigator.geolocation) { setAlert('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition((pos) => {
      fetchByCoords(pos.coords.latitude, pos.coords.longitude);
    }, () => setAlert('Location permission denied.'));
  });

  // initial attempt to auto-detect
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      fetchByCoords(pos.coords.latitude, pos.coords.longitude);
    }, () => {
      // fallback: try fetch by IP-less or leave placeholder
      // no automatic fallback to avoid accidental API calls without key
    });
  }
})();
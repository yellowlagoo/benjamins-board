import { useState, useEffect, useCallback } from 'react';

const VAN_LAT = 49.253657;
const VAN_LONG = -123.164873;
const MTNVIEW_LAT = 37.389806;
const MTNVIEW_LONG = -122.093958;
const TENT_URL = (lat, long) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&temperature_unit=celsius&timezone=America/Los_Angeles`;

const API_URL = TENT_URL(MTNVIEW_LAT, MTNVIEW_LONG);
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
const GOLDEN_WINDOW = 30 * 60 * 1000; // 30 minutes around sunrise/sunset

const WMO_CODES = {
  0: 'Clear Sky',
  1: 'Mostly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Icy Fog',
  51: 'Light Drizzle',
  53: 'Drizzle',
  55: 'Heavy Drizzle',
  56: 'Freezing Drizzle',
  57: 'Heavy Freezing Drizzle',
  61: 'Light Rain',
  63: 'Rain',
  65: 'Heavy Rain',
  66: 'Freezing Rain',
  67: 'Heavy Freezing Rain',
  71: 'Light Snow',
  73: 'Snow',
  75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Light Showers',
  81: 'Showers',
  82: 'Heavy Showers',
  85: 'Light Snow Showers',
  86: 'Heavy Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm w/ Hail',
  99: 'Heavy Thunderstorm',
};

function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  });
}

// The API returns sunrise/sunset as "YYYY-MM-DDTHH:MM" in Pacific time
// (because timezone=America/Los_Angeles). Parse them with an explicit offset
// so the browser doesn't misinterpret them as UTC.
function parsePacific(isoString) {
  // Get the current Pacific offset (PST = -08:00, PDT = -07:00)
  const probe = new Date(isoString + 'Z'); // treat as UTC temporarily
  const pacificStr = probe.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const pacificDate = new Date(pacificStr);
  const offsetMs = probe.getTime() - pacificDate.getTime();
  // Apply offset: the isoString represents Pacific local time
  return new Date(new Date(isoString + 'Z').getTime() + offsetMs);
}

function formatSunTime(isoString) {
  const [, timePart] = isoString.split('T');
  const [hourStr, minuteStr] = timePart.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${minute} ${ampm}`;
}

function getWeatherTheme(now, sunrise, sunset, code) {
  const nowMs = now.getTime();
  const sunriseMs = sunrise.getTime();
  const sunsetMs = sunset.getTime();

  // Golden hour: within 30 min of sunrise or sunset
  if (
    Math.abs(nowMs - sunriseMs) <= GOLDEN_WINDOW ||
    Math.abs(nowMs - sunsetMs) <= GOLDEN_WINDOW
  ) {
    return 'golden';
  }

  // Night: before sunrise or after sunset
  if (nowMs < sunriseMs || nowMs > sunsetMs) {
    return 'night';
  }

  // Daytime: pick by weather code
  if (code <= 1) return 'clear';
  if (code <= 3 || code === 45 || code === 48) return 'cloudy';
  return 'rain';
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(false);

  const fetchWeather = useCallback(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed');
        return res.json();
      })
      .then((data) => {
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
          high: Math.round(data.daily.temperature_2m_max[0]),
          low: Math.round(data.daily.temperature_2m_min[0]),
          sunriseRaw: data.daily.sunrise[0],
          sunsetRaw: data.daily.sunset[0],
          sunrise: parsePacific(data.daily.sunrise[0]),
          sunset: parsePacific(data.daily.sunset[0]),
        });
        setLastUpdated(new Date());
        setError(false);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    fetchWeather();
    const id = setInterval(fetchWeather, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchWeather]);

  if (error && !weather) {
    return (
      <div className="weather-bg" data-theme="night">
        <p className="weather-title">Weather</p>
        <p className="weather-temp">unavailable</p>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="weather-bg" data-theme="night">
        <p className="weather-title">Weather</p>
        <p className="weather-temp">loading...</p>
      </div>
    );
  }

  const condition = WMO_CODES[weather.code] ?? 'Unknown';
  const theme = getWeatherTheme(new Date(), weather.sunrise, weather.sunset, weather.code);

  return (
    <div className="weather-bg" data-theme={theme}>
      <p className="weather-title">{condition}</p>
      <p className="weather-temp">
        {weather.temp}°C &nbsp; H:{weather.high} L:{weather.low}
      </p>
      <p className="weather-sun">
        ☀ {formatSunTime(weather.sunriseRaw)} &nbsp; ☽ {formatSunTime(weather.sunsetRaw)}
      </p>
      {lastUpdated && (
        <p className="weather-updated">Last updated: {formatTime(lastUpdated)}</p>
      )}
    </div>
  );
}

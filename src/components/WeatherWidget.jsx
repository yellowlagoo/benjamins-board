import { useState, useEffect } from 'react';

const API_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=49.253657&longitude=-123.164873&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=celsius&timezone=America/Los_Angeles';

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

function getWeatherMessage(code) {
  if (code <= 1) return 'e n j o y\nt h e\ns u n s h i n e';
  if (code <= 3) return 'a\nc l o u d y\nd a y';
  if (code <= 48) return 'i t s\na\nb i t\nf o g g y';
  if (code <= 67) return 'w e a r\na\nj a c k e t\nm y\nl o v e';
  if (code <= 86) return 'b u n d l e\nu p\nm y\nl o v e';
  return 'w e a r\na\nj a c k e t\nm y\nl o v e';
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
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
        });
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <>
        <p className="weather-title">Weather</p>
        <p className="weather-temp">unavailable</p>
      </>
    );
  }

  if (!weather) {
    return (
      <>
        <p className="weather-title">Weather</p>
        <p className="weather-temp">loading...</p>
      </>
    );
  }

  const condition = WMO_CODES[weather.code] ?? 'Unknown';

  return (
    <>
      <p className="weather-title">{condition}</p>
      <p className="weather-temp">
        {weather.temp}°C &nbsp; H:{weather.high} L:{weather.low}
      </p>
      <p className="weather-message">{getWeatherMessage(weather.code)}</p>
    </>
  );
}

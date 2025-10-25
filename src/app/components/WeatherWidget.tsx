import { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Wind, Zap } from 'lucide-react';

export type WeatherInfo = {
  temperature: number;
  windspeed: number;
  weathercode: number;
};

type WeatherWidgetProps = {
  location: string;
  latitude: number;
  longitude: number;
  onWeatherChange?: (weather: WeatherInfo | null) => void;
};

export default function WeatherWidget({ location, latitude, longitude, onWeatherChange }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        if (!res.ok) throw new Error('Weather fetch failed');
        const data = await res.json();
        setWeather(data.current_weather);
        onWeatherChange?.(data.current_weather);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError('Weather unavailable');
        onWeatherChange?.(null);
        setIsLoading(false);
      }
    }
    fetchWeather();
  }, [latitude, longitude]);

  const weatherCodes: Record<number, string> = {
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
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="w-12 h-12" />;
    if (code === 2 || code === 3) return <Cloud className="w-12 h-12" />;
    if (code >= 51 && code <= 57) return <CloudDrizzle className="w-12 h-12" />;
    if (code >= 61 && code <= 67) return <CloudRain className="w-12 h-12" />;
    if (code >= 71 && code <= 86) return <CloudSnow className="w-12 h-12" />;
    if (code >= 95) return <Zap className="w-12 h-12" />;
    return <Cloud className="w-12 h-12" />;
  };

  const getWeatherGradient = (code: number) => {
    if (code === 0 || code === 1) return 'from-amber-400 via-orange-400 to-pink-500';
    if (code === 2 || code === 3) return 'from-slate-400 via-slate-500 to-slate-600';
    if (code >= 51 && code <= 67) return 'from-blue-400 via-blue-500 to-indigo-600';
    if (code >= 71 && code <= 86) return 'from-cyan-300 via-blue-400 to-indigo-500';
    if (code >= 95) return 'from-purple-500 via-violet-600 to-indigo-700';
    return 'from-slate-400 via-slate-500 to-slate-600';
  };

  if (error) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-xl border border-red-400/30 p-6 shadow-2xl">
        <div className="relative z-10">
          <p className="text-red-300 text-center font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !weather) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
          <p className="text-slate-300 animate-pulse">Loading weather...</p>
        </div>
      </div>
    );
  }

  const description = weatherCodes[weather.weathercode] || 'Unknown';
  const gradient = getWeatherGradient(weather.weathercode);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-white/10 p-8 shadow-2xl transition-all duration-500 hover:shadow-3xl ">
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 animate-pulse`}></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-2 h-2 bg-white/20 rounded-full top-1/4 left-1/4 animate-ping"></div>
        <div className="absolute w-2 h-2 bg-white/20 rounded-full top-3/4 left-3/4 animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-2 h-2 bg-white/20 rounded-full top-1/2 left-1/2 animate-ping" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex items-center gap-6">
        {/* Weather icon with animation */}
        <div className={`text-white animate-bounce bg-gradient-to-br ${gradient} p-4 rounded-2xl shadow-lg`}>
          {getWeatherIcon(weather.weathercode)}
        </div>

        {/* Weather info */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">{location}</h3>
          <p className="text-slate-300 text-sm mb-2 capitalize">{description}</p>
          
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-white bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              {Math.round(weather.temperature)}°
            </span>
            <span className="text-2xl text-slate-400">C</span>
          </div>

          {/* Wind speed indicator */}
          <div className="flex items-center gap-2 mt-3 text-slate-300">
            <Wind className="w-4 h-4 animate-pulse" />
            <span className="text-sm">{Math.round(weather.windspeed)} km/h</span>
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-50`}></div>
    </div>
  );
}
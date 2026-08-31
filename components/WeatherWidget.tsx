// components/WeatherWidget.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  type LucideIcon,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  MapPin,
  Snowflake,
  Sparkles,
  SunMedium,
  Check,
  X,
  Navigation,
} from "lucide-react";

interface WeatherData {
  current: {
    temperature_2m: number;
    weather_code: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
  };
}

interface WeatherWidgetProps {
  initialWeatherData: WeatherData | null;
}

function weatherIcon(code: number) {
  if (code === 0) return { icon: SunMedium, label: "Clear Sky", color: "text-amber-500" };
  if ([1, 2, 3].includes(code)) return { icon: CloudSun, label: "Partly Cloudy", color: "text-zinc-500" };
  if ([45, 48].includes(code)) return { icon: CloudFog, label: "Foggy", color: "text-zinc-400" };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { icon: CloudRain, label: "Rainy", color: "text-blue-500" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: Snowflake, label: "Snow", color: "text-sky-400" };
  if ([95, 96, 99].includes(code)) return { icon: CloudLightning, label: "Thunderstorm", color: "text-purple-500" };
  return { icon: CloudSun, label: "Partly Cloudy", color: "text-zinc-500" };
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeatherWidget({ initialWeatherData }: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(initialWeatherData);
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState("Kumasi, Ashanti Region");
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(true);

  useEffect(() => {
    const permissionChoice = localStorage.getItem("agriboost_location_permission");
    if (!permissionChoice) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
        setHasPrompted(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (permissionChoice === "granted") {
      requestLocationWeather(true);
    }
  }, []);

  const requestLocationWeather = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) alert("Geolocation is not supported by your browser.");
      return;
    }

    if (!silent) setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        localStorage.setItem("agriboost_location_permission", "granted");
        setShowPrompt(false);
        setHasPrompted(true);

        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=5`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to fetch location weather");
          const data = await res.json();
          setWeatherData(data);

          const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`;
          const geoRes = await fetch(geoUrl, {
            headers: {
              "User-Agent": "AgriBoostApp/1.0",
            },
          });
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const city = geoData.address.city || geoData.address.town || geoData.address.suburb || geoData.address.county || "Local Area";
            const state = geoData.address.state || geoData.address.region || "";
            setLocationName(`${city}${state ? ", " + state : ""}`);
          } else {
            setLocationName("Current Farm Location");
          }
        } catch (error) {
          console.error("Error loading location weather:", error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        localStorage.setItem("agriboost_location_permission", "denied");
        setLoading(false);
        setShowPrompt(false);
        setHasPrompted(true);
        if (!silent && error.code === error.PERMISSION_DENIED) {
          alert("Location permission denied. Using default location.");
        }
      }
    );
  };

  const handleDeclinePrompt = () => {
    localStorage.setItem("agriboost_location_permission", "denied");
    setShowPrompt(false);
    setHasPrompted(true);
  };

  const currentWeather = weatherData?.current;
  const daily = weatherData?.daily;
  const weatherInfo = currentWeather ? weatherIcon(currentWeather.weather_code) : null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm relative overflow-hidden">
      {/* Location Prompt Banner */}
      {showPrompt && (
        <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm z-10 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-5 max-w-sm w-full shadow-lg border border-zinc-200 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2.5">
              <Navigation className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-zinc-900 text-sm">Check Local Farm Weather?</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              AgriBoost uses your location for hyper-local rainfall and temperature forecasts.
            </p>
            <div className="flex gap-2 w-full mt-4">
              <button
                onClick={handleDeclinePrompt}
                className="flex-1 py-1.5 px-3 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-md text-xs font-medium transition-colors"
              >
                Keep Default
              </button>
              <button
                onClick={() => requestLocationWeather(false)}
                className="flex-1 py-1.5 px-3 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1"
              >
                <Check className="h-3.5 w-3.5" /> Enable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-zinc-900">Weather Forecast</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-zinc-400" /> {locationName}
          </p>
        </div>

        {hasPrompted && (
          <button
            onClick={() => requestLocationWeather(false)}
            title="Refetch hyper-local weather"
            className="p-1.5 rounded-md border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 transition-colors"
            disabled={loading}
          >
            <Navigation className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-500 font-medium text-xs">
          <SunMedium className="h-6 w-6 text-amber-500 animate-spin" />
          <span>Updating local forecast...</span>
        </div>
      ) : currentWeather ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-md bg-zinc-50 border border-zinc-100">
            <div className="flex items-center gap-3.5">
              <div className="rounded-lg bg-white p-2.5 border border-zinc-200 shadow-2xs flex-shrink-0">
                {weatherInfo && <weatherInfo.icon className={`h-7 w-7 ${weatherInfo.color}`} />}
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-zinc-900 leading-none tabular-nums">
                  {currentWeather.temperature_2m}°C
                </p>
                <p className="text-xs text-zinc-500 font-medium mt-1">{weatherInfo?.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <CloudRain className="h-3.5 w-3.5 text-blue-500" />
                <span>Humidity: <strong className="text-zinc-700">{currentWeather.relative_humidity_2m}%</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                <span>Wind: <strong className="text-zinc-700">{currentWeather.wind_speed_10m} km/h</strong></span>
              </div>
            </div>
          </div>

          {daily && (
            <div className="grid grid-cols-5 gap-2">
              {daily.time.slice(0, 5).map((dateStr, i) => {
                const d = new Date(dateStr);
                const { icon: ForecastIcon, color: iconColor } = weatherIcon(daily.weather_code[i]);
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1 p-2 rounded-md border border-zinc-100 bg-white hover:bg-zinc-50 transition-colors text-center"
                  >
                    <p className="text-[11px] font-medium text-zinc-500">
                      {i === 0 ? "Today" : DAY_LABELS[d.getDay()]}
                    </p>
                    <ForecastIcon className={`h-4 w-4 my-0.5 ${iconColor}`} />
                    <p className="text-xs font-semibold text-zinc-900">
                      {Math.round(daily.temperature_2m_max[i])}°
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {Math.round(daily.temperature_2m_min[i])}°
                    </p>
                    {daily.precipitation_sum[i] > 0 && (
                      <p className="text-[9px] text-blue-600 font-medium">
                        {daily.precipitation_sum[i]}mm
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-zinc-400 gap-1.5">
          <CloudSun className="h-6 w-6" />
          <p className="text-xs">Weather data unavailable</p>
        </div>
      )}
    </div>
  );
}


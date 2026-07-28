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
  if (code === 0) return { icon: SunMedium, label: "Clear Sky" };
  if ([1, 2, 3].includes(code)) return { icon: CloudSun, label: "Partly Cloudy" };
  if ([45, 48].includes(code)) return { icon: CloudFog, label: "Foggy" };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { icon: CloudRain, label: "Rainy" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: Snowflake, label: "Snow" };
  if ([95, 96, 99].includes(code)) return { icon: CloudLightning, label: "Thunderstorm" };
  return { icon: CloudSun, label: "Partly Cloudy" };
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeatherWidget({ initialWeatherData }: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(initialWeatherData);
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState("Kumasi, Ashanti Region");
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(true); // Default true until mount

  useEffect(() => {
    // Check if user has already made a choice about location
    const permissionChoice = localStorage.getItem("agriboost_location_permission");
    if (!permissionChoice) {
      // Delay prompt slightly for better UX entry transition
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
          // Fetch accurate weather from open-meteo based on coordinates
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=5`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to fetch location weather");
          const data = await res.json();
          setWeatherData(data);

          // Reverse geocode to get a nice name (using free OpenStreetMap API)
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
    <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-5 relative overflow-hidden transition-all duration-300">
      
      {/* Location Prompt Banner (Prompt UI with premium glassmorphism) */}
      {showPrompt && (
        <div className="absolute inset-0 bg-emerald-900/10 backdrop-blur-md z-10 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white/95 rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-emerald-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
              <Navigation className="h-6 w-6 animate-pulse" />
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">Check Local Farm Weather?</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              AgriBoost can use your location to fetch hyper-local forecasts and crop care warnings.
            </p>
            <div className="flex gap-2.5 w-full mt-4">
              <button
                onClick={handleDeclinePrompt}
                className="flex-1 py-2 px-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-colors"
              >
                No, Keep Default
              </button>
              <button
                onClick={() => requestLocationWeather(false)}
                className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-xs font-semibold hover:from-emerald-600 hover:to-green-700 shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" /> Enable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weather Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <SunMedium className="h-4 w-4 text-amber-500" /> Weather Forecast
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {locationName}
          </p>
        </div>
        
        {/* Manual Geolocation Trigger Button */}
        {hasPrompted && (
          <button
            onClick={() => requestLocationWeather(false)}
            title="Refetch hyper-local weather"
            className="p-1.5 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
            disabled={loading}
          >
            <Navigation className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-emerald-600 font-bold text-sm animate-pulse">
          <SunMedium className="h-8 w-8 text-amber-500 animate-spin" />
          <span>Updating local forecast...</span>
        </div>
      ) : currentWeather ? (
        <>
          <div className="flex items-center gap-5 mb-5 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
            <div className="rounded-2xl bg-white/80 p-3 shadow-sm flex-shrink-0">
              {weatherInfo && <weatherInfo.icon className="h-8 w-8 text-sky-600" />}
            </div>
            <div>
              <p className="text-4xl font-extrabold text-gray-900 leading-none">
                {currentWeather.temperature_2m}°C
              </p>
              <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-2">
                <CloudRain className="h-4 w-4" /> Humidity: {currentWeather.relative_humidity_2m}% ·{" "}
                <Sparkles className="h-4 w-4" /> Wind: {currentWeather.wind_speed_10m} km/h
              </p>
            </div>
          </div>

          {daily && (
            <div className="grid grid-cols-5 gap-2">
              {daily.time.slice(0, 5).map((dateStr, i) => {
                const d = new Date(dateStr);
                const { icon: ForecastIcon } = weatherIcon(daily.weather_code[i]);
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/60 hover:bg-white transition-colors"
                  >
                    <p className="text-xs font-semibold text-gray-500">
                      {i === 0 ? "Today" : DAY_LABELS[d.getDay()]}
                    </p>
                    <ForecastIcon className="h-5 w-5 text-sky-600" />
                    <p className="text-xs font-bold text-gray-800">
                      {Math.round(daily.temperature_2m_max[i])}°
                    </p>
                    <p className="text-xs text-gray-400">
                      {Math.round(daily.temperature_2m_min[i])}°
                    </p>
                    {daily.precipitation_sum[i] > 0 && (
                      <p className="text-[10px] text-blue-500 font-medium">
                        {daily.precipitation_sum[i]}mm
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
          <CloudSun className="h-8 w-8" />
          <p className="text-sm font-medium">Weather data unavailable</p>
        </div>
      )}
    </div>
  );
}

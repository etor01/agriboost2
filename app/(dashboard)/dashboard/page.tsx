// app/(dashboard)/dashboard/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// --- ICONS ---
const SunIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const CloudIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
);
const CloudRainIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 9 20h9.5a4.5 4.5 0 0 0 .7-8.8z" />
    <path d="M16 14v6" />
    <path d="M12 16v6" />
    <path d="M8 14v6" />
  </svg>
);

// Weather code mapping
function getWeatherIcon(code) {
  if ([0].includes(code)) return <SunIcon className="h-10 w-10 text-yellow-500" />;
  if ([1, 2, 3].includes(code)) return <CloudIcon className="h-10 w-10 text-gray-500" />;
  if ([45, 48, 51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRainIcon className="h-10 w-10 text-blue-500" />;
  return <CloudIcon className="h-10 w-10 text-gray-400" />;
}

// --- Header Component ---
function DashboardHeader({ profile }) {
  return (
    <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {profile.full_name || 'Farmer'}!</h1>
        <p className="text-gray-500">Here&apos;s an overview of your farm today.</p>
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/marketplace/new" className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg shadow-md">
          + Create Listing
        </Link>
        <img
          src={profile.avatar_url || `https://i.pravatar.cc/150?u=${profile.id}`}
          alt="User profile"
          className="h-10 w-10 rounded-full object-cover"
        />
      </div>
    </header>
  );
}

// --- Fetch Live Weather ---
async function getWeatherData() {
  try {
    const lat = 6.6885;
    const lon = -1.6244;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error("Failed to fetch weather");
    return response.json();
  } catch (error) {
    console.error("Weather API Error:", error);
    return null;
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [profileRes, farmsRes, weatherData] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('farms').select('*').eq('user_id', user.id),
    getWeatherData()
  ]);

  const { data: profile } = profileRes;
  const { data: farms } = farmsRes;

  return (
    <>
      <DashboardHeader profile={profile} />
      <div className="space-y-8">
        {/* Weather Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Weather Forecast (Kumasi)</h2>
            {weatherData ? (
              <>
                <p className="text-gray-700 text-lg">Current: {weatherData.current.temperature_2m}°C</p>
                <p className="text-gray-500">
                  Max Today: {weatherData.daily.temperature_2m_max[0]}°C / Min: {weatherData.daily.temperature_2m_min[0]}°C
                </p>
              </>
            ) : (
              <p>Could not load live weather data.</p>
            )}
          </div>
          {weatherData && getWeatherIcon(weatherData.current.weather_code)}
        </div>

        {/* My Farms Section (unchanged) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">My Farms</h2>
            <Link href="/profile" className="text-sm font-medium text-green-600 hover:underline">
              Manage All
            </Link>
          </div>
          {farms && farms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farms.map((farm) => (
                <Link href={`/farm/${farm.id}`} key={farm.id}>
                  <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all h-full">
                    <h3 className="font-bold text-lg text-gray-900">{farm.name}</h3>
                    <p className="text-sm text-gray-500">{farm.location}</p>
                    <p className="text-sm text-gray-500 mt-1">{farm.size_in_acres} Acres</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-white rounded-xl shadow-sm text-center">
              <p className="text-gray-600">You haven&apos;t added any farms yet.</p>
              <Link
                href="/profile"
                className="mt-4 inline-block text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-6 py-2.5 rounded-lg shadow-md"
              >
                Add Your First Farm
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

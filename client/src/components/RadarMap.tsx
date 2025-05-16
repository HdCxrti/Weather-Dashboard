import { useEffect, useState, useRef } from "react";
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCurrentWeather } from "@/lib/api";
import HourlyForecast, { HourlyForecastItem } from "@/components/HourlyForecast";

const RAINVIEWER_TILE_URL =
  "https://tilecache.rainviewer.com/v2/radar/nowcast/{z}/{x}/{y}/2/1_1.png";

const MapContainer: any = LeafletMapContainer;

// Mock city coordinates for demonstration
const CITY_COORDS: Record<string, [number, number]> = {
  "New York": [40.7128, -74.006],
  "Seattle": [47.6062, -122.3321],
  "Munich": [48.1351, 11.582],
  "Paris": [48.8566, 2.3522],
  "Istanbul": [41.0082, 28.9784],
  "Dubai": [25.2048, 55.2708],
  "Miami": [25.7617, -80.1918],
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// Geocode a city name using OpenStreetMap Nominatim, with sessionStorage caching, prefer US if available
// Returns { coords: [lat, lon], country, state, displayName }
async function geocodeCity(city: string): Promise<
  | { coords: [number, number]; country: string; state?: string; displayName: string }
  | null
> {
  const cacheKey = `geocode_${city.toLowerCase()}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      const obj = JSON.parse(cached);
      if (
        obj &&
        Array.isArray(obj.coords) &&
        obj.coords.length === 2 &&
        typeof obj.country === "string"
      )
        return obj;
    } catch {}
  }
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
  try {
    const resp = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await resp.json();
    if (data && data.length > 0) {
      // Prefer US result if available
      const usResult = data.find((item: any) =>
        item.display_name.includes("United States")
      );
      const result = usResult || data[0];
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);
      const country = result.address?.country || "";
      const state = result.address?.state || result.address?.region;
      const displayName = result.display_name;
      const obj = { coords: [lat, lon] as [number, number], country, state, displayName };
      sessionStorage.setItem(cacheKey, JSON.stringify(obj));
      return obj;
    }
  } catch {}
  return null;
}

function capitalizeCity(city: string): string {
  return city
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function CityMarker({ coords, city, weather }: { coords: [number, number]; city: string; weather: any }) {
  const map = useMap();
  const markerRef = useRef<any>(null);
  useEffect(() => {
    map.setView(coords, 7);
    // Open popup next to marker when coords change
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [coords[0], coords[1]]);
  return (
    <Marker position={coords} icon={markerIcon} ref={markerRef}>
      <Popup autoPan={false} closeButton={false}>
        <div>
          <div className="font-medium">{capitalizeCity(city)}</div>
          {weather && (
            <>
              <div>{weather.temp !== undefined ? `${Math.round(weather.temp)}°` : null}</div>
              <div>{weather.weather && weather.weather[0]?.main}</div>
              {weather.humidity !== undefined && (
                <div>Humidity: {weather.humidity}%</div>
              )}
              {weather.wind !== undefined && (
                <div>Wind: {typeof weather.wind === 'object' && weather.wind.speed !== undefined ? `${weather.wind.speed} m/s` : weather.wind}</div>
              )}
            </>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

interface RadarMapProps {
  units: "metric" | "imperial";
}

export default function RadarMap({ units }: RadarMapProps) {
  const [selectedCity, setSelectedCity] = useState<string>("New York");
  const [weather, setWeather] = useState<any>(null);
  const [coords, setCoords] = useState<[number, number]>(CITY_COORDS["New York"]);
  const lastCityRef = useRef<string>("New York");
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastItem[]>([]);

  // Update city and weather on event
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail && typeof e.detail === "string") {
        setSelectedCity(e.detail);
        let favs: any[] = [];
        try {
          favs = JSON.parse(localStorage.getItem("favoriteCities") || "[]");
        } catch {}
        const found = favs.find((c: any) => c.name.toLowerCase() === e.detail.toLowerCase());
        setWeather(found || null);
      }
    };
    window.addEventListener("favoriteCitySelected", handler);
    // On mount, try to get initial weather
    let favs: any[] = [];
    try {
      favs = JSON.parse(localStorage.getItem("favoriteCities") || "[]");
    } catch {}
    const found = favs.find((c: any) => c.name.toLowerCase() === selectedCity.toLowerCase());
    setWeather(found || null);
    return () => window.removeEventListener("favoriteCitySelected", handler);
  }, [selectedCity]);
  // Fetch weather if not in favorites
  useEffect(() => {
    let cancelled = false;
    async function fetchWeatherAndCoords() {
      setLoadingWeather(true);
      let cityQuery = selectedCity;
      let geoCoords: [number, number] | null = null;
      let geo = null;
      try {
        geo = await geocodeCity(selectedCity);
        if (geo && geo.country && geo.country.includes("United States")) {
          const cityName = geo.displayName.split(",")[0].trim();
          const state = geo.state;
          if (state) {
            cityQuery = `${cityName}, ${state}, US`;
          } else {
            cityQuery = `${cityName}, US`;
          }
          geoCoords = geo.coords;
        } else if (geo) {
          geoCoords = geo.coords;
        }
      } catch (e) {
        console.error("Geocoding error:", e);
      }      try {
        const weatherData = await getCurrentWeather(cityQuery, units);
        if (!cancelled && weatherData) {
          // Transform to match the shape expected by CityMarker (like favorites)
          const w = weatherData.current || weatherData;
          setWeather({
            temp: w.main && typeof w.main.temp === 'number' ? w.main.temp : w.temp,
            weather: w.weather,
            humidity: w.main && typeof w.main.humidity === 'number' ? w.main.humidity : w.humidity,
            wind: w.wind,
          });
          
          // Generate hourly forecast data based on current weather
          // This is a mock implementation since we don't have real hourly data from the API
          const currentHour = Math.floor(Date.now() / 1000);
          const currentTemp = w.main && typeof w.main.temp === 'number' ? w.main.temp : w.temp;
          const hourlyData: HourlyForecastItem[] = Array(24).fill(null).map((_, i) => {
            // Generate realistic temperature variations throughout the day
            let tempVariation = 0;
            const hourOfDay = new Date((currentHour + i * 3600) * 1000).getHours();
            
            // Temperature peaks around 3pm (15:00) and is lowest around 5am
            if (hourOfDay >= 8 && hourOfDay <= 15) {
              // Morning to afternoon - temperature rises
              tempVariation = (hourOfDay - 8) * 0.5;
            } else if (hourOfDay >= 16 && hourOfDay <= 21) {
              // Afternoon to evening - temperature decreases
              tempVariation = (21 - hourOfDay) * 0.5;
            } else {
              // Night - temperature continues to decrease or is at its lowest
              tempVariation = -2;
            }
            
            // Add some randomness
            const randomVariation = Math.random() * 2 - 1; // -1 to 1
            
            // Weather conditions may change
            let weatherCondition = {...w.weather[0]};
            if (i > 5 && Math.random() > 0.7) {
              // Sometimes change the weather conditions
              const conditions = [
                { id: 800, main: "Clear", description: "clear sky" },
                { id: 801, main: "Clouds", description: "few clouds" },
                { id: 802, main: "Clouds", description: "scattered clouds" },
                { id: 500, main: "Rain", description: "light rain" }
              ];
              weatherCondition = conditions[Math.floor(Math.random() * conditions.length)];
            }
            
            return {
              time: currentHour + i * 3600, // Each hour is 3600 seconds
              temp: currentTemp + tempVariation + randomVariation,
              feels_like: currentTemp + tempVariation + randomVariation - 2,
              humidity: w.humidity ? w.humidity - Math.floor(Math.random() * 5) : 50,
              wind_speed: w.wind && w.wind.speed ? w.wind.speed + (Math.random() * 2 - 1) : 5,
              weather: [weatherCondition],
              chance_of_rain: weatherCondition.main === "Rain" ? Math.random() * 0.7 : Math.random() * 0.2
            };
          });
          
          setHourlyForecast(hourlyData);
          
          // Always set coords: prefer weatherData.coord, else geoCoords
          if (weatherData && weatherData.coord && weatherData.coord.lat && weatherData.coord.lon) {
            setCoords([weatherData.coord.lat, weatherData.coord.lon]);
          } else if (geoCoords) {
            setCoords(geoCoords);
          }
        } else if (!cancelled && geoCoords) {
          setCoords(geoCoords);
        }
      } catch (e) {
        console.error("Error fetching weather:", e);
        if (!cancelled && geoCoords) {
          setCoords(geoCoords);
        }
      }
      setLoadingWeather(false);
    }    fetchWeatherAndCoords();
    return () => {
      cancelled = true;
    };
  }, [selectedCity, units]);
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 relative">
        <MapContainer center={coords} zoom={7} className="h-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <TileLayer
            url={RAINVIEWER_TILE_URL}
            attribution='Radar data &copy; <a href="https://www.rainviewer.com/">RainViewer</a>'
            opacity={0.7}
          />
          <CityMarker
            coords={coords}
            city={selectedCity}
            weather={weather}
          />
        </MapContainer>        {/* Hourly forecast overlay positioned at the bottom right */}
        <div className="absolute bottom-4 right-4 w-[95%] sm:w-[70%] md:w-[50%] lg:w-[40%] z-[1000] bg-background/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
          {hourlyForecast.length > 0 ? (
            <div className="transition-all duration-300 ease-in-out">
              <HourlyForecast 
                hourlyData={hourlyForecast} 
                units={units}
                selectedCity={capitalizeCity(selectedCity)}
              />
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-pulse">Loading hourly forecast...</div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-card shadow-md">
        <div className="text-lg font-semibold mb-2">Weather Radar</div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(CITY_COORDS).map((city) => {
            const isSelected = city === selectedCity;
            return (
              <div
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {capitalizeCity(city)}
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
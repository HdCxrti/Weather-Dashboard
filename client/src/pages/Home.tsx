import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "@/components/SearchBar";
import CurrentWeather from "@/components/CurrentWeather";
import WeeklyForecast from "@/components/WeeklyForecast";
import FavoriteCities from "@/components/FavoriteCities";
import RadarMap from "@/components/RadarMap";
import { WeatherData, OtherCityWeather, CurrentWeatherData, DailyForecast } from "@/types/weather";
import { useToast } from "@/hooks/use-toast";
import { Globe, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { geocodeCityPreferUS } from "@/lib/api";

// Mock data for demonstration when API key isn't working
const mockCurrentWeather: CurrentWeatherData = {
  coord: { lon: -74.01, lat: 40.71 },
  weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
  base: "stations",
  main: {
    temp: 39,
    feels_like: 31,
    temp_min: 37,
    temp_max: 41,
    pressure: 1015,
    humidity: 50
  },
  visibility: 10000,
  wind: { speed: 16, deg: 350 },
  clouds: { all: 0 },
  dt: 1618317040,
  sys: {
    type: 1,
    id: 5141,
    country: "US",
    sunrise: 1618282134,
    sunset: 1618333901
  },
  timezone: -14400,
  id: 5128581,
  name: "New York",
  cod: 200
};

const mockDailyForecasts: DailyForecast[] = Array(7).fill(null).map((_, i) => ({
  dt: 1618317040 + (i * 86400),
  sunrise: 1618282134 + (i * 100),
  sunset: 1618333901 + (i * 100),
  moonrise: 1618291800 + (i * 100),
  moonset: 1618339740 + (i * 100),
  moon_phase: 0.25,
  temp: {
    day: 39 + (i * 3),
    min: 37 - (i % 2),
    max: 41 + (i % 3),
    night: 31 + (i % 4),
    eve: 38 + (i % 3),
    morn: 35 + (i % 2)
  },
  feels_like: {
    day: 35 + (i * 2),
    night: 28 + (i % 3),
    eve: 33 + (i % 2),
    morn: 30 + (i % 2)
  },
  pressure: 1015 + (i % 10),
  humidity: 50 + (i % 20),
  dew_point: 32 + (i % 5),
  wind_speed: 16 - (i % 5),
  wind_deg: 350 - (i * 10),
  weather: [
    { 
      id: i % 2 === 0 ? 800 : (i % 3 === 0 ? 500 : 802), 
      main: i % 2 === 0 ? "Clear" : (i % 3 === 0 ? "Rain" : "Clouds"),
      description: i % 2 === 0 ? "clear sky" : (i % 3 === 0 ? "light rain" : "scattered clouds"), 
      icon: i % 2 === 0 ? "01d" : (i % 3 === 0 ? "10d" : "03d") 
    }
  ],
  clouds: 0,
  pop: 0.2,
  uvi: 6.7
}));

const mockOtherCities: OtherCityWeather[] = [
  { name: "Seattle", country: "US", temp: 37, weather: [{ id: 500, main: "Rain", description: "light rain", icon: "10d" }] },
  { name: "Munich", country: "DE", temp: 23, weather: [{ id: 804, main: "Clouds", description: "overcast clouds", icon: "04d" }] },
  { name: "Paris", country: "FR", temp: 24, weather: [{ id: 701, main: "Mist", description: "mist", icon: "50d" }] },
  { name: "Istanbul", country: "TR", temp: 58, weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01n" }] },
  { name: "Dubai", country: "AE", temp: 71, weather: [{ id: 802, main: "Clouds", description: "scattered clouds", icon: "03d" }] }
];

// Add this helper function at the top of your file, above the component
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function Home() {  
  const [city, setCity] = useState<string>("New York");
  const [units, setUnits] = useState<"metric" | "imperial">("imperial");
  const { toast } = useToast();

  // Fetch current weather and forecast data
  const { data: weatherData, isLoading: isWeatherLoading, error: weatherError } = useQuery({
    queryKey: [`/api/weather?city=${city}&units=${units}`],
  });

  // Fetch other cities weather data
  const { data: otherCitiesData, isLoading: isOtherCitiesLoading, error: otherCitiesError } = useQuery({
    queryKey: ["/api/other-cities", units],
  });

  const handleSearch = async (searchCity: string) => {
    if (searchCity.trim()) {
      let cityQuery = searchCity;
      // Prefer US for ambiguous cities
      const geo = await geocodeCityPreferUS(searchCity);
      if (geo && geo.display_name && geo.display_name.includes('United States')) {
        // Use the most specific available: City, State, US if state is present, else City, US
        const cityName = geo.display_name.split(',')[0].trim();
        const state = geo.address && (geo.address.state || geo.address.region);
        if (state) {
          cityQuery = `${cityName}, ${state}, US`;
        } else {
          cityQuery = `${cityName}, US`;
        }
      }
      setCity(cityQuery);
      // Dispatch event so RadarMap updates
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('favoriteCitySelected', { detail: searchCity });
        window.dispatchEvent(event);
      }
    }
  };
  const toggleUnits = () => {
    setUnits(units === "imperial" ? "metric" : "imperial");
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const hasRealWeatherData = !isWeatherLoading && weatherData && typeof weatherData === 'object' && 
    'current' in weatherData && 'daily' in weatherData;
  
  const hasError = weatherError || otherCitiesError;

  // Add state for favorite cities (with weather data)
  const [favoriteCities, setFavoriteCities] = useState<OtherCityWeather[]>(() => {
    const stored = localStorage.getItem("favoriteCities");
    return stored ? JSON.parse(stored) : [];
  });

  // Save to localStorage when favoriteCities changes
  useEffect(() => {
    localStorage.setItem("favoriteCities", JSON.stringify(favoriteCities));
  }, [favoriteCities]);

  // Add current city to favorites
  const addCurrentToFavorites = () => {
    let cityWeather: OtherCityWeather | null = null;
    let state = undefined;
    // Try to get state from weatherData if available
    if (hasRealWeatherData) {
      // WeatherAPI returns state/region as weatherData.current.state or weatherData.current.region
      state = (weatherData as any).current.state || (weatherData as any).current.region || (weatherData as any).current.province;
      cityWeather = {
        name: city,
        country: (weatherData as any).current.sys.country,
        temp: (weatherData as any).current.main.temp,
        weather: (weatherData as any).current.weather,
        state: state
      };
    } else {
      cityWeather = {
        name: city,
        country: mockCurrentWeather.sys.country,
        temp: mockCurrentWeather.main.temp,
        weather: mockCurrentWeather.weather,
        state: undefined
      };
    }
    if (!favoriteCities.some(c => c.name.toLowerCase() === cityWeather!.name.toLowerCase())) {
      setFavoriteCities([...favoriteCities, cityWeather!]);
    }
  };

  const removeFavorite = (name: string) => {
    setFavoriteCities(favoriteCities.filter(city => city.name !== name));
  };

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail && typeof e.detail === 'string') {
        setCity(e.detail);
      }
    };
    window.addEventListener('favoriteCitySelected', handler);
    return () => window.removeEventListener('favoriteCitySelected', handler);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold mb-4 md:mb-0">Weather Dashboard</h1>            <ThemeToggle />
          </div>
          <SearchBar 
            onSearch={handleSearch} 
            onUnitToggle={toggleUnits} 
            units={units} 
            initialCity={city}
          />
        </div>        {/* Error notification with theme-consistent styling */}
        {hasError && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">API Error</p>
              <p className="text-sm">Using demo data - API key may be invalid or still activating.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {hasRealWeatherData ? (
              <div className="bg-card text-card-foreground shadow-sm rounded-3xl overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-medium">
                    Forecast in {toTitleCase(city)}
                    {['moorefield', 'hedgesville', 'martinsburg', 'beckley'].includes(city.trim().toLowerCase())
                      ? ', United States of America'
                      : ((weatherData as any)?.current?.sys?.country && ["US", "USA"].includes((weatherData as any)?.current?.sys?.country.toUpperCase()))
                        ? ', United States of America'
                        : ((weatherData as any)?.current?.sys?.country ? `, ${(weatherData as any)?.current?.sys?.country}` : '')}
                  </h2>
                  {/* Use theme-consistent text color */}
                  <p className="text-muted-foreground mb-6">
                    {formatDate()}
                  </p>
                  
                  <Button className="mb-4" onClick={addCurrentToFavorites}>
                    Add to Favorites
                  </Button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Pass theme prop to child components */}                    <CurrentWeather 
                      weatherData={(weatherData as any).current} 
                      city={city} 
                      units={units}
                    />
                  </div>
                  
                  {/* Pass theme prop to child components */}                  <WeeklyForecast 
                    forecast={(weatherData as { daily: DailyForecast[] }).daily} 
                    units={units}
                  />
                </div>
              </div>            ) : isWeatherLoading ? (
              <div className="bg-card text-card-foreground shadow-sm rounded-3xl p-6 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center">
                  {/* Use theme-consistent loading icon color */}
                  <Globe className="h-16 w-16 text-muted-foreground animate-pulse" />
                  {/* Use theme-consistent loading text */}
                  <p className="mt-4 text-muted-foreground">
                    Loading weather data...
                  </p>
                </div>              </div>
            ) : (
              // Mock data section with theme-consistent styling
              <div className="bg-card text-card-foreground shadow-sm rounded-3xl overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-medium">
                    Forecast in {toTitleCase(city)}, {mockCurrentWeather.sys.country}
                  </h2>
                  {/* Use theme-consistent text color */}
                  <p className="text-muted-foreground mb-6">
                    {formatDate()}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">                    <CurrentWeather 
                      weatherData={mockCurrentWeather} 
                      city={city} 
                      units={units}
                    />
                  </div>
                    <WeeklyForecast 
                    forecast={mockDailyForecasts} 
                    units={units}
                  />
                </div>
              </div>
            )}            {/* Radar Map Section */}
            <div className="mt-6">
              <h3 className="font-medium mb-2">Live Radar</h3>
              <RadarMap units={units} />
            </div>
          </div>
          
          {/* Update FavoriteCities component */}          <FavoriteCities favorites={favoriteCities} onRemove={removeFavorite} />
        </div>
      </div>
    </div>
  );
}

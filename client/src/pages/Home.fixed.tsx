import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "@/components/SearchBar";
import CurrentWeather from "@/components/CurrentWeather";
import WeeklyForecast from "@/components/WeeklyForecast";
import HourlyForecast from "@/components/HourlyForecast";
import WeatherStats from "@/components/WeatherStats";
import WeatherNewsSummary from "@/components/WeatherNewsSummary";
import FavoriteCities from "@/components/FavoriteCities";
import Footer from "@/components/Footer";
import { WeatherData, OtherCityWeather, CurrentWeatherData, DailyForecast } from "@/types/weather";
import { useToast } from "@/hooks/use-toast";
import { Globe, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getFavoriteCitiesWeather } from "@/lib/api";

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

// Mock hourly forecast data
const mockHourlyForecast = Array(24).fill(null).map((_, i) => {
  const currentHour = new Date().getHours();
  const forecastHour = new Date();
  forecastHour.setHours(currentHour + i);
  
  return {
    time: Math.floor(forecastHour.getTime() / 1000),
    temp: 40 + Math.sin(i/6) * 8, // Temperature that varies throughout the day
    feels_like: 38 + Math.sin(i/6) * 10,
    humidity: 45 + Math.cos(i/8) * 20,
    wind_speed: 8 + Math.sin(i/4) * 4,
    weather: [{
      id: i % 3 === 0 ? 800 : (i % 5 === 0 ? 500 : 802),
      main: i % 3 === 0 ? "Clear" : (i % 5 === 0 ? "Rain" : "Clouds"),
      description: i % 3 === 0 ? "clear sky" : (i % 5 === 0 ? "light rain" : "scattered clouds"),
      icon: i % 3 === 0 ? "01d" : (i % 5 === 0 ? "10d" : "03d")
    }],
    chance_of_rain: i % 5 === 0 ? 40 : (i % 7 === 0 ? 20 : 0)
  };
});

// Helper function to properly capitalize city names
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
  const [favoriteCities, setFavoriteCities] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Load favorite cities from localStorage on mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favoriteCities");
    if (storedFavorites) {
      try {
        const parsedFavorites = JSON.parse(storedFavorites);
        if (Array.isArray(parsedFavorites)) {
          setFavoriteCities(parsedFavorites);
        } else {
          console.error("Stored favorites is not an array, resetting to empty array");
          setFavoriteCities([]);
        }
      } catch (e) {
        console.error("Failed to parse favorite cities from localStorage", e);
        setFavoriteCities([]);
      }
    }
  }, []);
  
  // Save favorite cities to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("favoriteCities", JSON.stringify(favoriteCities));
  }, [favoriteCities]);

  // Fetch current weather and forecast data
  const { data: weatherData, isLoading: isWeatherLoading, error: weatherError } = useQuery({
    queryKey: [`/api/weather?city=${city}&units=${units}`],
    retry: 1
  });
  
  // Fetch favorite cities weather data
  const { data: otherCitiesData, isLoading: isOtherCitiesLoading, error: otherCitiesError } = useQuery({
    queryKey: ["/api/favorite-cities", units, favoriteCities],
    queryFn: () => getFavoriteCitiesWeather(favoriteCities, units),
    enabled: Array.isArray(favoriteCities) && favoriteCities.length > 0,
    retry: 1
  });

  useEffect(() => {
    if (otherCitiesError) {
      console.error('Error fetching favorite cities data:', otherCitiesError);
      toast({
        title: "Unable to load favorites",
        description: "Could not retrieve weather data for your favorite cities",
        variant: "destructive"
      });
    }
  }, [otherCitiesError, toast]);

  const handleSearch = (searchCity: string) => {
    if (searchCity.trim()) {
      setCity(searchCity);
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

  const hasRealWeatherData = !isWeatherLoading && weatherData && 
    typeof weatherData === 'object' && 'current' in weatherData && 'daily' in weatherData;
  
  const hasError = weatherError || otherCitiesError;
  
  // Filter mock cities to include only favorites + current city when using mock data
  const filteredMockCities = [...mockOtherCities].filter(cityObj => 
    favoriteCities.includes(cityObj.name) || cityObj.name.toLowerCase() === city.toLowerCase()
  );
  
  // If we don't have any favorite cities yet, show some example cities
  const displayedMockCities = filteredMockCities.length > 0 ? filteredMockCities : mockOtherCities;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-full mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold mb-4 md:mb-0">Weather Dashboard</h1>
            <ThemeToggle />
          </div>
          <SearchBar 
            onSearch={handleSearch} 
            onUnitToggle={toggleUnits} 
            units={units} 
            initialCity={city}
          />
        </div>
        
        {/* Error notification with theme-consistent styling */}
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
                    Forecast in {toTitleCase(city)}, {(weatherData as any).current.sys.country}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {formatDate()}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CurrentWeather 
                      weatherData={(weatherData as any).current} 
                      city={city} 
                      units={units}
                    />
                  </div>
                  
                  <WeeklyForecast 
                    forecast={(weatherData as { daily: DailyForecast[] }).daily} 
                    units={units}
                  />
                </div>

                {/* Hourly Forecast Section */}
                <div className="p-6 pt-0 border-t border-border/10 mt-6">
                  <h3 className="text-lg font-medium mb-4">Hourly Forecast</h3>
                  <HourlyForecast
                    hourlyData={(weatherData as any).hourly || mockHourlyForecast}
                    units={units}
                    selectedCity={city}
                  />
                </div>

                {/* Weather Stats Section */}
                <div className="p-6 border-t border-border/10">
                  <h3 className="text-lg font-medium mb-4">Weather Details</h3>
                  <WeatherStats
                    cityName={city}
                    aqi={(weatherData as any).current?.air_quality?.pm2_5}
                    uvIndex={(weatherData as any).current?.uvi || 5}
                    humidity={(weatherData as any).current?.main?.humidity}
                    dewPoint={(weatherData as any).current?.dew_point}
                    precipitation={(weatherData as any).daily?.[0]?.pop * 100}
                    windGust={(weatherData as any).current?.wind_gust}
                    units={units}
                  />
                </div>
              </div>
            ) : isWeatherLoading ? (
              <div className="bg-card text-card-foreground shadow-sm rounded-3xl p-6 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center">
                  <Globe className="h-16 w-16 text-muted-foreground animate-pulse" />
                  <p className="mt-4 text-muted-foreground">
                    Loading weather data...
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-card text-card-foreground shadow-sm rounded-3xl overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-medium">
                    Forecast in {toTitleCase(city)}, {mockCurrentWeather.sys.country}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {formatDate()}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CurrentWeather 
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

                {/* Hourly Forecast Section */}
                <div className="p-6 pt-0 border-t border-border/10 mt-6">
                  <h3 className="text-lg font-medium mb-4">Hourly Forecast</h3>
                  <HourlyForecast
                    hourlyData={mockHourlyForecast}
                    units={units}
                    selectedCity={city}
                  />
                </div>

                {/* Weather Stats Section */}
                <div className="p-6 border-t border-border/10">
                  <h3 className="text-lg font-medium mb-4">Weather Details</h3>
                  <WeatherStats
                    cityName={city}
                    units={units}
                  />
                </div>
              </div>
            )}

            {/* Weather News Section */}
            <div className="mt-6 bg-card text-card-foreground shadow-sm rounded-3xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Weather News & Updates</h3>
                <WeatherNewsSummary 
                  cityName={city}
                  countryCode={hasRealWeatherData ? 
                    (weatherData as any).current.sys.country : 
                    mockCurrentWeather.sys.country}
                />
              </div>
            </div>
          </div>
          
          {/* Favorite Cities component */}
          <div className="space-y-6">
            <FavoriteCities 
              citiesData={!otherCitiesError && otherCitiesData ? 
                (otherCitiesData as OtherCityWeather[]) : 
                displayedMockCities} 
              isLoading={isOtherCitiesLoading && !otherCitiesError}
              units={units}
              favorites={favoriteCities}
              onFavoritesChange={(updatedFavorites) => {
                setFavoriteCities(updatedFavorites);
              }}
              onAddFavorite={(cityName) => {
                setCity(cityName); // Switch to the new favorite city
              }}
            />

            {/* Tips and Information Card */}
            <div className="bg-card text-card-foreground shadow-sm rounded-3xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-3">Weather Tips</h3>
                <div className="text-sm space-y-3 text-muted-foreground">
                  <p>
                    {hasRealWeatherData ? 
                      ((weatherData as any).current.main.temp > 85 ? 
                        "Stay hydrated and seek shade during peak sun hours." : 
                        (weatherData as any).current.main.temp < 50 ? 
                        "Bundle up in layers to stay warm in these cooler temperatures." :
                        "Enjoy the pleasant weather today!") : 
                      mockCurrentWeather.main.temp > 85 ? 
                      "Stay hydrated and seek shade during peak sun hours." : 
                      mockCurrentWeather.main.temp < 50 ? 
                      "Bundle up in layers to stay warm in these cooler temperatures." :
                      "Enjoy the pleasant weather today!"}
                  </p>
                  <p>Remember to check back for updated forecasts throughout the day.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Footer lastUpdated={new Date()} />
      </div>
    </div>
  );
}

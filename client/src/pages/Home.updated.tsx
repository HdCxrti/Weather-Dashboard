import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "@/components/SearchBar";
import CurrentWeather from "@/components/CurrentWeather";
import WeeklyForecast from "@/components/WeeklyForecast";
import FavoriteCitiesSimple from "@/components/FavoriteCitiesSimple";
import WeatherStats from "@/components/WeatherStats";
import WeatherNewsSummary from "@/components/WeatherNewsSummary";
import WeatherAlerts from "@/components/WeatherAlerts";
import HourlyForecast from "@/components/HourlyForecast";
import TemperatureChart from "@/components/TemperatureChart";
import PrecipitationChart from "@/components/PrecipitationChart";
import DetailedHourlyForecast from "@/components/DetailedHourlyForecast";
import LoadingSpinner from "@/components/LoadingSpinner";
import WeatherBackground from "@/components/WeatherBackground";
import ShareWeather from "@/components/ShareWeather";
import PWAInstallButton from "@/components/PWAInstallButton";
import Footer from "@/components/Footer";
import { WeatherData, OtherCityWeather, CurrentWeatherData, DailyForecast } from "@/types/weather";
import { useToast } from "@/hooks/use-toast";
import { Globe, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getFavoriteCitiesWeather, getWeatherByCoordinates } from "@/lib/api";

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
    // Create timestamps for today at 6:15 AM and 7:45 PM respectively
    sunrise: (() => {
      const today = new Date();
      today.setHours(6, 15, 0, 0); // 6:15 AM
      return Math.floor(today.getTime() / 1000);
    })(),
    sunset: (() => {
      const today = new Date();
      today.setHours(19, 45, 0, 0); // 7:45 PM
      return Math.floor(today.getTime() / 1000);
    })()
  },
  timezone: -14400,
  id: 5128581,
  name: "New York",
  cod: 200
};

// Mock daily forecasts for when API isn't working
const mockDailyForecasts: DailyForecast[] = Array(7).fill(null).map((_, i) => {
  // Create base date for this forecast day
  const forecastDate = new Date();
  forecastDate.setDate(forecastDate.getDate() + i); // Add days
  
  // Create sunrise time for this day
  const sunriseTime = new Date(forecastDate);
  sunriseTime.setHours(6, 15, 0, 0); // 6:15 AM
  
  // Create sunset time for this day
  const sunsetTime = new Date(forecastDate);
  sunsetTime.setHours(19, 45, 0, 0); // 7:45 PM
  
  return {
    dt: Math.floor(forecastDate.getTime() / 1000),
    sunrise: Math.floor(sunriseTime.getTime() / 1000),
    sunset: Math.floor(sunsetTime.getTime() / 1000),
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
  };
});

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

// Extract just the city name from a search query (e.g. "New York USA" -> "New York")
function extractCityName(cityQuery: string): string {
  // Extract the first part of the city name (before comma or before country name indicators)
  const parts = cityQuery.split(/,|\s+(?:USA|US|United States|Canada|UK|Russia|China|Japan|Germany|France|Italy|Brazil|Australia)$/i);
  return parts[0].trim();
}

export default function Home() {  
  const [city, setCity] = useState<string>("New York");
  const [units, setUnits] = useState<"metric" | "imperial">("imperial");
  const [favoriteCities, setFavoriteCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Track location coordinates
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [usingCoordinates, setUsingCoordinates] = useState<boolean>(false);
  
  const { toast } = useToast();
  
  // Handle geolocation request
  const handleGeolocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Get the latitude and longitude
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Store the coordinates for direct weather API call
            setLatitude(lat);
            setLongitude(lon);
            setUsingCoordinates(true);
            
            // Also try to get the city name for display purposes
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
              );
              const data = await response.json();
              
              if (data && data.address && data.address.city) {
                setCity(data.address.city);
              } else if (data && data.address && data.address.town) {
                setCity(data.address.town);
              } else if (data && data.address && data.address.village) {
                setCity(data.address.village);
              } else {
                setCity("Current Location");
              }
            } catch (geoError) {
              console.error('Error in reverse geocoding:', geoError);
              setCity("Current Location");
            }
            
            setIsLoading(false);
          } catch (error) {
            console.error('Error fetching location:', error);
            toast({
              title: 'Location Error',
              description: 'Could not determine your location. Please search manually.',
              variant: 'destructive'
            });
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: 'Geolocation Error',
            description: error.message || 'Unable to access your location',
            variant: 'destructive'
          });
          setIsLoading(false);
        },
        { timeout: 10000 }
      );
    } else {
      toast({
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support geolocation',
        variant: 'destructive'
      });
    }
  };
  
  // Load favorite cities from localStorage on mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favoriteCities");
    if (storedFavorites) {
      try {
        const parsedFavorites = JSON.parse(storedFavorites);
        if (Array.isArray(parsedFavorites)) {
          // Ensure we only have string values, not objects
          const normalizedFavorites = parsedFavorites.map(item => 
            typeof item === 'string' ? item : (item.name || '')
          ).filter(Boolean);
          
          setFavoriteCities(normalizedFavorites);
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
    queryKey: [
      usingCoordinates && latitude && longitude 
        ? `/api/weather?lat=${latitude}&lon=${longitude}&units=${units}` 
        : `/api/weather?city=${city}&units=${units}`
    ],
    retry: 1
  });
  
  // Reset to city-based search when selecting a city manually
  useEffect(() => {
    // Only reset coordinates when city changes by user action (not by geolocation)
    if (!isLoading) {
      setUsingCoordinates(false);
    }
  }, [city]);
  
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

  // Check if a city is valid using the OpenStreetMap Nominatim geocoding service
  const validateCity = async (searchCity: string): Promise<boolean> => {
    if (!searchCity.trim()) return false;
    
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchCity)}`;
    try {
      const resp = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await resp.json();
      return data && data.length > 0;
    } catch (error) {
      console.error("Error validating city:", error);
      return false;
    }
  };
  
  const handleSearch = async (searchCity: string) => {
    if (searchCity.trim()) {
      // Validate if this is a real city before setting it
      const isValid = await validateCity(searchCity);
      
      if (isValid) {
        // Extract just the city name part (without country/state)
        const cityName = extractCityName(searchCity);
        setCity(cityName);
        setUsingCoordinates(false); // Switch back to city-based lookup
        
        // Dispatch event for RadarMap to update - this is needed for the radar map to switch cities
        const event = new CustomEvent("favoriteCitySelected", { detail: cityName });
        window.dispatchEvent(event);
      } else {
        toast({
          title: "Invalid City",
          description: "Please enter a valid city name",
          variant: "destructive"
        });
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
      {hasRealWeatherData && (
        <WeatherBackground 
          weatherCode={(weatherData as any).current.weather[0].id} 
          isNight={(weatherData as any).current.dt > (weatherData as any).current.sys.sunset || 
                  (weatherData as any).current.dt < (weatherData as any).current.sys.sunrise}
        />
      )}
      <div className="w-full mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold mb-4 md:mb-0">Jake's Weather Dashboard</h1>
            <ThemeToggle />
            <PWAInstallButton />
          </div>
          <SearchBar 
            onSearch={handleSearch} 
            onUnitToggle={toggleUnits} 
            units={units} 
            initialCity={city}
            onGeolocation={handleGeolocation}
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
            {isWeatherLoading ? (
              <div className="bg-card text-card-foreground shadow-sm rounded-3xl overflow-hidden">
                <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                  <LoadingSpinner size={40} className="mb-4" />
                  <p className="text-muted-foreground">Loading weather data...</p>
                </div>
              </div>
            ): hasRealWeatherData ? (
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
                  countryCode={!isLoading && !isWeatherLoading && hasRealWeatherData ? 
                    (weatherData as any).current.sys.country : 
                    mockCurrentWeather.sys.country}
                />
              </div>
            </div>
              {/* Weather Alerts Section */}
            {hasRealWeatherData && (weatherData as any).alerts && (weatherData as any).alerts.length > 0 && (
              <div className="mt-6 bg-card text-card-foreground shadow-sm rounded-3xl overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Weather Alerts</h3>
                  <WeatherAlerts alerts={(weatherData as any).alerts} cityName={city} />
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar components */}
          <div className="space-y-6">
            <FavoriteCitiesSimple 
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

            {/* Temperature Chart */}
            <div className="bg-card text-card-foreground shadow-md rounded-3xl overflow-hidden">
              <div className="p-5">
                <TemperatureChart 
                  hourlyData={hasRealWeatherData ? (weatherData as any).hourly || mockHourlyForecast : mockHourlyForecast} 
                  units={units}
                  cityName={city}
                  span={24}
                />
              </div>
            </div>

            {/* Precipitation Chart */}
            <div className="mt-6 bg-card text-card-foreground shadow-md rounded-3xl overflow-hidden">
              <div className="p-5">
                <PrecipitationChart 
                  hourlyData={hasRealWeatherData ? (weatherData as any).hourly || mockHourlyForecast : mockHourlyForecast}
                  span={12}
                />
              </div>
            </div>
            
            {/* Tips and Information Card */}
            <div className="mt-6 bg-card text-card-foreground shadow-sm rounded-3xl overflow-hidden">
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

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "@/components/SearchBar";
import CurrentWeather from "@/components/CurrentWeather";
import WeeklyForecast from "@/components/WeeklyForecast";
import OtherCities from "@/components/OtherCities";
import { WeatherData, OtherCityWeather } from "@/types/weather";
import { useToast } from "@/hooks/use-toast";
import { Globe } from "lucide-react";

export default function Home() {
  const [city, setCity] = useState<string>("New York");
  const [units, setUnits] = useState<"metric" | "imperial">("imperial");
  const { toast } = useToast();

  // Fetch current weather and forecast data
  const { data: weatherData, isLoading: isWeatherLoading } = useQuery({
    queryKey: [`/api/weather?city=${city}&units=${units}`],
  });

  // Fetch other cities weather data
  const { data: otherCitiesData, isLoading: isOtherCitiesLoading } = useQuery({
    queryKey: ["/api/other-cities", units],
  });

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

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold mb-4 md:mb-0">Weather Dashboard</h1>
          <SearchBar 
            onSearch={handleSearch} 
            onUnitToggle={toggleUnits} 
            units={units} 
            initialCity={city}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {!isWeatherLoading && weatherData ? (
              <div className="bg-[#1e1e1e] rounded-3xl overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-medium">
                    Forecast in {city}, {weatherData.current.sys.country}
                  </h2>
                  <p className="text-gray-400 mb-6">
                    {formatDate()}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CurrentWeather 
                      weatherData={weatherData.current} 
                      city={city} 
                      units={units} 
                    />
                  </div>
                  
                  <WeeklyForecast 
                    forecast={weatherData.daily} 
                    units={units} 
                  />
                </div>
              </div>
            ) : (
              <div className="bg-[#1e1e1e] rounded-3xl p-6 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center">
                  <Globe className="h-16 w-16 text-gray-500 animate-pulse" />
                  <p className="mt-4 text-gray-400">
                    Loading weather data...
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <OtherCities 
            citiesData={otherCitiesData} 
            isLoading={isOtherCitiesLoading}
            units={units}
          />
        </div>
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p className="flex items-center justify-center gap-1">
            <span className="text-xs">⌨️</span> 
            Designed & Coded by Aniqa
          </p>
        </div>
      </div>
    </div>
  );
}

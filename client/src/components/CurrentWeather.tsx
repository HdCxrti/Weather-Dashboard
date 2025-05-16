import { Card, CardContent } from "@/components/ui/card";
import WeatherIcon from "@/components/WeatherIcon";
import { CurrentWeatherData } from "@/types/weather";
import { Eye, Droplet, Wind, Gauge, Cloud } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CurrentWeatherProps {
  weatherData: CurrentWeatherData;
  city: string;
  units: "metric" | "imperial";
}

export default function CurrentWeather({ weatherData, city, units }: CurrentWeatherProps) {
  const tempUnit = units === "imperial" ? "F" : "C";
  const speedUnit = units === "imperial" ? "mph" : "m/s";
  const visibilityUnit = units === "imperial" ? "mi" : "km";
  
  // Convert visibility from meters to miles or kilometers
  const formattedVisibility = units === "imperial" 
    ? `${(weatherData.visibility / 1609.34).toFixed(1)}${visibilityUnit}`
    : `${(weatherData.visibility / 1000).toFixed(0)}${visibilityUnit}`;

  const needsUmbrella = 
    weatherData.weather[0].main === "Rain" || 
    weatherData.weather[0].main === "Drizzle" || 
    weatherData.weather[0].main === "Thunderstorm";

  return (
    <Card className="rounded-2xl mb-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-medium mb-1">
          Forecast in {city}, {weatherData.sys.country}
        </h2>
        <p className="text-muted-foreground mb-6">
          {formatDate(new Date(weatherData.dt * 1000))}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current temperature */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-end">
                <span className="text-5xl font-semibold">
                  {Math.round(weatherData.main.temp)}°{tempUnit}
                </span>
                <span className="text-lg text-muted-foreground ml-2">
                  /°{tempUnit === "F" ? "C" : "F"}
                </span>
              </div>
              <div className="flex flex-col mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>High</span>
                  <span className="font-medium">
                    {Math.round(weatherData.main.temp_max)}°{tempUnit}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Low</span>
                  <span className="font-medium">
                    {Math.round(weatherData.main.temp_min)}°{tempUnit}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center">
                <WeatherIcon 
                  weatherCode={weatherData.weather[0].id} 
                  className="w-12 h-12 mr-3"
                />
                <div>
                  <p className="font-medium">{weatherData.weather[0].description}</p>
                  <p className="text-sm text-muted-foreground">
                    Feels like {Math.round(weatherData.main.feels_like)}°{tempUnit}
                  </p>
                </div>
              </div>
              {needsUmbrella && (
                <p className="text-sm mt-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M22 12a9.92 9.92 0 0 0-3.24-6.41 10.12 10.12 0 0 0-13.52 0A9.92 9.92 0 0 0 2 12Z"/>
                    <path d="M12 12v8a2 2 0 0 0 4 0"/>
                    <line x1="12" y1="2" x2="12" y2="3"/>
                  </svg>
                  Umbrella Required
                </p>
              )}
            </div>
          </div>
          
          {/* Weather details */}
          <div className="bg-[#3a5d5d] bg-opacity-40 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-y-4">
              <div className="flex items-center justify-between col-span-2">
                <span>Visibility</span>
                <div className="flex items-center">
                  <span className="font-medium">{formattedVisibility}</span>
                  <Eye className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="flex items-center justify-between col-span-2">
                <span>Dew Point</span>
                <div className="flex items-center">
                  <span className="font-medium">
                    {Math.round(weatherData.main.feels_like - 2)}°{tempUnit}
                  </span>
                  <Droplet className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="flex items-center justify-between col-span-2">
                <span>Wind</span>
                <div className="flex items-center">
                  <span className="font-medium">
                    {Math.round(weatherData.wind.speed)}{speedUnit}
                  </span>
                  <Wind className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="flex items-center justify-between col-span-2">
                <span>Humidity</span>
                <div className="flex items-center">
                  <span className="font-medium">{weatherData.main.humidity}%</span>
                  <Gauge className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="flex items-center justify-between col-span-2">
                <span>Cloudiness</span>
                <div className="flex items-center">
                  <span className="font-medium">{weatherData.clouds.all}%</span>
                  <Cloud className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Sunrise/Sunset */}
          <div className="rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-[#3a4a80] to-[#1e2a4a] opacity-70"></div>
            
            <div className="relative p-4 flex flex-col h-full justify-between">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2"/>
                    <path d="M12 20v2"/>
                    <path d="m4.93 4.93 1.41 1.41"/>
                    <path d="m17.66 17.66 1.41 1.41"/>
                    <path d="M2 12h2"/>
                    <path d="M20 12h2"/>
                    <path d="m6.34 17.66-1.41 1.41"/>
                    <path d="m19.07 4.93-1.41 1.41"/>
                  </svg>
                  <span>Sunrise</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D0D0D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
              </div>
              
              <div className="text-center mb-2">
                <span className="text-2xl font-semibold">
                  {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
              
              <div className="h-px bg-gray-600 my-4 relative">
                <div className="absolute top-0 left-1/4 transform -translate-y-1/2 w-3 h-3 bg-yellow-300 rounded-full"></div>
                <div className="absolute top-0 right-1/4 transform -translate-y-1/2 w-3 h-3 bg-gray-300 rounded-full"></div>
              </div>
              
              <div className="text-center mt-2">
                <span className="text-2xl font-semibold">
                  {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2"/>
                  <path d="M12 20v2"/>
                  <path d="m4.93 4.93 1.41 1.41"/>
                  <path d="m17.66 17.66 1.41 1.41"/>
                  <path d="M2 12h2"/>
                  <path d="M20 12h2"/>
                  <path d="m6.34 17.66-1.41 1.41"/>
                  <path d="m19.07 4.93-1.41 1.41"/>
                </svg>
                <div className="flex items-center">
                  <span>Sunset</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D0D0D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

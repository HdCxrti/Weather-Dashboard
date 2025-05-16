import WeatherIcon from "@/components/WeatherIcon";
import { CurrentWeatherData } from "@/types/weather";
import { Eye, Droplet, Wind, Gauge, Cloud } from "lucide-react";

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
    
  // Calculate the opposite temperature unit value
  const oppositeTemp = tempUnit === "F" 
    ? Math.round((weatherData.main.temp - 32) * 5/9) // Convert F to C
    : Math.round((weatherData.main.temp * 9/5) + 32); // Convert C to F

  // Define theme-consistent colors
  const textColor = "text-foreground";
  const secondaryTextColor = "text-muted-foreground";
  const primaryBg = "bg-card";
  const secondaryBg = "bg-muted";
  const tertiaryBg = "bg-accent";

  return (
    <>
      {/* Current temperature */}
      <div className={`${primaryBg} rounded-xl p-6 shadow-sm ${textColor}`}>
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-end">
              <span className="text-6xl font-bold">
                {Math.round(weatherData.main.temp)}°{tempUnit}
              </span>
              <span className={`text-lg ${secondaryTextColor} ml-2`}>
                /{oppositeTemp}°{tempUnit === "F" ? "C" : "F"}
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
                <p className="font-medium capitalize">{weatherData.weather[0].description}</p>
                <p className={`text-sm ${secondaryTextColor}`}>
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
      </div>
      
      {/* Weather details */}
      <div className={`${secondaryBg} rounded-xl p-6 shadow-sm ${textColor}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Visibility</span>
            <div className="flex items-center">
              <span className="font-medium">{formattedVisibility}</span>
              <Eye className="ml-2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Dew Point</span>
            <div className="flex items-center">
              <span className="font-medium">
                {Math.round(weatherData.main.feels_like - 2)}°{tempUnit}
              </span>
              <Droplet className="ml-2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Wind</span>
            <div className="flex items-center">
              <span className="font-medium">
                {Math.round(weatherData.wind.speed)}{speedUnit}
              </span>
              <Wind className="ml-2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Humidity</span>
            <div className="flex items-center">
              <span className="font-medium">{weatherData.main.humidity}%</span>
              <Gauge className="ml-2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Cloudiness</span>
            <div className="flex items-center">
              <span className="font-medium">{weatherData.clouds.all}%</span>
              <Cloud className="ml-2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Sunrise/Sunset */}
      <div className={`${tertiaryBg} rounded-xl p-6 shadow-sm ${textColor}`}>
        <div className="flex flex-col h-full justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Sunrise</h3>
            <span className="text-xl">
              {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true
              })}
            </span>
          </div>
          
          <div className="h-px bg-border my-4 relative">
            <div className="absolute top-0 left-1/4 transform -translate-y-1/2 w-3 h-3 bg-yellow-300 rounded-full"></div>
            <div className="absolute top-0 right-1/4 transform -translate-y-1/2 w-3 h-3 bg-muted-foreground rounded-full"></div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <h3 className="text-lg font-medium">Sunset</h3>
            <span className="text-xl">
              {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true
              })}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

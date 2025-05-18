import { useState, useRef, useEffect } from "react";
import { WeatherCondition } from "@/types/weather";
import WeatherIcon from "@/components/WeatherIcon";
import { cn } from "@/lib/utils";
import { 
  Droplet, 
  Wind, 
  Thermometer, 
  Sun, 
  CloudRain, 
  Compass,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export interface DetailedHourlyForecastItem {
  time: number; // timestamp in seconds
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_deg?: number;
  pressure?: number;
  clouds?: number;
  visibility?: number;
  uvi?: number;
  dew_point?: number;
  weather: WeatherCondition[];
  pop?: number; // Probability of precipitation
  rain?: { "1h"?: number };
}

interface DetailedHourlyForecastProps {
  hourlyData?: DetailedHourlyForecastItem[];
  units: "metric" | "imperial";
}

// Generate mock hourly data if needed
const generateMockHourlyData = (count: number = 24, units: "metric" | "imperial"): DetailedHourlyForecastItem[] => {
  const now = new Date();
  const baseTemp = units === "metric" ? 22 : 72; // Starting temp in C or F
  
  return Array(count).fill(null).map((_, i) => {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hour = time.getHours();
    
    // Temperature variations by time of day
    let tempVariation = 0;
    if (hour >= 10 && hour <= 16) {
      tempVariation = 5; // Warmer in afternoon
    } else if (hour >= 0 && hour <= 6) {
      tempVariation = -5; // Cooler at night
    }
    
    // Weather conditions vary by time
    let weather: WeatherCondition;
    const randCondition = Math.random();
    
    if (hour >= 22 || hour <= 6) {
      // Night conditions
      weather = randCondition < 0.7 
        ? { id: 800, main: "Clear", description: "clear sky", icon: "01n" }
        : { id: 801, main: "Clouds", description: "few clouds", icon: "02n" };
    } else if (randCondition < 0.6) {
      // Mostly sunny during day
      weather = { id: 800, main: "Clear", description: "clear sky", icon: "01d" };
    } else if (randCondition < 0.8) {
      // Partly cloudy
      weather = { id: 802, main: "Clouds", description: "scattered clouds", icon: "03d" };
    } else {
      // Light rain
      weather = { id: 500, main: "Rain", description: "light rain", icon: "10d" };
    }
    
    // Random but realistic values
    const temp = baseTemp + tempVariation + Math.sin(i/4) * 3;
    const isRainy = weather.main === "Rain";
    
    return {
      time: Math.floor(time.getTime() / 1000),
      temp,
      feels_like: temp - 2 + (Math.random() * 4),
      humidity: 40 + Math.floor(Math.random() * 40),
      wind_speed: 5 + Math.floor(Math.random() * 15),
      wind_deg: Math.floor(Math.random() * 360),
      pressure: 1010 + Math.floor(Math.random() * 20),
      clouds: Math.floor(Math.random() * 100),
      visibility: 8000 + Math.floor(Math.random() * 2000),
      uvi: 0 + Math.floor(Math.random() * 10),
      dew_point: temp - 10 + Math.floor(Math.random() * 5),
      weather: [weather],
      pop: isRainy ? 0.3 + (Math.random() * 0.6) : Math.random() * 0.3,
      rain: isRainy ? { "1h": Math.random() * 2 } : undefined
    };
  });
};

export default function DetailedHourlyForecast({ 
  hourlyData, 
  units 
}: DetailedHourlyForecastProps) {
  // Generate mock data if no real data is provided
  const hourlyForecastData = hourlyData && hourlyData.length > 0 
    ? hourlyData 
    : generateMockHourlyData(24, units);
    
  const [activeHour, setActiveHour] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const tempUnit = units === "metric" ? "°C" : "°F";
  const speedUnit = units === "imperial" ? "mph" : "m/s";
  const visibilityUnit = units === "imperial" ? "mi" : "km";
  
  // Format the hour and date from timestamp
  const formatHourTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', { 
      hour: 'numeric',
      hour12: true 
    });
  };
  
  const formatFullDateTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Convert wind degrees to cardinal direction
  const getWindDirection = (degrees: number | undefined) => {
    if (degrees === undefined) return "N/A";
    
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };
  
  // Convert visibility from meters to miles or kilometers
  const formatVisibility = (meters: number | undefined) => {
    if (!meters) return "N/A";
    
    if (units === "imperial") {
      const miles = meters / 1609.34;
      return `${miles.toFixed(1)} ${visibilityUnit}`;
    } else {
      const km = meters / 1000;
      return `${km.toFixed(0)} ${visibilityUnit}`;
    }
  };
  
  // Format rain amount
  const formatRain = (rain: { "1h"?: number } | undefined) => {
    if (!rain || rain["1h"] === undefined) return "0 mm";
    return `${rain["1h"].toFixed(1)} mm`;
  };
  
  // Format humidity with visual indicator
  const getHumidityColor = (humidity: number) => {
    if (humidity > 80) return "text-blue-600 dark:text-blue-400";
    if (humidity > 60) return "text-blue-400 dark:text-blue-300";
    if (humidity > 40) return "text-blue-300 dark:text-blue-200";
    return "text-blue-200 dark:text-blue-100";
  };
  
  // Format UVI with color indicator
  const getUVIColor = (uvi: number | undefined) => {
    if (!uvi) return "text-green-500";
    if (uvi > 10) return "text-purple-600";
    if (uvi > 7) return "text-red-600";
    if (uvi > 5) return "text-orange-500";
    if (uvi > 2) return "text-yellow-500";
    return "text-green-500";
  };
  
  const getUVIDescription = (uvi: number | undefined) => {
    if (!uvi) return "Low";
    if (uvi > 10) return "Extreme";
    if (uvi > 7) return "Very High";
    if (uvi > 5) return "High";
    if (uvi > 2) return "Moderate";
    return "Low";
  };
  
  // Scroll active hour into view when it changes
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    const scrollContainer = scrollContainerRef.current;
    const activeElement = scrollContainer.querySelector(`[data-hour-index="${activeHour}"]`);
    
    if (activeElement) {
      const containerWidth = scrollContainer.clientWidth;
      const itemLeft = (activeElement as HTMLElement).offsetLeft;
      const itemWidth = (activeElement as HTMLElement).clientWidth;
      
      scrollContainer.scrollTo({
        left: itemLeft - containerWidth / 2 + itemWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [activeHour]);
    const scrollToNext = () => {
    const nextIndex = Math.min(activeHour + 1, hourlyForecastData.length - 1);
    setActiveHour(nextIndex);
  };
  
  const scrollToPrevious = () => {
    const prevIndex = Math.max(activeHour - 1, 0);
    setActiveHour(prevIndex);
  };
  
  const activeHourData = hourlyForecastData[activeHour];
  
  return (
    <div className="mt-6 bg-card rounded-xl shadow-sm overflow-hidden">
      <h3 className="font-medium p-4 pb-2 text-lg border-b border-border/30">48-Hour Forecast</h3>
      
      {/* Timeline slider with hours */}
      <div className="relative">
        <button 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/70 backdrop-blur-sm p-1 rounded-full shadow-sm hover:bg-background/90 transition-colors"
          onClick={scrollToPrevious}
          disabled={activeHour === 0}
        >
          <ChevronLeft className={`h-5 w-5 ${activeHour === 0 ? 'opacity-50' : 'opacity-100'}`} />
        </button>
          <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto py-4 px-8 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent"
        >
          {hourlyForecastData.map((hour, index) => (
            <div 
              key={index}
              data-hour-index={index}
              className={cn(
                "flex flex-col items-center justify-between px-2 min-w-[70px] cursor-pointer transition-all",
                index === activeHour 
                  ? "scale-110 font-medium" 
                  : "opacity-70 hover:opacity-100"
              )}
              onClick={() => setActiveHour(index)}
            >
              <div className="text-xs mb-1">{formatHourTime(hour.time)}</div>
              <WeatherIcon 
                weatherCode={hour.weather[0].id} 
                className="h-8 w-8 my-1"
              />
              <div className="text-sm mt-1">{Math.round(hour.temp)}{tempUnit}</div>
              
              {/* Rain chance indicator if exists */}
              {hour.pop !== undefined && hour.pop > 0.05 && (
                <div className="mt-1 flex items-center">
                  <Droplet className="h-3 w-3 text-blue-400 mr-1" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(hour.pop * 100)}%
                  </span>
                </div>
              )}
              
              <div 
                className={cn(
                  "h-1 w-1 rounded-full mt-2",
                  index === activeHour ? "bg-primary" : "bg-transparent"
                )}
              />
            </div>
          ))}
        </div>
        
        <button          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/70 backdrop-blur-sm p-1 rounded-full shadow-sm hover:bg-background/90 transition-colors"
          onClick={scrollToNext}
          disabled={activeHour === hourlyForecastData.length - 1}
        >
          <ChevronRight className={`h-5 w-5 ${activeHour === hourlyForecastData.length - 1 ? 'opacity-50' : 'opacity-100'}`} />
        </button>
      </div>
      
      {/* Detailed information for selected hour */}
      <div className="p-4 border-t border-border/30">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium">
            {formatFullDateTime(activeHourData.time)}
          </h4>
          <div className="flex items-center">
            <div className="font-medium text-lg mr-2">{Math.round(activeHourData.temp)}{tempUnit}</div>
            <WeatherIcon 
              weatherCode={activeHourData.weather[0].id} 
              className="h-8 w-8"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Feels Like */}
          <div className="flex items-center p-3 bg-accent/20 rounded-lg">
            <Thermometer className="h-5 w-5 mr-3 text-orange-500" />
            <div>
              <div className="text-xs text-muted-foreground">Feels Like</div>
              <div className="font-medium">{Math.round(activeHourData.feels_like)}{tempUnit}</div>
            </div>
          </div>
          
          {/* Wind */}
          <div className="flex items-center p-3 bg-accent/20 rounded-lg">
            <Wind className="h-5 w-5 mr-3 text-blue-400" />
            <div>
              <div className="text-xs text-muted-foreground">Wind</div>
              <div className="font-medium">
                {Math.round(activeHourData.wind_speed)} {speedUnit} 
                {activeHourData.wind_deg !== undefined && (
                  <span className="text-sm text-muted-foreground ml-1">
                    ({getWindDirection(activeHourData.wind_deg)})
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Humidity */}
          <div className="flex items-center p-3 bg-accent/20 rounded-lg">
            <Droplet className={`h-5 w-5 mr-3 ${getHumidityColor(activeHourData.humidity)}`} />
            <div>
              <div className="text-xs text-muted-foreground">Humidity</div>
              <div className="font-medium">{activeHourData.humidity}%</div>
            </div>
          </div>
          
          {/* UV Index */}
          <div className="flex items-center p-3 bg-accent/20 rounded-lg">
            <Sun className={`h-5 w-5 mr-3 ${getUVIColor(activeHourData.uvi)}`} />
            <div>
              <div className="text-xs text-muted-foreground">UV Index</div>
              <div className="font-medium">
                {activeHourData.uvi?.toFixed(1) || 'N/A'} 
                <span className={`text-xs ml-1 ${getUVIColor(activeHourData.uvi)}`}>
                  ({getUVIDescription(activeHourData.uvi)})
                </span>
              </div>
            </div>
          </div>
          
          {/* Precipitation */}
          <div className="flex items-center p-3 bg-accent/20 rounded-lg">
            <CloudRain className="h-5 w-5 mr-3 text-blue-400" />
            <div>
              <div className="text-xs text-muted-foreground">Precipitation</div>
              <div className="font-medium">
                {activeHourData.pop !== undefined ? `${Math.round(activeHourData.pop * 100)}%` : 'N/A'}
                <span className="text-xs text-muted-foreground ml-1">
                  ({formatRain(activeHourData.rain)})
                </span>
              </div>
            </div>
          </div>
          
          {/* Visibility */}
          <div className="flex items-center p-3 bg-accent/20 rounded-lg">
            <Compass className="h-5 w-5 mr-3 text-gray-400" />
            <div>
              <div className="text-xs text-muted-foreground">Visibility</div>
              <div className="font-medium">{formatVisibility(activeHourData.visibility)}</div>
            </div>
          </div>
          
          {/* Pressure */}
          <div className="flex items-center p-3 bg-accent/20 rounded-lg">
            <div className="h-5 w-5 mr-3 flex items-center justify-center text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v6.5"></path><path d="M17.3 7.7 13.6 11.4"></path><path d="M22 12h-6.5"></path>
                <path d="M16.3 17.3 12.6 13.6"></path><path d="M12 22v-6.5"></path><path d="M7.7 16.3l3.7-3.7"></path>
                <path d="M2 12h6.5"></path><path d="M6.7 7.7l3.7 3.7"></path><path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"></path>
              </svg>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Pressure</div>
              <div className="font-medium">{activeHourData.pressure || 'N/A'} hPa</div>
            </div>
          </div>
          
          {/* Dew Point */}
          <div className="flex items-center p-3 bg-accent/20 rounded-lg">
            <Droplet className="h-5 w-5 mr-3 text-blue-300" />
            <div>
              <div className="text-xs text-muted-foreground">Dew Point</div>
              <div className="font-medium">
                {activeHourData.dew_point !== undefined ? 
                  `${Math.round(activeHourData.dew_point)}${tempUnit}` : 
                  'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

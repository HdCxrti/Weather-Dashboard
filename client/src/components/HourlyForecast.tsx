import { useState, useEffect } from "react";
import { WeatherCondition } from "@/types/weather";
import WeatherIcon from "@/components/WeatherIcon";
import { cn } from "@/lib/utils";
import { Droplet } from "lucide-react";

export interface HourlyForecastItem {
  time: number; // timestamp in seconds
  temp: number;
  feels_like?: number;
  humidity?: number;
  wind_speed?: number;
  weather: WeatherCondition[];
  chance_of_rain?: number;
}

interface HourlyForecastProps {
  hourlyData: HourlyForecastItem[];
  units: "metric" | "imperial";
  selectedCity: string;
}

export default function HourlyForecast({ hourlyData, units, selectedCity }: HourlyForecastProps) {
  const [visibleItems, setVisibleItems] = useState<number>(6); // Number of hours to show
  const tempUnit = units === "imperial" ? "°F" : "°C";
  
  // Format the hour from timestamp
  const formatHour = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  };
  
  // Check if timestamp is for the current day
  const isToday = (timestamp: number) => {
    const today = new Date();
    const itemDate = new Date(timestamp * 1000);
    return itemDate.getDate() === today.getDate() && 
           itemDate.getMonth() === today.getMonth() && 
           itemDate.getFullYear() === today.getFullYear();
  };
  
  // Get label for the hour (Today or Tomorrow + time)
  const getTimeLabel = (timestamp: number) => {
    if (isToday(timestamp)) {
      return formatHour(timestamp);
    } else {
      return "Tom " + formatHour(timestamp);
    }
  };
  
  // Only show next hours (from current hour)
  const currentHour = new Date().getHours();
  const upcomingHours = hourlyData.filter((item, index) => {
    const itemHour = new Date(item.time * 1000).getHours();
    const itemDay = new Date(item.time * 1000).getDate();
    const today = new Date().getDate();
    
    // Include if it's later today or tomorrow, or if we have fewer than 12 items total
    return (itemDay === today && itemHour > currentHour) || 
           itemDay > today || 
           index < 12;
  }).slice(0, 24); // Ensure we only show up to 24 hours
  
  // Show the next 'visibleItems' hours
  const displayHours = upcomingHours.slice(0, visibleItems);
  
  // Calculate number of visible items based on screen width
  useEffect(() => {
    const handleResize = () => {
      // Adjust number of initially visible items based on container width
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleItems(4); // xs screens
      } else if (width < 768) {
        setVisibleItems(6); // sm screens
      } else {
        setVisibleItems(8); // md and larger screens
      }
    };
    
    // Set initial value
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="p-3 sm:p-4 bg-card/95 backdrop-blur-sm rounded-md shadow-sm border border-border/30">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-sm sm:text-lg font-medium truncate">Hourly Forecast</h3>
        <div className="text-xs sm:text-sm text-muted-foreground truncate">{selectedCity}</div>
      </div>
      
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 sm:gap-3 min-w-max">
          {displayHours.map((hour, index) => {
            // Calculate opacity based on precipitation chance
            const precipChance = hour.chance_of_rain || 0;
            const precipOpacity = Math.max(0.3, precipChance);
            
            return (
              <div 
                key={index} 
                className={cn(
                  "flex flex-col items-center justify-between p-2 sm:p-3 min-w-[60px] sm:min-w-[70px]",
                  "rounded-lg transition-colors",
                  index === 0 ? "bg-accent/40" : "bg-accent/20 hover:bg-accent/30"
                )}
              >
                <div className="text-[10px] sm:text-xs font-medium">{getTimeLabel(hour.time)}</div>
                <WeatherIcon 
                  weatherCode={hour.weather[0].id} 
                  className="h-5 w-5 sm:h-7 sm:w-7 my-1 sm:my-2"
                />
                <div className="text-xs sm:text-sm font-medium">{Math.round(hour.temp)}{tempUnit}</div>
                
                {/* Rain chance indicator */}
                {hour.chance_of_rain !== undefined && hour.chance_of_rain > 0.05 && (
                  <div className="mt-1 flex items-center">
                    <Droplet 
                      className="h-2 w-2 sm:h-3 sm:w-3 text-blue-500 mr-1" 
                      style={{ opacity: precipOpacity }}
                    />
                    <span className="text-[9px] sm:text-xs text-muted-foreground">
                      {Math.round(hour.chance_of_rain * 100)}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {upcomingHours.length > visibleItems && (
        <button 
          className="text-[10px] sm:text-xs text-primary font-medium mt-2 sm:mt-3 hover:underline flex items-center justify-center w-full"
          onClick={() => setVisibleItems(prev => Math.min(prev + 4, upcomingHours.length))}
        >
          Show more hours
        </button>
      )}
    </div>
  );
}

import WeatherIcon from "@/components/WeatherIcon";
import { DailyForecast } from "@/types/weather";

interface WeeklyForecastProps {
  forecast: DailyForecast[];
  units: "metric" | "imperial";
}

export default function WeeklyForecast({ forecast, units }: WeeklyForecastProps) {
  const tempUnit = units === "imperial" ? "F" : "C";
  
  // Day of week formatter
  const formatDay = (timestamp: number) => {
    return new Date(timestamp * 1000)
      .toLocaleDateString('en-US', { weekday: 'short' })
      .toLowerCase();
  };

  return (
    <div className="mt-6">
      <div className="grid grid-cols-7 gap-2">
        {forecast.slice(0, 7).map((day, index) => (
          <div 
            key={index} 
            className="bg-[#202835] rounded-lg p-4 flex flex-col items-center"
          >
            <span className="text-sm mb-2 text-gray-400">
              {formatDay(day.dt)}
            </span>
            <WeatherIcon 
              weatherCode={day.weather[0].id} 
              className="text-xl mb-2 h-8 w-8" 
            />
            <span className="font-medium text-base mt-1">
              {Math.round(day.temp.max)}°{tempUnit}
            </span>
            <span className="text-xs text-gray-400">
              {Math.round(day.temp.min)}°{tempUnit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

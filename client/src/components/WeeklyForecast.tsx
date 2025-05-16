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
      <h3 className="font-medium mb-4">7-Day Forecast</h3>
      <div className="grid grid-cols-7 gap-2 overflow-x-auto">
        {forecast.map((day, index) => (
          <div 
            key={day.dt} 
            className={`flex flex-col items-center rounded-lg p-2 ${index === 0 ? "bg-accent" : "bg-muted"} text-center`}
          >
            <span className="text-xs font-medium text-foreground uppercase">{index === 0 ? 'Today' : formatDay(day.dt)}</span>
            <WeatherIcon 
              weatherCode={day.weather[0].id} 
              className="h-12 w-12 my-2" 
            />
            <span className="text-xs mb-1 capitalize text-muted-foreground">{day.weather[0].description}</span>
            <div className="text-sm">
              <span className="font-medium">{Math.round(day.temp.day)}°</span>
              <span className="text-muted-foreground ml-1">{Math.round(day.temp.night)}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

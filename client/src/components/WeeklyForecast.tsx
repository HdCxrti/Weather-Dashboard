import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="rounded-2xl">
      <CardContent className="p-6">
        <div className="grid grid-cols-7 gap-3">
          {forecast.slice(0, 7).map((day, index) => (
            <div 
              key={index} 
              className="bg-[#2d3246] rounded-lg p-3 flex flex-col items-center"
            >
              <span className="text-sm mb-2 text-muted-foreground">
                {formatDay(day.dt)}
              </span>
              <WeatherIcon 
                weatherCode={day.weather[0].id} 
                className="text-xl mb-2 h-8 w-8" 
              />
              <span className="font-medium text-base">
                {Math.round(day.temp.max)}°{tempUnit}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(day.temp.min)}°{tempUnit}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

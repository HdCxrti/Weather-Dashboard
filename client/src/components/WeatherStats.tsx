import { Cloud, Droplet, Gauge, Sunrise, Sunset, Thermometer } from "lucide-react";

interface WeatherStatsProps {
  cityName: string;
  aqi?: number; // Air Quality Index
  uvIndex?: number;
  humidity?: number;
  dewPoint?: number;
  precipitation?: number; // Probability of precipitation
  windGust?: number; // in same units as current wind display
  units: "metric" | "imperial";
}

// Sample mock data
const mockWeatherStats = {
  aqi: 38,
  uvIndex: 5.2,
  humidity: 65,
  dewPoint: 56,
  precipitation: 20,
  windGust: 22
};

export default function WeatherStats({ 
  cityName, 
  aqi = mockWeatherStats.aqi, 
  uvIndex = mockWeatherStats.uvIndex, 
  humidity = mockWeatherStats.humidity,
  dewPoint = mockWeatherStats.dewPoint,
  precipitation = mockWeatherStats.precipitation,
  windGust = mockWeatherStats.windGust,
  units 
}: WeatherStatsProps) {
  const tempUnit = units === "imperial" ? "°F" : "°C";
  const speedUnit = units === "imperial" ? "mph" : "m/s";

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return { label: "Good", color: "text-green-500" };
    if (aqi <= 100) return { label: "Moderate", color: "text-yellow-500" };
    if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "text-orange-500" };
    if (aqi <= 200) return { label: "Unhealthy", color: "text-red-500" };
    if (aqi <= 300) return { label: "Very Unhealthy", color: "text-purple-500" };
    return { label: "Hazardous", color: "text-rose-800" };
  };

  const getUVCategory = (uv: number) => {
    if (uv < 3) return { label: "Low", color: "text-green-500" };
    if (uv < 6) return { label: "Moderate", color: "text-yellow-500" };
    if (uv < 8) return { label: "High", color: "text-orange-500" };
    if (uv < 11) return { label: "Very High", color: "text-red-500" };
    return { label: "Extreme", color: "text-purple-500" };
  };

  const aqiInfo = getAQICategory(aqi);
  const uvInfo = getUVCategory(uvIndex);

  return (
    <div className="bg-accent rounded-xl p-6 shadow-sm text-foreground">
      <h3 className="font-medium mb-4">Weather Insights</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Air Quality */}
        <div className="bg-card/80 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Air Quality</span>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-medium">{aqi}</span>
            <span className={`text-xs ${aqiInfo.color}`}>{aqiInfo.label}</span>
          </div>
        </div>
        
        {/* UV Index */}
        <div className="bg-card/80 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">UV Index</span>
            <Sunrise className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-medium">{uvIndex}</span>
            <span className={`text-xs ${uvInfo.color}`}>{uvInfo.label}</span>
          </div>
        </div>
        
        {/* Dew Point */}
        <div className="bg-card/80 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Dew Point</span>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-medium">{dewPoint}{tempUnit}</span>
          </div>
        </div>
        
        {/* Humidity */}
        <div className="bg-card/80 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Humidity</span>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-medium">{humidity}%</span>
          </div>
        </div>
        
        {/* Precipitation */}
        <div className="bg-card/80 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Chance of Rain</span>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-medium">{precipitation}%</span>
          </div>
        </div>
        
        {/* Wind Gust */}
        <div className="bg-card/80 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Wind Gust</span>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-medium">{windGust} {speedUnit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { 
  Sun, 
  Cloud, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  CloudFog, 
  CloudLightning, 
  CloudSun
} from "lucide-react";

interface WeatherIconProps {
  weatherCode: number;
  className?: string;
}

export default function WeatherIcon({ weatherCode, className = "" }: WeatherIconProps) {
  // Map OpenWeatherMap codes to appropriate icons
  // See: https://openweathermap.org/weather-conditions
  
  // Thunderstorm: 200-299
  if (weatherCode >= 200 && weatherCode < 300) {
    return <CloudLightning className={className} color="#F1F1F1" />;
  }
  
  // Drizzle: 300-399
  if (weatherCode >= 300 && weatherCode < 400) {
    return <CloudDrizzle className={className} color="#A4B0BE" />;
  }
  
  // Rain: 500-599
  if (weatherCode >= 500 && weatherCode < 600) {
    return <CloudRain className={className} color="#A4B0BE" />;
  }
  
  // Snow: 600-699
  if (weatherCode >= 600 && weatherCode < 700) {
    return <CloudSnow className={className} color="#F1F1F1" />;
  }
  
  // Atmosphere (fog, mist, etc): 700-799
  if (weatherCode >= 700 && weatherCode < 800) {
    return <CloudFog className={className} color="#A4B0BE" />;
  }
  
  // Clear: 800
  if (weatherCode === 800) {
    return <Sun className={className} color="#FFD700" />;
  }
  
  // Clouds: 801-804
  if (weatherCode === 801) {
    return <CloudSun className={className} color="#A4B0BE" />;
  }
  
  if (weatherCode >= 802 && weatherCode <= 804) {
    return <Cloud className={className} color="#A4B0BE" />;
  }
  
  // Default fallback
  return <Cloud className={className} color="#A4B0BE" />;
}

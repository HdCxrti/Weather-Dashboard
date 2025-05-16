import { Skeleton } from "@/components/ui/skeleton";
import WeatherIcon from "@/components/WeatherIcon";
import { OtherCityWeather } from "@/types/weather";

interface OtherCitiesProps {
  citiesData: OtherCityWeather[];
  isLoading: boolean;
  units: "metric" | "imperial";
}

export default function OtherCities({ citiesData, isLoading, units }: OtherCitiesProps) {
  const tempUnit = units === "imperial" ? "F" : "C";

  return (
    <div className="bg-card text-card-foreground shadow-sm rounded-3xl overflow-hidden">
      <div className="p-6">
        <h2 className="font-medium mb-4">Other Cities</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {citiesData.map((city) => (
              <div 
                key={`${city.name}-${city.country}`}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-accent p-1 flex items-center justify-center">
                    <WeatherIcon 
                      weatherCode={city.weather[0].id} 
                      className="h-8 w-8"
                    />
                  </div>
                  
                  <div className="ml-3">
                    <p className="font-medium">{city.name}</p>
                    <p className="text-xs text-muted-foreground">{city.country}</p>
                  </div>
                </div>
                
                <div className="text-xl font-medium">
                  {Math.round(city.temp)}°{tempUnit}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

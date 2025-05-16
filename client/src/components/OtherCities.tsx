import { Skeleton } from "@/components/ui/skeleton";
import WeatherIcon from "@/components/WeatherIcon";
import { OtherCityWeather } from "@/types/weather";

interface OtherCitiesProps {
  citiesData?: OtherCityWeather[];
  isLoading: boolean;
  units: "metric" | "imperial";
}

export default function OtherCities({ citiesData, isLoading, units }: OtherCitiesProps) {
  const tempUnit = units === "imperial" ? "F" : "C";

  return (
    <div className="bg-[#1e1e1e] rounded-3xl h-full">
      <div className="p-6">
        <h2 className="text-xl font-medium mb-6">Forecast in My Favorite Cities</h2>
        
        {isLoading ? (
          <div className="space-y-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border-b border-gray-700 pb-5 last:border-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-5 w-24 mb-1 bg-gray-700" />
                    <Skeleton className="h-3 w-8 bg-gray-700" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-5 w-5 mr-3 rounded-full bg-gray-700" />
                    <Skeleton className="h-5 w-10 bg-gray-700" />
                  </div>
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {citiesData?.map((city, index) => (
              <div key={index} className="border-b border-gray-700 pb-5 last:border-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{city.name}</h3>
                    <span className="text-xs text-gray-400">{city.country}</span>
                  </div>
                  <div className="flex items-center">
                    <WeatherIcon 
                      weatherCode={city.weather[0].id} 
                      className="mr-3 h-5 w-5" 
                    />
                    <span className="font-semibold">{Math.round(city.temp)}°{tempUnit}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {city.weather[0].main === "Clouds" && city.weather[0].description.includes("overcast") ? (
                      "Overcast"
                    ) : (
                      city.weather[0].main
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

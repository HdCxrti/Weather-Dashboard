import WeatherIcon from "@/components/WeatherIcon";
import { OtherCityWeather } from "@/types/weather";

interface FavoriteCitiesProps {
  favorites: OtherCityWeather[];
  onRemove: (name: string) => void;
}

export default function FavoriteCities({ favorites, onRemove }: FavoriteCitiesProps) {
  // Add a click handler prop for selecting a city
  const handleCityClick = (city: string) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('favoriteCitySelected', { detail: city });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="font-medium mb-4">Favorite Cities</h3>
      <ul>
        {favorites.map(city => (
          <li
            key={city.name}
            className="flex items-center justify-between mb-2 bg-muted rounded p-2 cursor-pointer hover:bg-accent/60 transition-colors"
            onClick={() => handleCityClick(city.name)}
          >
            <div className="flex items-center">
              <div className="rounded-full bg-accent p-1 flex items-center justify-center mr-3">
                {Array.isArray(city.weather) && city.weather[0] ? (
                  <WeatherIcon weatherCode={city.weather[0].id} className="h-8 w-8" />
                ) : (
                  <span className="h-8 w-8 inline-block" />
                )}
              </div>
              <div>
                <div className="font-medium leading-tight">{city.name.charAt(0).toUpperCase() + city.name.slice(1)}</div>
                {/* Do not render state or country at all */}
              </div>
            </div>
            <div className="flex flex-col items-end ml-4" onClick={e => e.stopPropagation()}>
              <div className="text-xl font-medium">
                {typeof city.temp === 'number' ? Math.round(city.temp) + '°' : '--'}
              </div>
              <div className="text-xs text-muted-foreground">
                {Array.isArray(city.weather) && city.weather[0] ? city.weather[0].main : '--'}
              </div>
              <button
                className="text-red-500 hover:underline text-xs mt-1"
                onClick={() => onRemove(city.name)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {favorites.length === 0 && <li className="text-muted-foreground">No favorites yet.</li>}
      </ul>
    </div>
  );
}

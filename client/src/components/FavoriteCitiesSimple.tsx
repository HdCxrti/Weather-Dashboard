import React, { useState } from "react";
import { OtherCityWeather } from "@/types/weather";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import WeatherIcon from "@/components/WeatherIcon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FavoriteCitiesProps {
  citiesData: OtherCityWeather[];
  isLoading: boolean;
  units: "metric" | "imperial";
  onAddFavorite?: (cityName: string) => void;
  favorites: string[];
  onFavoritesChange: (favorites: string[]) => void;
}

const FavoriteCitiesSimple: React.FC<FavoriteCitiesProps> = ({
  citiesData,
  isLoading,
  units,
  onAddFavorite,
  favorites,
  onFavoritesChange
}) => {
  const tempUnit = units === "imperial" ? "F" : "C";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);

  // Mock city search - simplified version
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setNewCity(query);
    
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    // This is mock data for simplicity
    const mockCityDatabase = [
      "New York", "London", "Tokyo", "Paris", "Berlin", "Sydney",
      "Moscow", "Beijing", "Dubai", "Toronto", "Mexico City", "São Paulo",
      "Los Angeles", "Chicago", "Miami", "Seattle", "Denver",
      "Hedgesville", "Martinsburg", "Beckley" // From previous examples
    ];
    
    setSearchResults(
      mockCityDatabase
        .filter(city => city.toLowerCase().includes(query.toLowerCase()))
        .filter(city => !favorites.includes(city))
        .slice(0, 5)
    );
  };

  // Add city to favorites
  const addCityToFavorites = (cityName: string) => {
    if (!cityName || favorites.includes(cityName)) return;
    
    const updatedFavorites = [...favorites, cityName];
    onFavoritesChange(updatedFavorites);
    setNewCity("");
    setDialogOpen(false);
    
    // Optionally switch to this city
    if (onAddFavorite) {
      onAddFavorite(cityName);
    }
  };

  // Remove city from favorites
  const removeCityFromFavorites = (cityName: string) => {
    const updatedFavorites = favorites.filter(city => city !== cityName);
    onFavoritesChange(updatedFavorites);
  };

  return (
    <div className="bg-card text-card-foreground shadow-sm rounded-3xl overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium">Favorite Cities</h2>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add City
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add a city to favorites</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  value={newCity}
                  onChange={handleSearchChange}
                  placeholder="Search for a city..."
                  className="col-span-3"
                />
                {searchResults.length > 0 ? (
                  <ul className="space-y-2">
                    {searchResults.map(result => (
                      <li key={result}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => addCityToFavorites(result)}
                        >
                          {result}
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : newCity.trim() !== "" ? (
                  <p className="text-sm text-muted-foreground">No cities found. Try a different search.</p>
                ) : null}
              </div>
              <DialogFooter>
                <Button 
                  variant="secondary" 
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                {newCity.trim() !== "" && (
                  <Button 
                    onClick={() => addCityToFavorites(newCity)}
                    variant="default"
                  >
                    Add
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="py-2">Loading your favorite cities...</p>
        ) : citiesData.length === 0 || favorites.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-2">No favorite cities available.</p>
            <p className="text-xs text-muted-foreground">Add cities to track their weather</p>
          </div>
        ) : (
          <div className="space-y-3">
            {citiesData
              .filter(city => favorites.includes(city.name))
              .map((city) => (                <div 
                  key={city.name}
                  className="flex items-center justify-between p-2 hover:bg-accent/25 rounded-lg cursor-pointer group"
                  onClick={() => onAddFavorite?.(city.name)}
                >
                  <div className="flex items-center gap-2">
                    {city.weather && city.weather[0] && (
                      <div className="h-8 w-8">
                        <WeatherIcon 
                          weatherCode={city.weather[0].id} 
                          className="h-6 w-6"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{city.name}</p>
                      {city.weather && city.weather[0] && (
                        <p className="text-xs text-muted-foreground">
                          {city.weather[0].description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {Math.round(city.temp)}°{tempUnit}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCityFromFavorites(city.name);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoriteCitiesSimple;

import { Skeleton } from "@/components/ui/skeleton";
import WeatherIcon from "@/components/WeatherIcon";
import { OtherCityWeather } from "@/types/weather";
import { useState, useEffect, useCallback } from "react";
import { Heart, Plus, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface FavoriteCitiesProps {
  citiesData?: OtherCityWeather[];
  isLoading?: boolean;
  units?: "metric" | "imperial";
  onAddFavorite?: (cityName: string) => void;
  favorites?: OtherCityWeather[];
  onRemove?: (name: string) => void;
}

export default function FavoriteCities({ 
  citiesData = [], 
  isLoading = false, 
  units = "imperial", 
  onAddFavorite,
  favorites = [],
  onRemove
}: FavoriteCitiesProps) {
  const tempUnit = units === "imperial" ? "F" : "C";
  const { toast } = useToast();
  const [internalFavorites, setInternalFavorites] = useState<string[]>([]);
  const [newCity, setNewCity] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Handle click event for selecting a city
  const handleCityClick = (city: string) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('favoriteCitySelected', { detail: city });
      window.dispatchEvent(event);
    }
  };
  
  // Use either external favorites (controlled mode) or internal favorites (uncontrolled mode)
  const isControlled = favorites !== undefined && onRemove !== undefined;
  const favoriteCities = isControlled ? favorites : internalFavorites.map(name => ({
    name,
    country: '',
    temp: 0,
    weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '' }]
  }));
  
  // Load favorites from localStorage only in uncontrolled mode
  useEffect(() => {
    if (!isControlled) {
      const storedFavorites = localStorage.getItem("favoriteCities");
      if (storedFavorites) {
        try {
          setInternalFavorites(JSON.parse(storedFavorites));
        } catch (e) {
          console.error("Failed to parse favorites:", e);
          setInternalFavorites([]);
        }
      }
    }
  }, [isControlled]);

  // Save favorites to localStorage whenever they change (uncontrolled mode)
  useEffect(() => {
    if (!isControlled) {
      localStorage.setItem("favoriteCities", JSON.stringify(internalFavorites));
    }
  }, [internalFavorites, isControlled]);
  
  // Mock city search - In a real app, this would call an API
  const searchCities = useCallback((query: string) => {
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    // Simulate API search with a timeout
    setTimeout(() => {
      // This is mock data - in real app you would make an API call to search for cities
      const mockCityDatabase = [
        "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
        "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville",
        "Fort Worth", "Columbus", "San Francisco", "Charlotte", "Indianapolis",
        "Seattle", "Denver", "Washington", "Boston", "El Paso", "Nashville",
        "Detroit", "Portland", "Las Vegas", "Memphis", "Louisville", "Milwaukee",
        "Baltimore", "Albuquerque", "Tucson", "Fresno", "Sacramento", "Kansas City",
        "Miami", "Atlanta", "Cleveland", "Raleigh", "Omaha", "Arlington"
      ];
      
      // Filter cities that match the query
      const results = mockCityDatabase
        .filter(city => 
          city.toLowerCase().includes(query.toLowerCase()) && 
          !favoriteCities.some(fav => fav.name === city)
        )
        .slice(0, 5); // Limit to 5 results
      
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  }, [favoriteCities]);  
  
  // Trigger search when newCity changes
  useEffect(() => {
    searchCities(newCity);
  }, [newCity, searchCities]);

  const updateFavorites = (cityName: string, action: 'add' | 'remove') => {
    if (isControlled && onRemove && action === 'remove') {
      onRemove(cityName);
    } else if (isControlled && onAddFavorite && action === 'add') {
      onAddFavorite(cityName);
    } else {
      // Handle internal state
      if (action === 'add') {
        setInternalFavorites(prev => [...prev, cityName]);
      } else {
        setInternalFavorites(prev => prev.filter(city => city !== cityName));
      }
    }
  };

  const addFavorite = (cityName: string) => {
    if (cityName && !favoriteCities.some(city => city.name.toLowerCase() === cityName.toLowerCase())) {
      updateFavorites(cityName, 'add');
      
      toast({
        title: "City added",
        description: `${cityName} has been added to your favorites`,
      });
    }
    setNewCity("");
    setSearchResults([]);
    setDialogOpen(false);
  };

  const removeFavorite = (cityName: string) => {
    updateFavorites(cityName, 'remove');
    
    toast({
      title: "City removed",
      description: `${cityName} has been removed from your favorites`,
      variant: "destructive",
    });
  };

  // Check if we have any favorite cities data
  const hasFavoritesData = favoriteCities.length > 0;

  return (
    <div className="bg-card text-card-foreground shadow-sm rounded-3xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">Favorite Cities</h2>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add City
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add to Favorites</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                  <Input 
                    placeholder="Search for a city..." 
                    value={newCity} 
                    onChange={(e) => setNewCity(e.target.value)} 
                    className="mb-2"
                  />
                  
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {isSearching ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-r-transparent rounded-full"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="divide-y divide-border">
                        {searchResults.map(city => (
                          <div 
                            key={city} 
                            className="py-2 px-2 cursor-pointer hover:bg-muted flex justify-between items-center"
                            onClick={() => addFavorite(city)}
                          >
                            <span>{city}</span>
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    ) : newCity ? (
                      <div className="py-4 text-center text-muted-foreground">
                        No cities found matching "{newCity}"
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => addFavorite(newCity)}
                          >
                            Add "{newCity}" anyway
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                
                {favoriteCities.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Current favorites:</p>
                    <div className="flex flex-wrap gap-1">
                      {favoriteCities.map(city => (
                        <div 
                          key={city.name}
                          className="bg-muted text-muted-foreground rounded-full text-xs px-2 py-1 flex items-center gap-1"
                        >
                          {city.name}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeFavorite(city.name)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setDialogOpen(false);
                    setNewCity("");
                    setSearchResults([]);
                  }}
                >
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
        ) : hasFavoritesData ? (
          <div className="space-y-6">
            {favoriteCities.map((city) => (
              <div 
                key={`${city.name}-${city.country}`}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0 group cursor-pointer"
                onClick={() => handleCityClick(city.name)}
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-accent p-1 flex items-center justify-center">
                    {Array.isArray(city.weather) && city.weather[0] ? (
                      <WeatherIcon 
                        weatherCode={city.weather[0].id} 
                        className="h-8 w-8"
                      />
                    ) : (
                      <span className="h-8 w-8 inline-block" />
                    )}
                  </div>
                  
                  <div className="ml-3">
                    <p className="font-medium">{city.name}</p>
                    {city.country && <p className="text-xs text-muted-foreground">{city.country}</p>}
                  </div>
                </div>
                
                <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                  {typeof city.temp === 'number' && (
                    <div className="text-xl font-medium">
                      {Math.round(city.temp)}°{tempUnit}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFavorite(city.name)}
                    title={`Remove ${city.name} from favorites`}
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No favorite cities yet</p>
            <p className="text-xs text-muted-foreground/70 mb-4">Add cities to keep track of their weather</p>
            <Button
              size="sm"
              variant="outline"
              className="mx-auto"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Your First City
            </Button>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground/70">Popular cities: New York, London, Tokyo, Paris</p>
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {["New York", "London", "Tokyo", "Paris"].map(suggestion => (
                  <Button
                    key={suggestion}
                    size="sm"
                    variant="ghost"
                    className="text-xs py-1 h-auto"
                    onClick={() => addFavorite(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {favoriteCities.length > 0 && !citiesData.length && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Your favorite cities: {favoriteCities.map(city => city.name).join(", ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

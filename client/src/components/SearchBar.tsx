import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (city: string) => void;
  onUnitToggle: () => void;
  units: "metric" | "imperial";
  initialCity: string;
  onGeolocation?: () => void;
}

export default function SearchBar({ onSearch, onUnitToggle, units, initialCity, onGeolocation }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialCity);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const handleSearch = () => {
    // Pass the search query to the parent component
    // The actual cleaning of city name will happen in Home.tsx
    onSearch(searchQuery);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };  
  // Use theme variables from tailwind config
  const bgColor = "bg-background";
  const inputTextColor = "text-foreground";
  const placeholderColor = "placeholder:text-muted-foreground";
  // Add a border and shadow for better depth perception - different for light/dark modes
  const containerStyle = "border border-input shadow-sm hover:border-primary/50 transition-colors";

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center ${bgColor} rounded-lg h-10 px-2 ${containerStyle}`}>
        <Search className="h-4 w-4 text-muted-foreground mr-2" />        <Input 
          type="text" 
          placeholder="Search City..." 
          className={`bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-full text-sm ${placeholderColor} ${inputTextColor} transition-colors`}
          style={{ 
            caretColor: "var(--primary)"
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        /><Button 
          className="bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground rounded h-7 w-7 p-0 transition-all"
          onClick={handleSearch}
          type="button"
          size="sm"
          aria-label="Search"
        >
          <Search className="h-3.5 w-3.5" />
        </Button>      </div>
      <div className={`flex items-center justify-center ${bgColor} rounded-lg h-10 px-3 ${containerStyle}`}>        <div 
          className="relative w-14 h-6 flex items-center bg-muted hover:bg-muted/80 rounded-full p-1 cursor-pointer transition-colors"
          onClick={onUnitToggle}
          role="switch"
          aria-checked={units === "metric"}
          title={units === "metric" ? "Switch to Imperial (°F)" : "Switch to Metric (°C)"}
        >
          {/* Unit indicators */}          <span className={`absolute text-xs font-medium left-2 transition-opacity ${units === "metric" ? "opacity-40" : "opacity-100"} text-foreground/80`}>°F</span>
          <span className={`absolute text-xs font-medium right-2 transition-opacity ${units === "metric" ? "opacity-100" : "opacity-40"} text-foreground/80`}>°C</span>
          
          {/* Toggle handle */}          <div 
            className={`bg-primary w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out z-10 ${
              units === "metric" ? "translate-x-7" : "translate-x-0"
            }`}
            aria-hidden="true"
          >
            <span className="sr-only">{units === "metric" ? "Metric" : "Imperial"}</span>
          </div>
        </div>
      </div>      <Button        onClick={() => {
          if (onGeolocation) {
            setIsGeolocating(true);
            onGeolocation();
            // Reset the loading state after a timeout in case the geolocation fails silently
            setTimeout(() => setIsGeolocating(false), 10000);
          }
        }}
        disabled={isGeolocating}
        className={`bg-muted text-muted-foreground hover:bg-muted/80 rounded-full h-10 w-10 p-0 transition-all`}
        aria-label="Use Geolocation"
        title="Use Geolocation"
      >
        {isGeolocating ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <MapPin className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}

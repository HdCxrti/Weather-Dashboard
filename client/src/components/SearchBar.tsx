import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (city: string) => void;
  onUnitToggle: () => void;
  units: "metric" | "imperial";
  initialCity: string;
}

export default function SearchBar({ onSearch, onUnitToggle, units, initialCity }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialCity);

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center bg-[#25252a] rounded-lg h-10 px-2">
        <Search className="h-4 w-4 text-gray-400 mr-2" />
        <Input 
          type="text" 
          placeholder="Search City..." 
          className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-full text-sm placeholder:text-gray-500 text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button 
          className="bg-[#3a3a3e] hover:bg-[#4a4a50] text-white rounded h-7 w-7 p-0"
          onClick={handleSearch}
          type="button"
          size="sm"
        >
          <Search className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      <div className="flex items-center justify-center bg-[#25252a] rounded-lg h-10 px-3">
        <div 
          className="w-12 h-6 flex items-center bg-[#3a3a3e] rounded-full p-1 cursor-pointer"
          onClick={onUnitToggle}
        >
          <div 
            className={`bg-blue-400 w-5 h-5 rounded-full shadow-md transform transition-transform ${
              units === "metric" ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

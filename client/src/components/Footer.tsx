import React from "react";
import { Github } from "lucide-react";

interface FooterProps {
  lastUpdated?: Date;
}

export default function Footer({ lastUpdated = new Date() }: FooterProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (    <footer className="mt-8 py-6 border-t border-border/30">
      <div className="w-full mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-3">Weather Dashboard</h4>
            <p className="text-xs text-muted-foreground">
              Providing accurate and detailed weather information for locations worldwide.
              Plan your day with confidence using our comprehensive forecasts.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-3">Data Sources</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>Weather data: OpenWeatherMap API</li>
              <li>Maps: OpenStreetMap / Leaflet</li>
              <li>Geocoding: Nominatim</li>
              <li>Icons: Lucide React</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-3">About</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-center">
                <Github className="h-3.5 w-3.5 mr-1.5" />
                <a href="https://github.com/your-username/Weather-Dashboard" className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">
                  GitHub Repository
                </a>
              </li>
              <li>Built with React, TypeScript, and Tailwind CSS</li>
              <li>Last updated: {formatDate(lastUpdated)}</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-border/10 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground mb-2 sm:mb-0">
            © {new Date().getFullYear()} Weather Dashboard. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </button>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </button>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

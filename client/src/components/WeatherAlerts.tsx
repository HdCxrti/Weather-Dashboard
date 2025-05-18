import { useState } from "react";
import { AlertCircle } from "lucide-react";

// Sample weather alerts data structure
export interface WeatherAlert {
  id: string;
  severity: "minor" | "moderate" | "severe" | "extreme";
  title: string;
  description: string;
  start: number; // timestamp
  end: number; // timestamp
  source: string;
}

interface WeatherAlertsProps {
  alerts?: WeatherAlert[];
  cityName: string;
}

// Helper function to format alert time
function formatAlertTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Helper function to format alert date
function formatAlertDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

// Sample mock alerts for demonstration
const mockAlerts: WeatherAlert[] = [
  {
    id: "alert-1",
    severity: "moderate",
    title: "Wind Advisory",
    description: "The National Weather Service has issued a Wind Advisory for this area. Expect winds of 15-25 mph with gusts up to 35 mph.",
    start: Math.floor(Date.now() / 1000),
    end: Math.floor(Date.now() / 1000) + 86400, // 24 hours later
    source: "National Weather Service"
  },
  {
    id: "alert-2", 
    severity: "minor",
    title: "Air Quality Alert",
    description: "Air quality may be unhealthy for sensitive groups due to elevated particle levels.",
    start: Math.floor(Date.now() / 1000),
    end: Math.floor(Date.now() / 1000) + 43200, // 12 hours later
    source: "Environmental Protection Agency"
  }
];

export default function WeatherAlerts({ alerts = mockAlerts, cityName }: WeatherAlertsProps) {
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case "minor": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "moderate": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "severe": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "extreme": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  const toggleAlert = (id: string) => {
    setExpandedAlertId(expandedAlertId === id ? null : id);
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-sm text-foreground h-full">
        <h3 className="font-medium mb-3">Weather Alerts</h3>
        <div className="flex flex-col items-center justify-center h-[calc(100%-2rem)] text-muted-foreground">
          <p>No active weather alerts for {cityName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm text-foreground h-full">
      <h3 className="font-medium mb-3">Weather Alerts</h3>
      <div className="space-y-3">
        {alerts.map(alert => (
          <div 
            key={alert.id} 
            className={`${getSeverityColor(alert.severity)} rounded-lg p-3 transition-all duration-200 cursor-pointer`}
            onClick={() => toggleAlert(alert.id)}
          >
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
              <div className="w-full">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{alert.title}</h4>
                  <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-background/20">
                    {alert.severity}
                  </span>
                </div>
                <div className="text-xs mt-1">
                  {formatAlertDate(alert.start)} {formatAlertTime(alert.start)} - {formatAlertDate(alert.end)} {formatAlertTime(alert.end)}
                </div>
                
                {expandedAlertId === alert.id && (
                  <div className="mt-2 text-sm animate-fadeIn">
                    <p>{alert.description}</p>
                    <p className="mt-2 text-xs italic">Source: {alert.source}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

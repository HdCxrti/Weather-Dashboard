import React from 'react';

interface AQIGaugeProps {
  aqi: number | null | undefined;
}

const AQIGauge: React.FC<AQIGaugeProps> = ({ aqi }) => {
  // If no AQI data, return null
  if (aqi === null || aqi === undefined) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No air quality data available</p>
      </div>
    );
  }

  // AQI Levels according to EPA standards
  // 0-50: Good
  // 51-100: Moderate
  // 101-150: Unhealthy for Sensitive Groups
  // 151-200: Unhealthy
  // 201-300: Very Unhealthy
  // 301+: Hazardous
  
  // Determine the level and color based on AQI value
  let level = '';
  let color = '';
  let recommendation = '';
  
  if (aqi <= 50) {
    level = 'Good';
    color = 'bg-green-500';
    recommendation = 'Air quality is satisfactory, and air pollution poses little or no risk.';
  } else if (aqi <= 100) {
    level = 'Moderate';
    color = 'bg-yellow-400';
    recommendation = 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.';
  } else if (aqi <= 150) {
    level = 'Unhealthy for Sensitive Groups';
    color = 'bg-orange-400';
    recommendation = 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
  } else if (aqi <= 200) {
    level = 'Unhealthy';
    color = 'bg-red-500';
    recommendation = 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.';
  } else if (aqi <= 300) {
    level = 'Very Unhealthy';
    color = 'bg-purple-600';
    recommendation = 'Health alert: The risk of health effects is increased for everyone.';
  } else {
    level = 'Hazardous';
    color = 'bg-rose-900';
    recommendation = 'Health warning of emergency conditions: everyone is more likely to be affected.';
  }

  // Calculate percentage for the gauge
  const percentage = Math.min(aqi / 4, 100); // Max out at 400 AQI
  
  return (
    <div className="flex flex-col items-center p-2">
      <p className="text-lg font-medium mb-2">Air Quality Index</p>
      <div className="w-full h-4 bg-muted rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between w-full text-xs text-muted-foreground mb-3">
        <span>0</span>
        <span>100</span>
        <span>200</span>
        <span>300</span>
        <span>400+</span>
      </div>
      <div className="text-center">
        <p className="font-medium">
          {level} ({Math.round(aqi)})
        </p>
        <p className="text-sm text-muted-foreground mt-1">{recommendation}</p>
      </div>
    </div>
  );
};

export default AQIGauge;

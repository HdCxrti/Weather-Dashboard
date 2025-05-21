import React from 'react';

interface WeatherBackgroundProps {
  weatherCode: number;
  isNight: boolean;
}

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ weatherCode, isNight }) => {
  const getBackgroundStyle = (): React.CSSProperties => {
    // Default background
    let backgroundImage = 'linear-gradient(to bottom, #1e40af, #60a5fa)';
    let opacity = 0.3; // Default opacity
    
    // Night mode background
    if (isNight) {
      backgroundImage = 'linear-gradient(to bottom, #020617, #1e3a8a)';
      opacity = 0.5;
    }
    
    // Weather condition specific backgrounds
    // Clear sky
    if (weatherCode === 800) {
      backgroundImage = isNight 
        ? 'linear-gradient(to bottom, #020617, #1e3a8a)' // Clear night
        : 'linear-gradient(to bottom, #0ea5e9, #7dd3fc)'; // Clear day
    }
    
    // Few clouds, scattered clouds
    else if (weatherCode === 801 || weatherCode === 802) {
      backgroundImage = isNight 
        ? 'linear-gradient(to bottom, #1e293b, #334155)' // Partly cloudy night
        : 'linear-gradient(to bottom, #38bdf8, #bae6fd)'; // Partly cloudy day
    }
    
    // Broken clouds, overcast
    else if (weatherCode === 803 || weatherCode === 804) {
      backgroundImage = isNight 
        ? 'linear-gradient(to bottom, #1e293b, #475569)' // Cloudy night
        : 'linear-gradient(to bottom, #64748b, #cbd5e1)'; // Cloudy day
    }
    
    // Rain
    else if (weatherCode >= 500 && weatherCode < 600) {
      backgroundImage = isNight 
        ? 'linear-gradient(to bottom, #0f172a, #1e293b)' // Rainy night
        : 'linear-gradient(to bottom, #475569, #94a3b8)'; // Rainy day
      opacity = 0.6;
    }
    
    // Snow
    else if (weatherCode >= 600 && weatherCode < 700) {
      backgroundImage = isNight 
        ? 'linear-gradient(to bottom, #1e293b, #334155)' // Snowy night
        : 'linear-gradient(to bottom, #cbd5e1, #f1f5f9)'; // Snowy day
    }
    
    // Thunderstorm
    else if (weatherCode >= 200 && weatherCode < 300) {
      backgroundImage = 'linear-gradient(to bottom, #1e1e1e, #475569)';
      opacity = 0.7;
    }
    
    return {
      backgroundImage,
      opacity,
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      transition: 'all 1.5s ease-in-out',
    };
  };
  
  const getWeatherEffects = (): React.ReactNode => {
    if (weatherCode >= 500 && weatherCode < 600) {
      // Rain effect
      return (
        <div className="weather-effect rain">
          <style jsx global>{`
            .weather-effect.rain {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: -1;
              pointer-events: none;
            }
            .rain:before {
              content: '';
              position: absolute;
              width: 100%;
              height: 100%;
              background: linear-gradient(to bottom, rgba(8, 8, 8, 0) 0%, rgba(8, 8, 8, 0.2) 100%);
              animation: rain 0.3s linear infinite;
              background-size: 100px 100px;
            }
            @keyframes rain {
              0% { background-position: 0 0; }
              100% { background-position: 10px 100px; }
            }
          `}</style>
        </div>
      );
    }
    
    if (weatherCode >= 600 && weatherCode < 700) {
      // Snow effect
      return (
        <div className="weather-effect snow">
          <style jsx global>{`
            .weather-effect.snow {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: -1;
              pointer-events: none;
            }
            .snow:before {
              content: '';
              position: absolute;
              width: 100%;
              height: 100%;
              background: radial-gradient(4px 4px, white, rgba(0,0,0,0)) 0 0,
                        radial-gradient(3px 3px, white, rgba(0,0,0,0)) 40px 60px,
                        radial-gradient(2px 2px, white, rgba(0,0,0,0)) 80px 120px;
              background-size: 120px 180px;
              animation: snow 5s linear infinite;
            }
            @keyframes snow {
              0% { background-position: 0px 0px, 40px 60px, 80px 120px; }
              100% { background-position: 40px 180px, 80px 240px, 120px 300px; }
            }
          `}</style>
        </div>
      );
    }
    
    // No special effect for other weather conditions
    return null;
  };
  
  return (
    <>
      <div style={getBackgroundStyle()} />
      {getWeatherEffects()}
    </>
  );
};

export default WeatherBackground;

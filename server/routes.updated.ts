import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";

// Get the API key from environment variables
const WEATHERAPI_KEY = process.env.WEATHERAPI_KEY;
console.log("WeatherAPI Key exists:", !!WEATHERAPI_KEY);

// Validate API key to prevent silent failures
if (!WEATHERAPI_KEY) {
  console.error("WARNING: WEATHERAPI_KEY environment variable is not set. Weather functionality will not work properly.");
}

const WEATHERAPI_BASE_URL = "https://api.weatherapi.com/v1";

// Helper function to properly capitalize city names
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Cities for the "Forecast in Other Cities" section - customize with your favorites
const FAVORITE_CITIES = [
  { name: "San Francisco", country: "US" },
  { name: "Tokyo", country: "JP" },
  { name: "London", country: "GB" },
  { name: "Sydney", country: "AU" },
  { name: "Toronto", country: "CA" }
];

// Additional cities to have more options for favorites
const ADDITIONAL_CITIES = [
  { name: "Paris", country: "FR" },
  { name: "Berlin", country: "DE" },
  { name: "Madrid", country: "ES" },
  { name: "Rome", country: "IT" },
  { name: "Amsterdam", country: "NL" },
  { name: "Vienna", country: "AT" },
  { name: "Dubai", country: "AE" },
  { name: "Singapore", country: "SG" },
  { name: "Hong Kong", country: "HK" },
  { name: "Bangkok", country: "TH" }
];

// All available cities for the favorite cities feature
const ALL_CITIES = [...FAVORITE_CITIES, ...ADDITIONAL_CITIES];

// Helper function to convert WeatherAPI data to our app's format
const mapWeatherCondition = (condition: any) => ({
  id: condition.code,
  main: condition.text.split(" ")[0],  // Using first word as 'main'
  description: condition.text.toLowerCase(),
  icon: condition.icon
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get weather for a city or by coordinates
  app.get("/api/weather", async (req: Request, res: Response) => {
    try {
      const city = req.query.city as string;
      const lat = req.query.lat as string;
      const lon = req.query.lon as string;
      const units = req.query.units as string || "imperial";
      
      // Allow fetching weather either by city name or by lat/lon
      let query: string;
      
      if (city) {
        query = city;
      } else if (lat && lon) {
        query = `${lat},${lon}`;
      } else {
        return res.status(400).json({ message: "Either city or lat/lon parameters are required" });
      }
      
      // Get current weather and forecast in one call
      const response = await axios.get(`${WEATHERAPI_BASE_URL}/forecast.json`, {
        params: {
          key: WEATHERAPI_KEY,
          q: query,
          days: 7,
          aqi: "yes",
          alerts: "no"
        }
      });
      
      if (!response.data) {
        return res.status(404).json({ message: "City or weather data not found" });
      }
      
      // Apply proper capitalization to the city name from the API response
      const capitalizedCityName = toTitleCase(response.data.location.name);
      
      // Map the WeatherAPI data to our app's expected format
      const currentWeather = {
        coord: {
          lon: response.data.location.lon,
          lat: response.data.location.lat
        },
        weather: [mapWeatherCondition(response.data.current.condition)],
        base: "stations",
        main: {
          temp: units === "imperial" ? response.data.current.temp_f : response.data.current.temp_c,
          feels_like: units === "imperial" ? response.data.current.feelslike_f : response.data.current.feelslike_c,
          temp_min: units === "imperial" ? 
            response.data.forecast.forecastday[0].day.mintemp_f : 
            response.data.forecast.forecastday[0].day.mintemp_c,
          temp_max: units === "imperial" ? 
            response.data.forecast.forecastday[0].day.maxtemp_f : 
            response.data.forecast.forecastday[0].day.maxtemp_c,
          pressure: response.data.current.pressure_mb,
          humidity: response.data.current.humidity
        },
        visibility: response.data.current.vis_km * 1000, // convert to meters
        wind: {
          speed: units === "imperial" ? response.data.current.wind_mph : response.data.current.wind_kph,
          deg: response.data.current.wind_degree
        },
        clouds: {
          all: response.data.current.cloud
        },
        dt: new Date(response.data.current.last_updated_epoch * 1000).getTime() / 1000,
        sys: {
          type: 1,
          id: 5141,
          country: response.data.location.country,
          sunrise: new Date(response.data.forecast.forecastday[0].astro.sunrise).getTime() / 1000,
          sunset: new Date(response.data.forecast.forecastday[0].astro.sunset).getTime() / 1000
        },
        timezone: response.data.location.localtime_epoch - new Date().getTime() / 1000,
        id: 1,
        name: capitalizedCityName,
        cod: 200
      };
      
      // Map the forecast data
      const dailyForecasts = response.data.forecast.forecastday.map((day: any) => ({
        dt: new Date(day.date).getTime() / 1000,
        sunrise: new Date(day.astro.sunrise).getTime() / 1000,
        sunset: new Date(day.astro.sunset).getTime() / 1000,
        moonrise: new Date(day.astro.moonrise).getTime() / 1000,
        moonset: new Date(day.astro.moonset).getTime() / 1000,
        moon_phase: 0, // Not provided by WeatherAPI
        temp: {
          day: units === "imperial" ? day.day.avgtemp_f : day.day.avgtemp_c,
          min: units === "imperial" ? day.day.mintemp_f : day.day.mintemp_c,
          max: units === "imperial" ? day.day.maxtemp_f : day.day.maxtemp_c,
          night: units === "imperial" ? 
            (day.day.avgtemp_f - 10) : (day.day.avgtemp_c - 5), // Approximation
          eve: units === "imperial" ? 
            (day.day.avgtemp_f - 5) : (day.day.avgtemp_c - 2), // Approximation
          morn: units === "imperial" ? 
            (day.day.avgtemp_f - 2) : (day.day.avgtemp_c - 1) // Approximation
        },
        feels_like: {
          day: units === "imperial" ? day.day.avgtemp_f : day.day.avgtemp_c,
          night: units === "imperial" ? 
            (day.day.avgtemp_f - 12) : (day.day.avgtemp_c - 6), // Approximation
          eve: units === "imperial" ? 
            (day.day.avgtemp_f - 7) : (day.day.avgtemp_c - 3), // Approximation
          morn: units === "imperial" ? 
            (day.day.avgtemp_f - 4) : (day.day.avgtemp_c - 2) // Approximation
        },
        pressure: day.day.avgvis_km * 10, // Approximation
        humidity: day.day.avghumidity,
        dew_point: 0, // Not provided
        wind_speed: units === "imperial" ? day.day.maxwind_mph : day.day.maxwind_kph,
        wind_deg: 0, // Not provided
        weather: [mapWeatherCondition(day.day.condition)],
        clouds: day.day.cloud || 0,
        pop: day.day.daily_chance_of_rain / 100,
        uvi: day.day.uv
      }));
      
      // Combine data in the format our frontend expects
      const combinedData = {
        lat: response.data.location.lat,
        lon: response.data.location.lon,
        timezone: response.data.location.tz_id,
        timezone_offset: response.data.location.localtime_epoch - new Date().getTime() / 1000,
        current: {
          ...currentWeather,
          name: capitalizedCityName  // Ensure this is set correctly
        },
        daily: dailyForecasts
      };
      
      res.json(combinedData);
    } catch (error) {
      console.error("Weather API error:", error);
      if (axios.isAxiosError(error)) {
        res.status(error.response?.status || 500).json({ 
          message: error.response?.data?.message || "Error fetching weather data" 
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get weather for popular cities
  app.get("/api/other-cities", async (req: Request, res: Response) => {
    try {
      const units = req.query.units as string || "imperial";
      const cityWeatherPromises = FAVORITE_CITIES.map(async (city) => {
        try {
          const response = await axios.get(`${WEATHERAPI_BASE_URL}/current.json`, {
            params: {
              key: WEATHERAPI_KEY,
              q: `${city.name},${city.country}`
            }
          });
          
          return {
            name: city.name,
            country: city.country,
            temp: units === "imperial" ? response.data.current.temp_f : response.data.current.temp_c,
            weather: [mapWeatherCondition(response.data.current.condition)]
          };
        } catch (cityError) {
          console.error(`Error fetching data for ${city.name}:`, cityError);
          // Return a placeholder for this city so we don't break the whole response
          return {
            name: city.name,
            country: city.country,
            temp: 0,
            weather: [{ 
              id: 800, 
              main: "Clear", 
              description: "unknown", 
              icon: "" 
            }]
          };
        }
      });
      
      const citiesData = await Promise.all(cityWeatherPromises);
      res.json(citiesData);
    } catch (error) {
      console.error("Other cities API error:", error);
      if (axios.isAxiosError(error)) {
        res.status(error.response?.status || 500).json({ 
          message: error.response?.data?.message || "Error fetching other cities data" 
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get weather for favorite cities
  app.get("/api/favorite-cities", async (req: Request, res: Response) => {
    try {
      const units = req.query.units as string || "imperial";
      const favorites = req.query.favorites ? (req.query.favorites as string).split(',') : [];
      
      console.log("Received favorite cities request:", { units, favorites });
      
      // If no favorites provided, return empty array
      if (!favorites.length) {
        return res.json([]);
      }
      
      // Process cities even if they're not in our predefined list
      const citiesToFetch = favorites.map(name => {
        // Find in predefined list first
        const predefined = ALL_CITIES.find(city => 
          city.name.toLowerCase() === name.toLowerCase());
          
        // If found in predefined list, use that data
        if (predefined) return predefined;
        
        // Otherwise create a new city entry
        return { 
          name: toTitleCase(name), 
          country: "US"  // Default to US for user-entered cities
        };
      });
      
      // If none of the favorites match our known cities, return empty array
      if (!citiesToFetch.length) {
        return res.json([]);
      }
      
      const cityWeatherPromises = citiesToFetch.map(async (city) => {
        try {
          // If we have an API key, fetch real data
          if (WEATHERAPI_KEY) {
            const response = await axios.get(`${WEATHERAPI_BASE_URL}/current.json`, {
              params: {
                key: WEATHERAPI_KEY,
                q: `${city.name},${city.country}`,
                timeout: 5000 // Add timeout to prevent long-hanging requests
              }
            });
            
            return {
              name: city.name,
              country: city.country,
              temp: units === "imperial" ? response.data.current.temp_f : response.data.current.temp_c,
              weather: [mapWeatherCondition(response.data.current.condition)]
            };
          } else {
            // If no API key, return mock data
            const mockTemp = Math.floor(Math.random() * 40) + 40; // Random temp between 40-80°F
            return {
              name: city.name,
              country: city.country,
              temp: mockTemp,
              weather: [{ 
                id: 800, 
                main: "Clear", 
                description: "clear sky", 
                icon: "01d" 
              }]
            };
          }
        } catch (cityError) {
          console.error(`Error fetching data for ${city.name}:`, cityError);
          // Return a placeholder for this city with mock data
          return {
            name: city.name,
            country: city.country,
            temp: Math.floor(Math.random() * 40) + 40, // Random temp between 40-80°F
            weather: [{ 
              id: 800, 
              main: "Clear", 
              description: "clear sky (mock)", 
              icon: "01d" 
            }]
          };
        }
      });
      
      const citiesData = await Promise.all(cityWeatherPromises);
      res.json(citiesData);
    } catch (error) {
      console.error("Favorite cities API error:", error);
      if (axios.isAxiosError(error)) {
        res.status(error.response?.status || 500).json({ 
          message: error.response?.data?.message || "Error fetching favorite cities data" 
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Reverse geocoding endpoint to get city name from coordinates
  app.get("/api/geocode/reverse", async (req: Request, res: Response) => {
    try {
      const lat = req.query.lat as string;
      const lon = req.query.lon as string;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const response = await axios.get(`${WEATHERAPI_BASE_URL}/search.json`, {
        params: {
          key: WEATHERAPI_KEY,
          q: `${lat},${lon}`
        }
      });

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Return the first result
        const location = response.data[0];
        return res.json({
          name: location.name,
          region: location.region,
          country: location.country,
          lat: location.lat,
          lon: location.lon
        });
      } else {
        return res.status(404).json({ error: "No location found for these coordinates" });
      }
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
      if (axios.isAxiosError(error)) {
        return res.status(error.response?.status || 500).json({
          error: "Error from weather API",
          message: error.response?.data || error.message
        });
      }
      return res.status(500).json({ error: "Internal server error during reverse geocoding" });
    }
  });

  const server = createServer(app);
  return server;
}

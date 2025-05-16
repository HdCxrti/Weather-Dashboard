import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const GEO_URL = "https://api.openweathermap.org/geo/1.0";

// Cities for the "Forecast in Other Cities" section
const POPULAR_CITIES = [
  { name: "Seattle", country: "US" },
  { name: "Munich", country: "DE" },
  { name: "Paris", country: "FR" },
  { name: "Istanbul", country: "TR" },
  { name: "Dubai", country: "AE" }
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Get coordinates from city name
  app.get("/api/geocode", async (req: Request, res: Response) => {
    try {
      const city = req.query.city as string;
      
      if (!city) {
        return res.status(400).json({ message: "City parameter is required" });
      }
      
      const response = await axios.get(`${GEO_URL}/direct`, {
        params: {
          q: city,
          limit: 1,
          appid: OPENWEATHER_API_KEY
        }
      });
      
      if (response.data.length === 0) {
        return res.status(404).json({ message: "City not found" });
      }
      
      res.json(response.data[0]);
    } catch (error) {
      console.error("Geocoding error:", error);
      if (axios.isAxiosError(error)) {
        res.status(error.response?.status || 500).json({ 
          message: error.response?.data?.message || "Error geocoding city" 
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get current weather and forecast
  app.get("/api/weather", async (req: Request, res: Response) => {
    try {
      const city = req.query.city as string;
      const units = req.query.units as string || "imperial";
      
      if (!city) {
        return res.status(400).json({ message: "City parameter is required" });
      }
      
      // First, get coordinates for the city
      const geoResponse = await axios.get(`${GEO_URL}/direct`, {
        params: {
          q: city,
          limit: 1,
          appid: OPENWEATHER_API_KEY
        }
      });
      
      if (geoResponse.data.length === 0) {
        return res.status(404).json({ message: "City not found" });
      }
      
      const { lat, lon } = geoResponse.data[0];
      
      // Get current weather
      const currentWeatherResponse = await axios.get(`${BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: OPENWEATHER_API_KEY,
          units
        }
      });
      
      // Get forecast
      const forecastResponse = await axios.get(`${BASE_URL}/onecall`, {
        params: {
          lat,
          lon,
          exclude: "minutely,hourly,alerts",
          appid: OPENWEATHER_API_KEY,
          units
        }
      });
      
      // Combine data and send response
      const combinedData = {
        ...forecastResponse.data,
        current: currentWeatherResponse.data
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
      const cityWeatherPromises = POPULAR_CITIES.map(async (city) => {
        const response = await axios.get(`${BASE_URL}/weather`, {
          params: {
            q: `${city.name},${city.country}`,
            appid: OPENWEATHER_API_KEY,
            units
          }
        });
        
        return {
          name: city.name,
          country: city.country,
          temp: response.data.main.temp,
          weather: response.data.weather
        };
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

  const httpServer = createServer(app);
  return httpServer;
}

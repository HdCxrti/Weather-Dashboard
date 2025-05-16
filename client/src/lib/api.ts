import { apiRequest } from "./queryClient";

/**
 * Direct geocoding: get coordinates by city name
 */
export async function geocodeCity(city: string) {
  const response = await apiRequest("GET", `/api/geocode?city=${encodeURIComponent(city)}`, undefined);
  return response.json();
}

/**
 * Get the current weather by city name
 */
export async function getCurrentWeather(city: string, units: 'metric' | 'imperial' = 'imperial') {
  const response = await apiRequest(
    "GET", 
    `/api/weather?city=${encodeURIComponent(city)}&units=${units}`, 
    undefined
  );
  return response.json();
}

/**
 * Get weather for predefined set of popular cities
 */
export async function getOtherCitiesWeather(units: 'metric' | 'imperial' = 'imperial') {
  const response = await apiRequest("GET", `/api/other-cities?units=${units}`, undefined);
  return response.json();
}

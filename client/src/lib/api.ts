import { apiRequest } from "./queryClient";

/**
 * Direct geocoding: get coordinates by city name
 */
export async function geocodeCity(city: string) {
  const response = await apiRequest("GET", `/api/geocode?city=${encodeURIComponent(city)}`, undefined);
  return response.json();
}

/**
 * Direct geocoding: get coordinates by city name, prefer US if available
 */
export async function geocodeCityPreferUS(city: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
  const resp = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = await resp.json();
  if (Array.isArray(data) && data.length > 0) {
    // Prefer US result if available
    const usResult = data.find((item: any) => item.display_name.includes('United States'));
    return usResult || data[0];
  }
  return null;
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

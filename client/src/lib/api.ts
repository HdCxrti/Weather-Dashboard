import { apiRequest } from "./queryClient";

/**
 * Helper function to normalize city data
 * Ensures name is a string and weather data has expected format
 */
function normalizeCityData(city: any): any {
  if (!city) return null;
  
  // If it's just a string city name, convert to a minimal city object
  if (typeof city === 'string') {
    return { name: city };
  }
  
  // Ensure city has a string name
  if (!city.name || typeof city.name !== 'string') {
    console.warn('City without a name found in data', city);
    return null;
  }
  
  // Ensure other required properties exist
  return {
    ...city,
    weather: Array.isArray(city.weather) ? city.weather : [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
    country: city.country || "Unknown"
  };
}

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

/**
 * Get weather for favorite cities
 */
export async function getFavoriteCitiesWeather(
  favoriteCities: string[] | any[],
  units: 'metric' | 'imperial' = 'imperial'
) {
  // For a real API, you'd send the list of cities to fetch
  // For now, we'll use the other-cities endpoint and filter client-side
  if (!favoriteCities || !favoriteCities.length) {
    return [];
  }
  
  // Normalize favorites to ensure we have only string city names
  const normalizedFavorites = favoriteCities.map(city => 
    typeof city === 'string' ? city : (city.name || '')
  ).filter(Boolean);
  
  if (normalizedFavorites.length === 0) {
    return [];
  }
  
  try {
    // Build the URL with the favorites as query parameters
    const favoritesParam = encodeURIComponent(normalizedFavorites.join(','));
    const response = await apiRequest(
      "GET", 
      `/api/favorite-cities?units=${units}&favorites=${favoritesParam}`, 
      undefined
    );
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const allCities = await response.json();
    
    if (!Array.isArray(allCities)) {
      throw new Error('API did not return an array of cities');
    }
    
    // Filter to only include favorite cities (case-insensitive) and normalize the data
    const filteredCities = allCities
      .map(normalizeCityData)
      .filter((city: any) => city && normalizedFavorites.some(fav => 
        fav.toLowerCase() === city.name.toLowerCase()
      ));
    
    return filteredCities;
  } catch (error) {
    console.error("Error fetching favorite cities weather:", error);
    // Return an empty array to avoid crashing the UI
    return [];
  }
}

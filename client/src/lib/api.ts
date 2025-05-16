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

/**
 * Get weather for favorite cities
 */
export async function getFavoriteCitiesWeather(
  favoriteCities: string[],
  units: 'metric' | 'imperial' = 'imperial'
) {
  // For a real API, you'd send the list of cities to fetch
  // For now, we'll use the other-cities endpoint and filter client-side
  if (!favoriteCities || !favoriteCities.length) {
    return [];
  }
  
  try {
    // Build the URL with the favorites as query parameters
    const favoritesParam = encodeURIComponent(favoriteCities.join(','));
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
    
    // Filter to only include favorite cities (case-insensitive)
    return allCities.filter((city: any) => 
      favoriteCities.some(fav => 
        fav.toLowerCase() === city.name.toLowerCase()
      )
    );
  } catch (error) {
    console.error("Error fetching favorite cities weather:", error);
    // Return an empty array to avoid crashing the UI
    return [];
  }
}

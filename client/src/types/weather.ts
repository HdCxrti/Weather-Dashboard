// OpenWeatherMap API types based on their API response structure

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: WeatherCondition[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    "1h"?: number;
    "3h"?: number;
  };
  snow?: {
    "1h"?: number;
    "3h"?: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface DailyTemp {
  day: number;
  min: number;
  max: number;
  night: number;
  eve: number;
  morn: number;
}

export interface DailyFeelsLike {
  day: number;
  night: number;
  eve: number;
  morn: number;
}

export interface DailyForecast {
  dt: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  temp: DailyTemp;
  feels_like: DailyFeelsLike;
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherCondition[];
  clouds: number;
  pop: number;
  rain?: number;
  snow?: number;
  uvi: number;
}

export interface HourlyForecastData {
  time: number; // timestamp in seconds
  temp: number;
  feels_like?: number;
  humidity?: number;
  wind_speed?: number;
  weather: WeatherCondition[];
  chance_of_rain?: number;
}

export interface WeatherData {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: CurrentWeatherData;
  daily: DailyForecast[];
  hourly?: HourlyForecastData[]; // Optional hourly forecast data
}

export interface OtherCityWeather {
  name: string;
  country: string;
  temp: number;
  weather: WeatherCondition[];
  state?: string; // Optional state property
}

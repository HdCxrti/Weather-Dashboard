import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base schema for users (retained from original file)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Weather related types
export const weatherResponseSchema = z.object({
  city: z.string(),
  country: z.string(),
  temp: z.number(),
  feels_like: z.number(),
  temp_min: z.number(),
  temp_max: z.number(),
  humidity: z.number(),
  wind_speed: z.number(),
  wind_deg: z.number(),
  description: z.string(),
  icon: z.string(),
  dt: z.number(),
  sunrise: z.number(),
  sunset: z.number(),
});

export type WeatherResponse = z.infer<typeof weatherResponseSchema>;

export const forecastItemSchema = z.object({
  dt: z.number(),
  temp_max: z.number(),
  temp_min: z.number(),
  weather_id: z.number(),
  weather_main: z.string(),
  weather_description: z.string(),
});

export type ForecastItem = z.infer<typeof forecastItemSchema>;

export const otherCitySchema = z.object({
  name: z.string(),
  country: z.string(),
  temp: z.number(),
  weather_main: z.string(),
  weather_id: z.number(),
});

export type OtherCity = z.infer<typeof otherCitySchema>;

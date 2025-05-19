import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HourlyForecastItem } from "@/components/HourlyForecast";

interface TemperatureChartProps {
  hourlyData: HourlyForecastItem[];
  units: "metric" | "imperial";
  cityName: string;
  span?: 12 | 24 | 48; // How many hours to show
}

export default function TemperatureChart({ 
  hourlyData, 
  units, 
  cityName,
  span = 24
}: TemperatureChartProps) {
  const tempUnit = units === "imperial" ? "°F" : "°C";
  
  // Format the data for the chart
  const chartData = hourlyData
    .slice(0, span)
    .map((hour) => {
      const date = new Date(hour.time * 1000);
      return {
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        temp: Math.round(hour.temp),
        feelsLike: Math.round(hour.feels_like || hour.temp - 2),
        humidity: hour.humidity || 0,
        rainChance: hour.chance_of_rain || 0
      };
    });
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Temperature Trend</CardTitle>
      </CardHeader>
      <CardContent>        <div className="h-[360px] bg-black/20 p-2 rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}              margin={{
                top: 10,
                right: 30,
                left: 20,
                bottom: 30,
              }}
            >              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 14, fill: '#ffffff', fontWeight: 600 }} 
                stroke="var(--border)"
                tickLine={{ stroke: 'var(--border)' }}
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 14, fill: '#ffffff', fontWeight: 600 }} 
                stroke="var(--border)"
                tickLine={{ stroke: 'var(--border)' }}
                label={{ 
                  value: tempUnit, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#ffffff', fontSize: 14, fontWeight: 600 }
                }}
              />              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  borderColor: 'var(--primary)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  boxShadow: '0 4px 10px -1px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.25)'
                }}
                labelStyle={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '8px', fontSize: '15px' }}
                itemStyle={{ color: '#ffffff' }}
                formatter={(value) => `${value}`}
              />              <Legend 
                formatter={(value) => <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 600 }}>{value}</span>}
                wrapperStyle={{ paddingTop: '10px' }}
              /><Line
                name={`Temperature ${tempUnit}`}
                type="monotone"
                dataKey="temp"
                stroke="#ff9500"
                strokeWidth={3}
                dot={{ r: 6, strokeWidth: 2, fill: '#ff9500', stroke: 'var(--background)' }}
                activeDot={{ r: 10, strokeWidth: 2, stroke: 'var(--background)' }}
              />
              <Line
                name={`Feels like ${tempUnit}`}                
                type="monotone"
                dataKey="feelsLike"
                stroke="#ff6b33"
                strokeDasharray="3 3"
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 2, fill: '#ff6b33', stroke: 'var(--background)' }}
              />
              {span <= 24 && (
                <Line
                  name="Humidity %"
                  type="monotone"
                  dataKey="humidity"
                  stroke="#60a5fa"
                  strokeWidth={2.5}
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

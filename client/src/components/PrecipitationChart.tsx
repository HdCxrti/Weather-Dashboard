import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Line,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HourlyForecastItem } from "@/components/HourlyForecast";
import { Cloud, CloudRain, Droplets } from "lucide-react";

interface PrecipitationChartProps {
  hourlyData: HourlyForecastItem[];
  span?: 12 | 24; // How many hours to show
}

export default function PrecipitationChart({ hourlyData, span = 12 }: PrecipitationChartProps) {
  // Format the data for the chart
  const chartData = hourlyData
    .slice(0, span)
    .map((hour) => {
      const date = new Date(hour.time * 1000);
      return {
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        precipitation: hour.chance_of_rain || 0, // Chance of precipitation as percentage
        humidity: hour.humidity || 0,
      };
    });
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <CloudRain className="h-5 w-5" />
          Precipitation & Humidity
        </CardTitle>
      </CardHeader>
      <CardContent>        <div className="h-[280px] bg-black/20 p-2 rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
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
                  value: '%', 
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
                formatter={(value) => `${value}%`}
              />              <Legend 
                formatter={(value) => <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 600 }}>{value}</span>}
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <Bar 
                dataKey="precipitation" 
                name="Chance of Rain" 
                fill="#4285f4" 
                radius={[5, 5, 0, 0]} 
                fillOpacity={0.9}
              />
              <Line 
                type="monotone" 
                dataKey="humidity" 
                name="Humidity" 
                stroke="#10b9db" 
                strokeWidth={3}
                dot={{ r: 6, strokeWidth: 2, fill: '#10b9db', stroke: 'var(--background)' }}
                activeDot={{ r: 8, strokeWidth: 2, stroke: 'var(--background)' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface WeatherNewsSummaryProps {
  cityName: string;
  countryCode: string;
}

interface WeatherNewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  source: string;
}

// Generate mock news based on city and country
const generateMockNews = (city: string, country: string): WeatherNewsItem[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return [
    {
      id: "news-1",
      title: `${city} Experiences Seasonal Weather Patterns`,
      summary: `Meteorologists report that ${city} is currently experiencing typical seasonal weather patterns for this time of year, with temperatures aligning with historical averages for the region.`,
      date: formatDate(today),
      source: `${country} Weather Network`
    },
    {
      id: "news-2",
      title: `Air Quality Improvements in ${city}`,
      summary: `Recent measurements show improved air quality in ${city} compared to last month, attributed to favorable wind patterns and reduced emissions.`,
      date: formatDate(yesterday),
      source: "Environmental Monitoring Agency"
    },
    {
      id: "news-3",
      title: `Weekend Weather Outlook for ${city}`,
      summary: `The weekend forecast for ${city} predicts stable conditions with a slight chance of precipitation and seasonable temperatures.`,
      date: formatDate(yesterday),
      source: "Weather Updates Daily"
    }
  ];
};

export default function WeatherNewsSummary({ cityName, countryCode }: WeatherNewsSummaryProps) {
  const [newsItems, setNewsItems] = useState<WeatherNewsItem[]>([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState<number>(0);

  useEffect(() => {
    // Generate mock news whenever the city changes
    const generatedNews = generateMockNews(cityName, countryCode);
    setNewsItems(generatedNews);
    setCurrentNewsIndex(0);
  }, [cityName, countryCode]);

  // Auto-rotate news items every 10 seconds
  useEffect(() => {
    if (newsItems.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentNewsIndex(prevIndex => (prevIndex + 1) % newsItems.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [newsItems.length]);

  if (newsItems.length === 0) {
    return (
      <div className="bg-muted rounded-xl p-6 shadow-sm text-foreground">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No news available</p>
        </div>
      </div>
    );
  }

  const currentNews = newsItems[currentNewsIndex];

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm text-foreground">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Weather News</h3>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>{currentNews.date}</span>
        </div>
      </div>
      
      <h4 className="font-medium text-sm mb-2">{currentNews.title}</h4>
      <p className="text-sm text-muted-foreground mb-3">{currentNews.summary}</p>
      <div className="text-xs text-muted-foreground">Source: {currentNews.source}</div>
      
      {newsItems.length > 1 && (
        <div className="flex justify-center mt-4">
          {newsItems.map((_, index) => (
            <button
              key={index}
              className={`mx-1 h-1.5 rounded-full transition-all duration-300 ${
                index === currentNewsIndex 
                  ? "w-4 bg-primary" 
                  : "w-1.5 bg-muted-foreground/30"
              }`}
              onClick={() => setCurrentNewsIndex(index)}
              aria-label={`News item ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

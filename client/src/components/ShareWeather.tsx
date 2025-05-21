import React from 'react';
import { Share2, Facebook, Twitter, Link } from 'lucide-react';
import { Button } from './ui/button';

interface ShareWeatherProps {
  city: string;
  temperature: number;
  condition: string;
  units: 'metric' | 'imperial';
}

const ShareWeather: React.FC<ShareWeatherProps> = ({ city, temperature, condition, units }) => {
  const tempSymbol = units === 'metric' ? '°C' : '°F';
  const shareMessage = `Current weather in ${city}: ${temperature}${tempSymbol}, ${condition}. Check out the forecast!`;
  const shareUrl = window.location.href;
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Weather in ${city}`,
          text: shareMessage,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      copyToClipboard();
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareMessage} ${shareUrl}`).then(
      () => {
        alert('Weather information copied to clipboard!');
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };
  
  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };
  
  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };
  
  return (
    <div className="flex flex-wrap items-center gap-2">
      {navigator.share && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          className="flex items-center gap-1"
        >
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={shareToTwitter}
        className="flex items-center gap-1"
      >
        <Twitter className="h-4 w-4 mr-1" />
        Twitter
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={shareToFacebook}
        className="flex items-center gap-1"
      >
        <Facebook className="h-4 w-4 mr-1" />
        Facebook
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className="flex items-center gap-1"
      >
        <Link className="h-4 w-4 mr-1" />
        Copy
      </Button>
    </div>
  );
};

export default ShareWeather;

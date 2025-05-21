import React, { useEffect, useState } from 'react';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

/**
 * Component to display a message when the user is offline
 */
const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Show alert briefly when coming back online
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showAlert) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <Alert variant={isOnline ? "default" : "destructive"} className="animate-in fade-in">
        <div className="flex items-center">
          {isOnline ? <Wifi className="h-4 w-4 mr-2" /> : <WifiOff className="h-4 w-4 mr-2" />}
          <AlertTitle>{isOnline ? 'Back online' : 'You are offline'}</AlertTitle>
        </div>
        <AlertDescription className="mt-2">
          {isOnline 
            ? 'Your connection has been restored. Weather data will now update automatically.'
            : 'Check your connection. Limited functionality is available while offline.'}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ConnectionStatus;

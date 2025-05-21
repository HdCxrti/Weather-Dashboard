/**
 * Helper utility for WebSocket connections
 * This handles proper URLs in both development and production environments
 */

/**
 * Creates a WebSocket connection with proper URL handling for different environments
 * @param path - The path to connect to (without protocol or host)
 * @returns A WebSocket instance
 */
export function createWebSocketConnection(path: string): WebSocket | null {
  // Don't create WebSocket connections in production mode
  if (import.meta.env.PROD) {
    console.log('WebSocket connections disabled in production');
    return null;
  }

  try {
    // In development, use the current hostname instead of hardcoded localhost
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host; // e.g. localhost:8080 or deployed-app.railway.app
    
    // Create WebSocket URL using current origin
    const wsUrl = `${protocol}//${host}${path}`;
    console.log(`Creating WebSocket connection to ${wsUrl}`);
    
    return new WebSocket(wsUrl);
  } catch (err) {
    console.error('Failed to create WebSocket connection:', err);
    return null;
  }
}

/**
 * Check if a string is a valid WebSocket URL
 * @param url - The URL to check
 * @returns boolean indicating if URL is valid
 */
export function isValidWebSocketUrl(url: string): boolean {
  try {
    // Check if URL contains "undefined" which is a common error
    if (url.includes('undefined')) {
      return false;
    }
    
    // Try creating a URL object to validate
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

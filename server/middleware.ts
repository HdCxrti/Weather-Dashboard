import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Middleware to handle possible WebSocket connection issues in production
 * This middleware intercepts WebSocket related requests that might be causing errors
 */
export function handleWebSocketRequests(req: Request, res: Response, next: NextFunction) {
  // Check if the request is trying to establish a WebSocket connection
  if (
    req.headers.upgrade && 
    req.headers.upgrade.toLowerCase() === 'websocket' || 
    req.url.includes('ws') ||
    req.url.includes('socket')
  ) {
    // In production, return a 200 OK to prevent error messages in the console
    if (process.env.NODE_ENV === 'production') {
      return res.status(200).send('WebSocket connections are disabled in production.');
    }
  }
  
  next();
}

/**
 * Middleware to add security headers
 */
export function addSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  
  // Only set HTTPS related headers if we're in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Only set CSP in production to avoid development issues
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' https://cdn.weatherapi.com data:; " +
      "font-src 'self'; " +
      "connect-src 'self' https://api.weatherapi.com;"
    );
  }
  
  next();
}

/**
 * Simple health check endpoint for monitoring
 */
export function setupHealthCheck(app: express.Express) {
  app.get('/health', (req: Request, res: Response) => {
    const healthData = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now(),
      environment: process.env.NODE_ENV,
      railwayEnvironment: process.env.RAILWAY_ENVIRONMENT || 'Not on Railway'
    };
    
    res.status(200).json(healthData);
  });
}

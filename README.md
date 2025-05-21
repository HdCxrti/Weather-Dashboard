# Weather Dashboard

A modern, responsive weather dashboard application built with React, TypeScript, Express, and the WeatherAPI.

## Features

- Current weather conditions with detailed metrics
- 7-day weather forecast
- Quick view of weather in popular cities
- Light and dark theme support
- Responsive design for mobile and desktop
- Unit conversion (metric/imperial)

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **API**: WeatherAPI.com
- **Build Tools**: Vite, esbuild

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- WeatherAPI.com API key (sign up at https://weatherapi.com)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/weather-dashboard.git
   cd weather-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   NODE_ENV=development
   PORT=8080
   WEATHERAPI_KEY=your_weatherapi_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Production Build

To create a production build:

```
npm run build
```

To run the production build:

```
npm start
```

## Deployment

This application is ready to deploy on platforms like Railway, Heroku, or Vercel:

1. Push your code to GitHub
2. Connect your repository to your deployment platform
3. Set the required environment variables:
   - `NODE_ENV=production`
   - `PORT=8080` (or let the platform assign the port)
   - `WEATHERAPI_KEY=your_weatherapi_key_here`
4. Deploy!

## License

MIT

import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";

/**
 * Logging helper function
 */
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * Log environment information to help with debugging
 */
export function logEnvironmentInfo() {
  log(`Running in ${process.env.NODE_ENV || 'unknown'} environment`, 'server');
  log(`Current directory: ${process.cwd()}`, 'server');
  log(`Node.js version: ${process.version}`, 'server');
  log(`Platform: ${process.platform}`, 'server');
  
  // Check if we're in Railway
  if (process.env.RAILWAY_ENVIRONMENT) {
    log(`Detected Railway environment: ${process.env.RAILWAY_ENVIRONMENT}`, 'server');
  }
}

/**
 * Setup Vite middleware in development mode
 */
export async function setupVite(app: Express, server: Server) {
  if (process.env.NODE_ENV !== 'development') {
    log('Running in production mode - Vite setup skipped', 'server');
    return; // Don't setup Vite in production
  }
  
  log('Setting up Vite for development mode', 'server');
  
  // We're using a Function constructor to avoid direct imports of Vite
  // which would be processed at build time even inside conditional blocks
  try {
    // This prevents the 'vite' import from being included in production builds
    // The function constructor creates functions at runtime, not build time
    const importVite = new Function('return import("vite").catch(err => { console.error("Failed to import Vite:", err.message); return { createServer: null, createLogger: null }; })');
    const importViteConfig = new Function('return import("../vite.config.js").catch(err => { console.error("Failed to import Vite config:", err.message); return { default: {} }; })');
    
    const viteModule = await importVite();
    const viteConfigModule = await importViteConfig();
    
    if (!viteModule.createServer) {
      throw new Error("Vite's createServer function is not available");
    }
    
    const { createServer, createLogger } = viteModule;
    const viteConfig = viteConfigModule.default;
    
    const serverOptions = {
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true,
    };

    const baseLogger = createLogger();
    const logger = {
      ...baseLogger,
      error: (msg: any, options: any) => {
        baseLogger.error(msg, options);
        console.error(msg);
      }
    };

    const vite = await createServer({
      ...viteConfig,
      configFile: false,
      customLogger: logger,
      server: serverOptions,
      appType: "custom",
    });

    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;

      try {
        const clientTemplate = path.resolve(
          process.cwd(),
          "client",
          "index.html",
        );

        // Always reload the index.html file from disk in case it changes
        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`,
        );
        const page = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e: any) {
        if (vite.ssrFixStacktrace) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  } catch (error) {
    console.error("Failed to setup Vite:", error);
  }
}

/**
 * Serve static files in production mode
 */
export function serveStatic(app: Express) {
  // Use dist/public in production
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    console.error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
    // Fallback to basic error page
    app.use("*", (_req, res) => {
      res.status(500).send("Server error: The application hasn't been built correctly. Run 'npm run build' first.");
    });
    return;
  }

  app.use(express.static(distPath));

  // Fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
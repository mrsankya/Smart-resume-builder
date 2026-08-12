// ============================================
// app.js - Express Application Setup
// ============================================
// Configures the Express app with CORS, body parsing,
// API routes, and error handling.
// ============================================

import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

const app = express(); // Express app instance (Express.js: Application Setup)

// --- Dynamic CORS & Security Middleware ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, x-canva-token');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://*.canva.com https://canva.com;");

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '10mb' })); // JSON body parser (Express.js: Middleware)

// --- Health Check Endpoint ---
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'AI Resume Builder API is operational',
    timestamp: new Date().toISOString(),
  });
});

// --- Routes ---
app.use('/api', routes); // Route mounting (Express.js: Route Organization)

// --- Error Handling ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

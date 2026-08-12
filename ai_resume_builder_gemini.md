# AI Resume Builder - Project Memory & Context

## Overview
Full-stack AI-Powered Resume Builder application (MERN Stack with Gemini AI).
- Frontend: Vite + React 19 + Tailwind CSS + `@react-oauth/google`
- Backend: Express.js (Node.js ES Modules) + MongoDB Mongoose + Google Auth Library (`google-auth-library`) + Google GenAI / LangChain

## Directory Structure
- Root: `C:\Users\sanke\AI resume builder\resume builder`
  - `client/`: React/Vite Frontend (Port 5173)
  - `server/`: Express backend API (Port 5000)

## Cloudflare Quick Tunnels & Canva Integration
- **Quick Tunnels**: Free, instant public HTTPS endpoints generated via Cloudflare (`npx --yes cloudflared tunnel --url http://localhost:PORT`):
  - **Frontend Tunnel**: Proxies `http://localhost:5173` -> `https://*.trycloudflare.com`
  - **Backend Tunnel**: Proxies `http://localhost:5000` -> `https://*.trycloudflare.com`
- **Canva Integration Readiness**:
  - **CORS Support**: Express server configured in `server/src/app.js` with open CORS origins, credentials, and preflight headers.
  - **Canva Iframe Embedding**: Added `Content-Security-Policy: frame-ancestors 'self' https://*.canva.com https://canva.com;` to allow embedding inside Canva Apps.
  - **Vite Host Header Allowance**: Updated `client/vite.config.js` with `host: true` and `allowedHosts: true` to support incoming Cloudflare Tunnel traffic.
  - **API Health Endpoint**: Added `GET /api/health` returning `{ status: 'ok', message: 'AI Resume Builder API is operational' }`.
- **Launch Scripts**:
  - `start_cloudflare_tunnels.bat`: One-click launcher for Frontend & Backend Cloudflare Quick Tunnels.
  - `start_all_with_tunnels.bat`: Launches Backend Server, Frontend Client, and both Cloudflare Tunnels in parallel.
  - `tunnel.js`: Node.js script that spawns both tunnels, parses output, and saves active URLs to `tunnel_urls.json`.
  - `run_tunnels.ps1`: PowerShell runner for launching tunnels in separate windows.

## Google Authentication Integration
- **Frontend Client ID**: Loaded via `VITE_GOOGLE_CLIENT_ID` (`269277017328-gecn7nj1aibds3sb09cgq04v3a38i5in.apps.googleusercontent.com`) in `client/.env` and wrapped by `<GoogleOAuthProvider>` in `client/src/main.jsx`.
- **Backend Verification**: Verified using `OAuth2Client.verifyIdToken` in `server/src/config/google.config.js`.
- **Account Linking & DB**: In `server/src/services/auth.service.js`, matches users by `googleId` OR `email`, safely updates existing user profiles or creates new Google-authenticated user records without duplicate-key collisions.

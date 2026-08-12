# Smart Resume Builder - Project Memory & Context

## Overview
Full-stack AI-Powered Resume Builder application (MERN Stack with Gemini AI).
- Frontend: Vite + React 19 + Tailwind CSS + `@react-oauth/google`
- Backend: Express.js (Node.js ES Modules) + MongoDB Mongoose + Google Auth Library (`google-auth-library`) + Google GenAI / LangChain

## Directory Structure
- Root: `resume builder`
  - `client/`: React/Vite Frontend
  - `server/`: Express backend API

## Google Authentication Integration
- **Frontend Client ID**: Loaded via `VITE_GOOGLE_CLIENT_ID` in `client/.env` and wrapped by `<GoogleOAuthProvider>` in `client/src/main.jsx`.
- **Backend Verification**: Verified using `OAuth2Client.verifyIdToken` in `server/src/config/google.config.js`.
- **Account Linking & DB**: In `server/src/services/auth.service.js`, matches users by `googleId` OR `email`, safely updates existing user profiles or creates new Google-authenticated user records without duplicate-key collisions.

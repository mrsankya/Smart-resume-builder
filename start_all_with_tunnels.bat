@echo off
title Smart Resume Builder - Complete Dev Environment + Cloudflare Tunnels
echo ======================================================================
echo          Starting AI Resume Builder + Cloudflare Quick Tunnels
echo ======================================================================
echo.

echo [1/3] Starting Backend Server (Port 5000)...
start "AI Resume Builder - Server" cmd /k "cd /d %~dp0server && npm run dev"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Frontend Client (Port 5173)...
start "AI Resume Builder - Client" cmd /k "cd /d %~dp0client && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Cloudflare Quick Tunnels for External Access & Canva...
start "Cloudflare Tunnel - Backend (5000)" cmd /k "npx --yes cloudflared tunnel --url http://localhost:5000"
start "Cloudflare Tunnel - Frontend (5173)" cmd /k "npx --yes cloudflared tunnel --url http://localhost:5173"

echo.
echo ======================================================================
echo All 4 services are running!
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:5173
echo - Live Cloudflare Tunnels: Inspect the tunnel command windows for HTTPS links
echo ======================================================================
pause

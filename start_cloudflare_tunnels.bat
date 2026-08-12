@echo off
title Cloudflare Quick Tunnels - Smart Resume Builder
echo ======================================================================
echo           Starting Cloudflare Quick Tunnels (Frontend + Backend)
echo ======================================================================
echo.

echo Launching Cloudflare Tunnel for Backend (Port 5000)...
start "Cloudflare Tunnel - Backend (5000)" cmd /k "npx --yes cloudflared tunnel --url http://localhost:5000"

echo Launching Cloudflare Tunnel for Frontend (Port 5173)...
start "Cloudflare Tunnel - Frontend (5173)" cmd /k "npx --yes cloudflared tunnel --url http://localhost:5173"

echo.
echo Both Cloudflare Tunnels have been launched!
echo Look at the command windows for your live https://*.trycloudflare.com URLs.
echo ======================================================================
pause

@echo off
echo Starting Backend Server (Port 5000)...
start "AI Resume Builder - Server" cmd /k "cd /d %~dp0server && npm run dev"

echo Starting Frontend Client (Port 5173)...
start "AI Resume Builder - Client" cmd /k "cd /d %~dp0client && npm run dev"

echo Dev servers started!

@echo off
title CareerTwin Frontend (Vite + React)
echo ====================================================
echo Starting CareerTwin Frontend on port 5173...
echo ====================================================
cd /d "%~dp0frontend"
call npm run dev
pause

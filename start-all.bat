@echo off
title CareerTwin Launcher
echo ====================================================
echo   CareerTwin: AI-Powered Placement Readiness Platform
echo ====================================================
echo Starting both Backend and Frontend in separate windows...
start "CareerTwin Backend" cmd /k "%~dp0start-backend.bat"
timeout /t 5 /nobreak >nul
start "CareerTwin Frontend" cmd /k "%~dp0start-frontend.bat"
echo.
echo Both servers are launching!
echo Backend:  http://localhost:8085/api
echo Frontend: http://localhost:5173/
echo.
pause

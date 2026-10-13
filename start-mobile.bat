@echo off
title CareerTwin Mobile (React Native + Expo)
echo ====================================================
echo   CareerTwin Mobile App: React Native + Expo
echo ====================================================
echo.
echo Make sure your Spring Boot backend is running on port 8085!
echo Starting Expo Metro Bundler...
echo.
cd /d "%~dp0mobile"
call npx expo start
pause

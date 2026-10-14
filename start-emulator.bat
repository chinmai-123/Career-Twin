@echo off
title Launch Android Emulator (Pixel_6)
echo ====================================================
echo   Launching Android Emulator (Pixel_6)...
echo ====================================================
echo.
start "" "%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -avd Pixel_6
echo.
echo Emulator window launched!
echo Please wait about 20-30 seconds for it to finish booting
echo before pressing 'a' in Expo Metro bundler.
echo.
pause

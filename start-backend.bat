@echo off
title CareerTwin Backend (Spring Boot)
echo ====================================================
echo Starting CareerTwin Backend on port 8085...
echo ====================================================
cd /d "%~dp0backend"

set "MVN_CMD="

:: 1. Check if mvn is in system PATH
where mvn >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set "MVN_CMD=mvn"
    goto :run_mvn
)

:: 2. Check local maven installation in .m2
for /r "%USERPROFILE%\.m2\wrapper\dists" %%F in (mvn.cmd) do (
    if exist "%%F" (
        set "MVN_CMD=%%F"
        goto :run_mvn
    )
)

:: 3. Check maven wrapper script in backend
if exist mvnw.cmd (
    set "MVN_CMD=mvnw.cmd"
    goto :run_mvn
)

echo [ERROR] Maven was not detected. Please ensure Maven or Java is available.
pause
exit /b 1

:run_mvn
echo Detected Maven executable at: %MVN_CMD%
call "%MVN_CMD%" spring-boot:run
pause

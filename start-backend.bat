@echo off
title CareerTwin Backend (Spring Boot)
echo ====================================================
echo Starting CareerTwin Backend on port 8085...
echo ====================================================
cd /d "%~dp0backend"
if exist mvnw.cmd (
    call mvnw.cmd spring-boot:run
) else (
    call mvn spring-boot:run
)
pause

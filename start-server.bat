@echo off
title Sikamali Backend Server
cd /d "%~dp0"
echo ==========================================
echo Starting Sikamali Backend Development Server
echo ==========================================
echo.
npx nodemon index.js -- --host=0.0.0.0
echo.
echo Server has stopped.
pause

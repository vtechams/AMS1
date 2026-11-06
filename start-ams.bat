@echo off
title Academy Management System (AMS) Launcher
echo ====================================================
echo        Academy Management System (AMS)
echo        Excel-Powered Full Stack Application
echo ====================================================
echo.

echo Starting AMS Backend on http://localhost:5000 ...
start "AMS Backend Server" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting AMS Frontend on http://localhost:3000 ...
start "AMS Frontend Client" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo AMS is now running!
echo Primary Excel Database: %~dp0database\Academy_Database.xlsx
echo Default Admin Credentials:
echo   Email:    admin@ams.local
echo   Password: admin123
echo.
pause


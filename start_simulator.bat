@echo off
title Tesla Roadster 2026 Simulator Launcher
cd /d "%~dp0\apps\web-simulator"
echo Starting Tesla Roadster 2026 Digital Twin & Flight Simulator...
start "" "http://localhost:3000"
npm.cmd run dev
pause

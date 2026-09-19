@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22 or newer from https://nodejs.org, then open this file again.
  pause
  exit /b 1
)
node scripts/start.mjs %*
set "portal_exit=%errorlevel%"
if not "%portal_exit%"=="0" pause
exit /b %portal_exit%

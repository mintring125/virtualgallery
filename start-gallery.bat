@echo off
setlocal

cd /d "%~dp0"

set PORT=%~1
if "%PORT%"=="" set PORT=3100

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found.
  echo Install Node.js first, then run this file again.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm.cmd was not found.
  echo Check your Node.js installation, then run this file again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting the classroom virtual gallery...
echo.
echo Local URL:
echo   http://localhost:%PORT%
echo.
echo Teacher example:
echo   http://localhost:%PORT%/gallery/class-3-2?role=teacher^&name=homeroom
echo Student example:
echo   http://localhost:%PORT%/gallery/class-3-2?role=student^&name=student
echo.

call npm.cmd run dev -- --hostname 127.0.0.1 --port %PORT%

endlocal

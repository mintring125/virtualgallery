@echo off
setlocal

set PORT=%~1
if "%PORT%"=="" set PORT=3100

for /f "tokens=5" %%a in ('netstat -ano ^| findstr /r /c:":%PORT% .*LISTENING"') do (
  set PID=%%a
  goto :found
)

echo No server is listening on port %PORT%.
goto :end

:found
echo Stopping gallery server on port %PORT% ^(PID %PID%^)^...
taskkill /PID %PID% /F >nul 2>nul

if errorlevel 1 (
  echo Failed to stop process %PID%.
) else (
  echo Gallery server stopped.
)

:end
endlocal

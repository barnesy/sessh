@echo off
cd /d "%~dp0"
echo ================================================================
echo   Building Session Drummer ("sessh") GitHub Pages PWA Bundle...
echo ================================================================
node build-sessh-pwa.js
echo.
echo Built standalone PWA in: %~dp0docs
echo Ready to commit and push to GitHub Pages!
pause

@echo off
cd /d "%~dp0"
echo ================================================================
echo   Building Session Drummer ("sessh") GitHub Pages PWA Bundle...
echo ================================================================
node build-sessh-pwa.js
echo.
echo Built standalone PWA in: %~dp0docs
git add docs/ .github/ build-sessh-pwa.js Publish-Sessh-GitHubPages.bat README.md
git commit -m "Update Session Drummer (sessh) PWA bundle"
git push origin main
echo.
echo Live at: https://barnesy.github.io/sessh/
pause

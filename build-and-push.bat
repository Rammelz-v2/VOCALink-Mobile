@echo off
echo === Cleaning node_modules and lock file ===
powershell -Command "Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules"
if exist package-lock.json del package-lock.json

echo === Fresh npm install ===
npm install

echo === Staging files ===
git add .npmrc package-lock.json

echo === Committing ===
git commit -m "Add .npmrc legacy-peer-deps and regenerate lockfile"

echo === Pushing to both remotes ===
git push origin main
git push org main

echo === Triggering EAS build ===
eas build -p android --profile preview

echo === Done! Check EAS dashboard for build status ===
pause

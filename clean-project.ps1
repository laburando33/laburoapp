Write-Host "🧼 Limpiando monorepo Laburando..."

# Borrar node_modules y locks
Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue

# Borrar node_modules dentro de apps
Remove-Item -Recurse -Force "apps\web\node_modules" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "apps\mobile\node_modules" -ErrorAction SilentlyContinue

# Borrar locks en apps
Remove-Item -Force "apps\web\package-lock.json" -ErrorAction SilentlyContinue
Remove-Item -Force "apps\mobile\package-lock.json" -ErrorAction SilentlyContinue

# Carpetas de cache
Remove-Item -Recurse -Force ".expo" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".turbo" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".vscode" -ErrorAction SilentlyContinue

# Logs y archivos basura
Get-ChildItem -Path . -Include *.log, *.tmp, *.bak -Recurse | Remove-Item -Force

Write-Host "✅ Limpieza completada. Ahora corré:"
Write-Host "`n1. cd apps/mobile"
Write-Host "2. npm install"
Write-Host "3. npx expo install"
Write-Host "4. npx expo doctor"
Write-Host "5. npx eas build --platform android --profile preview"

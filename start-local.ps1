# TeamFlow — start backend + frontend locally (PowerShell)
$root = $PSScriptRoot

Write-Host "`n=== TeamFlow Local Setup ===`n" -ForegroundColor Cyan
Write-Host "Backend uses built-in in-memory MongoDB (no install required).`n" -ForegroundColor Gray

Write-Host "Starting backend on http://localhost:5000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm run dev"

Start-Sleep -Seconds 8

Write-Host "Starting frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host "`nOpen http://localhost:5173 — sign up to create your account.`n" -ForegroundColor Green

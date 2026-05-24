$apiDir = Join-Path $PSScriptRoot "..\backend\api"
Set-Location $apiDir

if (-not (Test-Path ".venv")) {
  python -m venv .venv
}

& .\.venv\Scripts\pip.exe install -r requirements.txt
Copy-Item -Path ".env.example" -Destination ".env" -ErrorAction SilentlyContinue

Write-Host "API ready. Run: npm run dev:api"

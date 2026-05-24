# One-time: add Docker CLI to your user PATH (run in PowerShell as yourself)
$dockerBin = "${env:ProgramFiles}\Docker\Docker\resources\bin"
if (-not (Test-Path "$dockerBin\docker.exe")) {
  Write-Error "Docker not found at $dockerBin. Install Docker Desktop first."
  exit 1
}

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -split ';' -contains $dockerBin) {
  Write-Host "Docker bin already on user PATH: $dockerBin"
} else {
  [Environment]::SetEnvironmentVariable("Path", "$userPath;$dockerBin", "User")
  Write-Host "Added to user PATH: $dockerBin"
  Write-Host "Close and reopen PowerShell / Cursor terminal, then: npm run infra:up"
}

# Print Cloud - Simple Backup Script
param(
    [string]$BackupPath = "E:\Backups\Print_Cloud_Backups"
)

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backupName = "Print_Cloud_v1_backup_$timestamp"
$fullBackupPath = Join-Path $BackupPath $backupName

Write-Host "Creating backup directory..." -ForegroundColor Yellow
if (-not (Test-Path $BackupPath)) {
    New-Item -Path $BackupPath -ItemType Directory -Force | Out-Null
}
New-Item -Path $fullBackupPath -ItemType Directory -Force | Out-Null

Write-Host "Copying files..." -ForegroundColor Yellow

# Copy all files except excluded patterns
robocopy $projectRoot $fullBackupPath /E /XD node_modules .next dist build /XF *.log azure_ad_config.json .env.local tsconfig.tsbuildinfo /R:0 /W:0 /NJH /NJS

# Create backup info
$backupInfo = @{
    BackupDate = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    ProjectName = "Print_Cloud_v1"
    ProjectPath = $projectRoot
    CreatedBy = $env:USERNAME
    Machine = $env:COMPUTERNAME
    RestoreInstructions = @(
        "1. Copy backup to desired location",
        "2. Run: npm install",
        "3. Copy .env.example to .env.local and configure",
        "4. For local: docker-compose up -d",
        "5. For Azure: .\scripts\migration\migrate_complete.ps1"
    )
}

$infoFile = Join-Path $fullBackupPath "BACKUP_INFO.json"
$backupInfo | ConvertTo-Json -Depth 3 | Out-File -FilePath $infoFile -Encoding UTF8

$backupSize = (Get-ChildItem -Path $fullBackupPath -Recurse | Measure-Object -Property Length -Sum).Sum
$backupSizeMB = [math]::Round($backupSize / 1MB, 2)
$fileCount = (Get-ChildItem -Path $fullBackupPath -Recurse -File).Count

Write-Host ""
Write-Host "Backup Summary:" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "Backup Path: $fullBackupPath" -ForegroundColor White
Write-Host "Backup Size: $backupSizeMB MB" -ForegroundColor White
Write-Host "Files Backed Up: $fileCount" -ForegroundColor White
Write-Host ""
Write-Host "Backup completed successfully!" -ForegroundColor Green

Write-Host ""
Write-Host "Backup Contents:" -ForegroundColor Yellow
Write-Host "- Source code (src/)" -ForegroundColor Gray
Write-Host "- Migration scripts (scripts/migration/)" -ForegroundColor Gray
Write-Host "- Documentation (*.md)" -ForegroundColor Gray
Write-Host "- Docker configuration" -ForegroundColor Gray
Write-Host "- Package configuration" -ForegroundColor Gray
Write-Host "- Database schema (prisma/)" -ForegroundColor Gray
Write-Host ""
Write-Host "Note: node_modules excluded. Run 'npm install' after restore." -ForegroundColor Yellow
# ============================================================================
# Print Cloud - Complete Project Backup Script
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupLocation = "E:\Backups\Print_Cloud_Backups",
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectName = "Print_Cloud_v1",
    
    [Parameter(Mandatory=$false)]
    [switch]$IncludeNodeModules = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$CreateZip = $true
)

Write-Host "📦 Print Cloud - Complete Project Backup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current directory (project root)
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectName = Split-Path -Leaf $projectRoot

Write-Host "Project Root: $projectRoot" -ForegroundColor Gray
Write-Host "Project Name: $projectName" -ForegroundColor Gray
Write-Host ""

# Create backup directory with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupName = "$($projectName)_backup_$timestamp"
$backupPath = Join-Path $BackupLocation $backupName

Write-Host "Creating backup directory..." -ForegroundColor Yellow
if (-not (Test-Path $BackupLocation)) {
    New-Item -Path $BackupLocation -ItemType Directory -Force | Out-Null
    Write-Host "Created backup location: $BackupLocation" -ForegroundColor Green
}

New-Item -Path $backupPath -ItemType Directory -Force | Out-Null
Write-Host "Backup directory: $backupPath" -ForegroundColor Green
Write-Host ""

# Function to copy files with exclusions
function Copy-ProjectFiles {
    param(
        [string]$Source,
        [string]$Destination
    )
    
    $excludePatterns = @(
        "node_modules",
        ".next",
        "dist",
        "build",
        "*.log",
        ".env.local",
        "azure_ad_config.json",
        "tsconfig.tsbuildinfo"
    )
    
    if ($IncludeNodeModules) {
        $excludePatterns = $excludePatterns | Where-Object { $_ -ne "node_modules" }
    }
    
    Write-Host "Copying project files..." -ForegroundColor Yellow
    Write-Host "Source: $Source" -ForegroundColor Gray
    Write-Host "Destination: $Destination" -ForegroundColor Gray
    
    # Get all items recursively
    $allItems = Get-ChildItem -Path $Source -Recurse
    $totalItems = $allItems.Count
    $currentItem = 0
    
    foreach ($item in $allItems) {
        $currentItem++
        $relativePath = $item.FullName.Substring($Source.Length + 1)
        
        # Check if item should be excluded
        $shouldExclude = $false
        foreach ($pattern in $excludePatterns) {
            if ($relativePath -like "*$pattern*") {
                $shouldExclude = $true
                break
            }
        }
        
        if (-not $shouldExclude) {
            $destPath = Join-Path $Destination $relativePath
            $destDir = Split-Path $destPath -Parent
            
            if (-not (Test-Path $destDir)) {
                New-Item -Path $destDir -ItemType Directory -Force | Out-Null
            }
            
            if ($item.PSIsContainer -eq $false) {
                Copy-Item -Path $item.FullName -Destination $destPath -Force
            }
        }
        
        # Progress indicator
        if ($currentItem % 100 -eq 0) {
            $percent = [math]::Round(($currentItem / $totalItems) * 100, 1)
            Write-Host "Progress: $percent% ($currentItem/$totalItems)" -ForegroundColor Gray
        }
    }
    
    Write-Host "Files copied successfully!" -ForegroundColor Green
}

# Function to create backup info file
function New-BackupInfo {
    param([string]$BackupPath)
    
    $backupInfo = @{
        BackupDate = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        ProjectName = $projectName
        ProjectPath = $projectRoot
        BackupVersion = "1.0"
        GitCommit = ""
        GitBranch = ""
        NodeModulesIncluded = $IncludeNodeModules
        CreatedBy = $env:USERNAME
        Machine = $env:COMPUTERNAME
        PowerShellVersion = $PSVersionTable.PSVersion.ToString()
        Files = @{
            Source = "Complete Print Cloud project"
            Scripts = "Migration scripts included"
            Configuration = "Environment configs included (.env.example)"
            Documentation = "All documentation files included"
            Dependencies = "package.json and package-lock.json included"
        }
        RestoreInstructions = @(
            "1. Extract backup to desired location",
            "2. Run: npm install",
            "3. Copy .env.example to .env.local and configure",
            "4. For local development: docker-compose up -d",
            "5. For Azure deployment: .\scripts\migration\migrate_complete.ps1"
        )
    }
    
    # Try to get git information
    try {
        Push-Location $projectRoot
        $gitCommit = git rev-parse HEAD 2>$null
        $gitBranch = git rev-parse --abbrev-ref HEAD 2>$null
        if ($gitCommit) {
            $backupInfo.GitCommit = $gitCommit
        }
        if ($gitBranch) {
            $backupInfo.GitBranch = $gitBranch
        }
        Pop-Location
    } catch {
        # Git not available or not a git repo
    }
    
    $infoFile = Join-Path $BackupPath "BACKUP_INFO.json"
    $backupInfo | ConvertTo-Json -Depth 3 | Out-File -FilePath $infoFile -Encoding UTF8
    
    Write-Host "Backup info created: BACKUP_INFO.json" -ForegroundColor Green
}

# Function to create zip file
function New-BackupZip {
    param(
        [string]$SourcePath,
        [string]$ZipPath
    )
    
    Write-Host "Creating ZIP archive..." -ForegroundColor Yellow
    
    try {
        # Use .NET compression
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::CreateFromDirectory($SourcePath, $ZipPath)
        
        $zipSize = [math]::Round((Get-Item $ZipPath).Length / 1MB, 2)
        Write-Host "ZIP created: $ZipPath ($zipSize MB)" -ForegroundColor Green
        
        # Optionally remove the folder after zipping
        Write-Host "Remove backup folder? (ZIP contains everything) [Y/N]:" -ForegroundColor Yellow -NoNewline
        $response = Read-Host
        if ($response -eq 'Y' -or $response -eq 'y') {
            Remove-Item -Path $SourcePath -Recurse -Force
            Write-Host "Backup folder removed (ZIP preserved)" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "Error creating ZIP: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Backup folder preserved at: $SourcePath" -ForegroundColor Yellow
    }
}

# Main backup process
Write-Host "Starting backup process..." -ForegroundColor Yellow
$startTime = Get-Date

# Copy project files
Copy-ProjectFiles -Source $projectRoot -Destination $backupPath

Write-Host ""

# Create backup info
New-BackupInfo -BackupPath $backupPath

# Get backup size
$backupSize = (Get-ChildItem -Path $backupPath -Recurse | Measure-Object -Property Length -Sum).Sum
$backupSizeMB = [math]::Round($backupSize / 1MB, 2)

Write-Host ""
Write-Host "📋 Backup Summary:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "Project: $projectName" -ForegroundColor White
Write-Host "Backup Path: $backupPath" -ForegroundColor White
Write-Host "Backup Size: $backupSizeMB MB" -ForegroundColor White
Write-Host "Node Modules: $(if($IncludeNodeModules){'Included'}else{'Excluded'})" -ForegroundColor White

$fileCount = (Get-ChildItem -Path $backupPath -Recurse -File).Count
Write-Host "Files Backed Up: $fileCount" -ForegroundColor White

$endTime = Get-Date
$duration = $endTime - $startTime
Write-Host "Duration: $($duration.ToString('mm\:ss'))" -ForegroundColor White
Write-Host ""

# Create ZIP if requested
if ($CreateZip) {
    $zipPath = "$backupPath.zip"
    New-BackupZip -SourcePath $backupPath -ZipPath $zipPath
}

Write-Host "Backup completed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "Backup Contents:" -ForegroundColor Yellow
Write-Host "- Source code (src/)" -ForegroundColor Gray
Write-Host "- Migration scripts (scripts/migration/)" -ForegroundColor Gray
Write-Host "- Documentation (*.md)" -ForegroundColor Gray
Write-Host "- Docker configuration" -ForegroundColor Gray
Write-Host "- Package configuration (package.json)" -ForegroundColor Gray
Write-Host "- Database schema (prisma/)" -ForegroundColor Gray
Write-Host "- Azure configuration templates" -ForegroundColor Gray

if (-not $IncludeNodeModules) {
    Write-Host ""
    Write-Host "Note: node_modules excluded. Run 'npm install' after restore." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backup process completed" -ForegroundColor Cyan
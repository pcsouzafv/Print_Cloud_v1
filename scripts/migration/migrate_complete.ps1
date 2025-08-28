# ============================================================================
# Print Cloud Migration - Complete Migration Script
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$AppName = "Print Cloud Production",
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "rg-printcloud-prod",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "Brazil South",
    
    [Parameter(Mandatory=$false)]
    [string]$ConfigFile = "azure_ad_config.json",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipPrereqs,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

Write-Host "🚀 Print Cloud Complete Migration" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will perform a complete migration of Print Cloud to Azure." -ForegroundColor Yellow
Write-Host "The process includes:" -ForegroundColor Yellow
Write-Host "  1. Prerequisites check" -ForegroundColor Gray
Write-Host "  2. Azure AD configuration" -ForegroundColor Gray
Write-Host "  3. Infrastructure deployment" -ForegroundColor Gray
Write-Host "  4. Redirect URIs update" -ForegroundColor Gray
Write-Host "  5. Database migrations" -ForegroundColor Gray
Write-Host ""

# Function to run script and check result
function Invoke-MigrationStep {
    param(
        [string]$StepName,
        [string]$ScriptPath,
        [string[]]$Arguments = @(),
        [bool]$StopOnError = $true
    )
    
    Write-Host "🔄 Step: $StepName" -ForegroundColor Yellow
    Write-Host "   Script: $ScriptPath" -ForegroundColor Gray
    
    if ($Arguments.Count -gt 0) {
        Write-Host "   Arguments: $($Arguments -join ' ')" -ForegroundColor Gray
    }
    
    Write-Host ""
    
    try {
        if ($Arguments.Count -gt 0) {
            & $ScriptPath @Arguments
        } else {
            & $ScriptPath
        }
        
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-Host ""
            Write-Host "✅ $StepName completed successfully!" -ForegroundColor Green
            Write-Host ""
            return $true
        } else {
            Write-Host ""
            Write-Host "❌ $StepName failed with exit code: $exitCode" -ForegroundColor Red
            
            if ($StopOnError) {
                Write-Host ""
                Write-Host "Migration stopped due to error. Please check the output above." -ForegroundColor Red
                exit $exitCode
            }
            
            return $false
        }
    } catch {
        Write-Host ""
        Write-Host "❌ $StepName failed with exception: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($StopOnError) {
            Write-Host ""
            Write-Host "Migration stopped due to error. Please check the output above." -ForegroundColor Red
            exit 1
        }
        
        return $false
    }
}

# Function to check if script exists
function Test-MigrationScript {
    param([string]$ScriptPath)
    
    if (-not (Test-Path $ScriptPath)) {
        Write-Host "❌ Migration script not found: $ScriptPath" -ForegroundColor Red
        Write-Host "Please ensure all migration scripts are in the correct location." -ForegroundColor Red
        exit 1
    }
}

# Function to display summary
function Show-MigrationSummary {
    param([object]$Config)
    
    Write-Host ""
    Write-Host "🎉 MIGRATION COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Deployment Summary:" -ForegroundColor Cyan
    Write-Host "=====================" -ForegroundColor Cyan
    Write-Host "Application Name: $($Config.AzureAD.AppName)" -ForegroundColor White
    Write-Host "Application URL:  $($Config.Deployment.Infrastructure.Application.URL)" -ForegroundColor White
    Write-Host "Resource Group:   $($Config.Deployment.Infrastructure.ResourceGroup)" -ForegroundColor White
    Write-Host "Location:         $($Config.Deployment.Infrastructure.Location)" -ForegroundColor White
    Write-Host ""
    Write-Host "🔐 Azure AD Configuration:" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    Write-Host "Client ID:        $($Config.AzureAD.ClientId)" -ForegroundColor White
    Write-Host "Tenant ID:        $($Config.AzureAD.TenantId)" -ForegroundColor White
    Write-Host "Tenant Domain:    $($Config.Tenant.TenantName)" -ForegroundColor White
    Write-Host ""
    Write-Host "🗄️  Database Configuration:" -ForegroundColor Cyan
    Write-Host "==========================" -ForegroundColor Cyan
    Write-Host "Server:           $($Config.Deployment.Infrastructure.Database.Server)" -ForegroundColor White
    Write-Host "Database:         $($Config.Deployment.Infrastructure.Database.Database)" -ForegroundColor White
    Write-Host "Username:         $($Config.Deployment.Infrastructure.Database.Username)" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Authentication URLs:" -ForegroundColor Cyan
    Write-Host "======================" -ForegroundColor Cyan
    foreach ($uri in $Config.RedirectURIs) {
        Write-Host "- $uri" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "⚠️  IMPORTANT SECURITY NOTES:" -ForegroundColor Yellow
    Write-Host "============================" -ForegroundColor Yellow
    Write-Host "• Save the database password securely: $($Config.Deployment.Infrastructure.Database.Password)" -ForegroundColor Red
    Write-Host "• Configuration saved to: $ConfigFile" -ForegroundColor Yellow
    Write-Host "• Keep this configuration file secure and backed up" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🚀 Your Print Cloud application is now running at:" -ForegroundColor Green
    Write-Host "$($Config.Deployment.Infrastructure.Application.URL)" -ForegroundColor White
    Write-Host ""
}

# Main execution
$ErrorActionPreference = "Continue"
$startTime = Get-Date

Write-Host "Migration started at: $($startTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray
Write-Host ""

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Define script paths
$scripts = @{
    "01_prereqs_check" = Join-Path $scriptDir "01_prereqs_check.ps1"
    "02_configure_azure_ad" = Join-Path $scriptDir "02_configure_azure_ad.ps1"
    "03_deploy_infrastructure" = Join-Path $scriptDir "03_deploy_infrastructure.ps1"
    "04_update_redirect_uris" = Join-Path $scriptDir "04_update_redirect_uris.ps1"
    "05_run_migrations" = Join-Path $scriptDir "05_run_migrations.ps1"
}

# Check all scripts exist
foreach ($script in $scripts.Values) {
    Test-MigrationScript -ScriptPath $script
}

# Step 1: Prerequisites Check
if (-not $SkipPrereqs) {
    $success = Invoke-MigrationStep -StepName "Prerequisites Check" -ScriptPath $scripts["01_prereqs_check"]
    if (-not $success) {
        Write-Host "Please install missing prerequisites and try again." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  Skipping prerequisites check as requested." -ForegroundColor Yellow
    Write-Host ""
}

# Step 2: Azure AD Configuration
$azureAdArgs = @()
if ($AppName -ne "Print Cloud Production") {
    $azureAdArgs += "-AppName", $AppName
}
if ($ConfigFile -ne "azure_ad_config.json") {
    $azureAdArgs += "-OutputFile", $ConfigFile
}

Invoke-MigrationStep -StepName "Azure AD Configuration" -ScriptPath $scripts["02_configure_azure_ad"] -Arguments $azureAdArgs

# Step 3: Infrastructure Deployment
$infraArgs = @()
if ($ConfigFile -ne "azure_ad_config.json") {
    $infraArgs += "-ConfigFile", $ConfigFile
}
if ($ResourceGroup -ne "rg-printcloud-prod") {
    $infraArgs += "-ResourceGroup", $ResourceGroup
}
if ($Location -ne "Brazil South") {
    $infraArgs += "-Location", $Location
}

Invoke-MigrationStep -StepName "Infrastructure Deployment" -ScriptPath $scripts["03_deploy_infrastructure"] -Arguments $infraArgs

# Step 4: Update Redirect URIs
$uriArgs = @()
if ($ConfigFile -ne "azure_ad_config.json") {
    $uriArgs += "-ConfigFile", $ConfigFile
}

Invoke-MigrationStep -StepName "Update Redirect URIs" -ScriptPath $scripts["04_update_redirect_uris"] -Arguments $uriArgs

# Step 5: Database Migrations
$dbArgs = @()
if ($ConfigFile -ne "azure_ad_config.json") {
    $dbArgs += "-ConfigFile", $ConfigFile
}

Invoke-MigrationStep -StepName "Database Migrations" -ScriptPath $scripts["05_run_migrations"] -Arguments $dbArgs

# Load final configuration for summary
try {
    $finalConfig = Get-Content $ConfigFile | ConvertFrom-Json
    Show-MigrationSummary -Config $finalConfig
} catch {
    Write-Host "⚠️  Could not load final configuration for summary." -ForegroundColor Yellow
}

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Migration completed at: $($endTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray
Write-Host "Total duration: $($duration.ToString('hh\:mm\:ss'))" -ForegroundColor Gray
Write-Host "=================================" -ForegroundColor Cyan
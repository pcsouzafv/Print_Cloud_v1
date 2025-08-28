# ============================================================================
# Print Cloud Migration - Step 4: Update Azure AD Redirect URIs
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$ConfigFile = "azure_ad_config.json"
)

Write-Host "🔗 Print Cloud Migration - Update Redirect URIs" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Function to load configuration
function Get-Config {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        try {
            $config = Get-Content $FilePath | ConvertFrom-Json
            return $config
        } catch {
            Write-Host "❌ Error reading config file: $($_.Exception.Message)" -ForegroundColor Red
            return $null
        }
    } else {
        Write-Host "⚠️  Config file not found: $FilePath" -ForegroundColor Yellow
        return $null
    }
}

# Function to update SPA redirect URIs
function Update-SPARedirectURIs {
    param(
        [string]$ObjectId,
        [string[]]$RedirectURIs
    )
    
    Write-Host "Updating SPA redirect URIs..." -ForegroundColor Yellow
    
    try {
        $body = @{
            spa = @{
                redirectUris = $RedirectURIs
            }
        } | ConvertTo-Json -Depth 3
        
        az rest --method PATCH --uri "https://graph.microsoft.com/v1.0/applications/$ObjectId" --headers "Content-Type=application/json" --body $body
        
        Write-Host "✅ SPA redirect URIs updated successfully!" -ForegroundColor Green
        foreach ($uri in $RedirectURIs) {
            Write-Host "   - $uri" -ForegroundColor Gray
        }
        
        return $true
    } catch {
        Write-Host "❌ Error updating redirect URIs: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
Write-Host "Starting redirect URIs update..." -ForegroundColor Yellow
Write-Host ""

# Load configuration
$config = Get-Config -FilePath $ConfigFile
if (-not $config) {
    Write-Host "❌ Cannot proceed without configuration. Run previous steps first." -ForegroundColor Red
    exit 1
}

# Check if deployment info exists
if (-not $config.Deployment) {
    Write-Host "❌ Deployment information not found. Run 03_deploy_infrastructure.ps1 first." -ForegroundColor Red
    exit 1
}

$objectId = $config.AzureAD.ObjectId
$appUrl = $config.Deployment.Infrastructure.Application.URL

Write-Host "Using configuration:" -ForegroundColor Gray
Write-Host "  Object ID: $objectId" -ForegroundColor Gray
Write-Host "  App URL: $appUrl" -ForegroundColor Gray
Write-Host ""

# Prepare redirect URIs
$redirectURIs = @(
    "http://localhost:3000",
    "http://localhost:3000/",
    $appUrl,
    "$appUrl/"
)

# Update redirect URIs
$updateOk = Update-SPARedirectURIs -ObjectId $objectId -RedirectURIs $redirectURIs

if ($updateOk) {
    # Update configuration
    $config.RedirectURIs = $redirectURIs
    $config.UpdatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    
    # Save updated configuration
    $config | ConvertTo-Json -Depth 5 | Out-File -FilePath $ConfigFile -Encoding UTF8
    
    Write-Host ""
    Write-Host "📋 Updated Redirect URIs:" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    foreach ($uri in $redirectURIs) {
        Write-Host "$uri" -ForegroundColor White
    }
    Write-Host ""
    
    Write-Host "🎉 Redirect URIs updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Run database migrations: .\05_run_migrations.ps1" -ForegroundColor White
    Write-Host "2. Or continue with complete migration: .\migrate_complete.ps1" -ForegroundColor White
} else {
    Write-Host "❌ Failed to update redirect URIs. Please check your permissions and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Redirect URIs update completed" -ForegroundColor Cyan
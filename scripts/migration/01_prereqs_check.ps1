# ============================================================================
# Print Cloud Migration - Step 1: Prerequisites Check
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$SubscriptionId,
    
    [Parameter(Mandatory=$false)]
    [string]$TenantId
)

Write-Host "🔍 Print Cloud Migration - Prerequisites Check" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Function to check Azure CLI version
function Test-AzureCLI {
    try {
        $version = az version --output tsv --query '"azure-cli"' 2>$null
        if ($version) {
            Write-Host "✅ Azure CLI: $version" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Azure CLI: Not installed or not working" -ForegroundColor Red
        return $false
    }
}

# Function to check Docker
function Test-Docker {
    try {
        $version = docker --version 2>$null
        if ($version) {
            Write-Host "✅ Docker: $version" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Docker: Not installed or not running" -ForegroundColor Red
        return $false
    }
}

# Function to check Node.js
function Test-NodeJS {
    try {
        $version = node --version 2>$null
        if ($version) {
            Write-Host "✅ Node.js: $version" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Node.js: Not installed" -ForegroundColor Red
        return $false
    }
}

# Function to check Git
function Test-Git {
    try {
        $version = git --version 2>$null
        if ($version) {
            Write-Host "✅ Git: $version" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Git: Not installed" -ForegroundColor Red
        return $false
    }
}

# Function to check Azure login
function Test-AzureLogin {
    try {
        $account = az account show 2>$null | ConvertFrom-Json
        if ($account) {
            Write-Host "✅ Azure Login: $($account.user.name)" -ForegroundColor Green
            Write-Host "   Subscription: $($account.name)" -ForegroundColor Gray
            Write-Host "   Tenant: $($account.tenantId)" -ForegroundColor Gray
            return $true
        }
    } catch {
        Write-Host "❌ Azure Login: Not logged in" -ForegroundColor Red
        return $false
    }
}

# Function to check required Azure providers
function Test-AzureProviders {
    $providers = @(
        "Microsoft.ContainerRegistry",
        "Microsoft.App", 
        "Microsoft.DBforPostgreSQL",
        "Microsoft.OperationalInsights"
    )
    
    $allRegistered = $true
    
    foreach ($provider in $providers) {
        try {
            $status = az provider show --namespace $provider --query "registrationState" --output tsv 2>$null
            if ($status -eq "Registered") {
                Write-Host "✅ Provider $provider: Registered" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Provider $provider: Not registered (will be registered during deployment)" -ForegroundColor Yellow
                $allRegistered = $false
            }
        } catch {
            Write-Host "❌ Provider $provider: Error checking status" -ForegroundColor Red
            $allRegistered = $false
        }
    }
    
    return $allRegistered
}

# Main execution
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

$checks = @{
    "Azure CLI" = Test-AzureCLI
    "Docker" = Test-Docker
    "Node.js" = Test-NodeJS
    "Git" = Test-Git
    "Azure Login" = Test-AzureLogin
}

Write-Host ""
Write-Host "Azure Providers:" -ForegroundColor Yellow
$providersOk = Test-AzureProviders

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "============" -ForegroundColor Cyan

$allPassed = $true
foreach ($check in $checks.GetEnumerator()) {
    if ($check.Value) {
        Write-Host "✅ $($check.Key)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($check.Key)" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host ""

if ($allPassed) {
    Write-Host "🎉 All prerequisites met! Ready for migration." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Run: .\02_configure_azure_ad.ps1" -ForegroundColor White
    Write-Host "2. Or run the complete migration: .\migrate_complete.ps1" -ForegroundColor White
} else {
    Write-Host "⚠️  Some prerequisites are missing. Please install missing components." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Installation links:" -ForegroundColor Yellow
    Write-Host "- Azure CLI: https://aka.ms/InstallAzureCli" -ForegroundColor White
    Write-Host "- Docker: https://docs.docker.com/desktop/install/windows-install/" -ForegroundColor White
    Write-Host "- Node.js: https://nodejs.org/" -ForegroundColor White
    Write-Host "- Git: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host ""
    Write-Host "For Azure login, run: az login" -ForegroundColor White
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Prerequisites check completed" -ForegroundColor Cyan
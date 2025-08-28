# ============================================================================
# Print Cloud Migration - Step 3: Deploy Infrastructure
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$ConfigFile = "azure_ad_config.json",
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "rg-printcloud-prod",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "Brazil South",
    
    [Parameter(Mandatory=$false)]
    [string]$AppName = "printcloud-app-prod",
    
    [Parameter(Mandatory=$false)]
    [string]$DbName = "printcloud-db-prod",
    
    [Parameter(Mandatory=$false)]
    [string]$RegistryName = "printcloudregistry",
    
    [Parameter(Mandatory=$false)]
    [string]$ContainerEnv = "printcloud-env-prod",
    
    [Parameter(Mandatory=$false)]
    [string]$DbPassword
)

Write-Host "🏗️  Print Cloud Migration - Infrastructure Deployment" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
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

# Function to generate secure password
function New-SecurePassword {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"
    $password = ""
    for ($i = 0; $i -lt 16; $i++) {
        $password += $chars[(Get-Random -Maximum $chars.Length)]
    }
    return $password
}

# Function to register Azure providers
function Register-AzureProviders {
    $providers = @(
        "Microsoft.ContainerRegistry",
        "Microsoft.App", 
        "Microsoft.DBforPostgreSQL",
        "Microsoft.OperationalInsights"
    )
    
    Write-Host "Registering Azure providers..." -ForegroundColor Yellow
    
    foreach ($provider in $providers) {
        try {
            Write-Host "  Registering $provider..." -ForegroundColor Gray
            az provider register --namespace $provider --wait | Out-Null
            Write-Host "  ✅ $provider registered" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Failed to register $provider" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
}

# Function to create resource group
function New-ResourceGroup {
    param(
        [string]$Name,
        [string]$Location
    )
    
    Write-Host "Creating Resource Group: $Name..." -ForegroundColor Yellow
    
    try {
        $rg = az group create --name $Name --location $Location | ConvertFrom-Json
        if ($rg) {
            Write-Host "✅ Resource Group created successfully!" -ForegroundColor Green
            return $rg
        }
    } catch {
        Write-Host "❌ Error creating Resource Group: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to create container registry
function New-ContainerRegistry {
    param(
        [string]$Name,
        [string]$ResourceGroup
    )
    
    Write-Host "Creating Container Registry: $Name..." -ForegroundColor Yellow
    
    try {
        $acr = az acr create --resource-group $ResourceGroup --name $Name --sku Basic --admin-enabled true | ConvertFrom-Json
        if ($acr) {
            Write-Host "✅ Container Registry created successfully!" -ForegroundColor Green
            return $acr
        }
    } catch {
        Write-Host "❌ Error creating Container Registry: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to create PostgreSQL database
function New-PostgreSQLDatabase {
    param(
        [string]$Name,
        [string]$ResourceGroup,
        [string]$Location,
        [string]$AdminPassword
    )
    
    Write-Host "Creating PostgreSQL Database: $Name..." -ForegroundColor Yellow
    Write-Host "⏳ This may take several minutes..." -ForegroundColor Gray
    
    try {
        $db = az postgres flexible-server create --resource-group $ResourceGroup --name $Name --location $Location --admin-user printcloudadmin --admin-password $AdminPassword --sku-name Standard_B2s --tier Burstable --storage-size 32 --version 14 --yes | ConvertFrom-Json
        
        if ($db) {
            Write-Host "✅ PostgreSQL Database created successfully!" -ForegroundColor Green
            
            # Create application database
            Write-Host "Creating application database..." -ForegroundColor Yellow
            az postgres flexible-server db create --resource-group $ResourceGroup --server-name $Name --database-name printcloud | Out-Null
            Write-Host "✅ Application database created!" -ForegroundColor Green
            
            return $db
        }
    } catch {
        Write-Host "❌ Error creating PostgreSQL Database: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to create container apps environment
function New-ContainerAppsEnvironment {
    param(
        [string]$Name,
        [string]$ResourceGroup,
        [string]$Location
    )
    
    Write-Host "Creating Container Apps Environment: $Name..." -ForegroundColor Yellow
    
    try {
        $env = az containerapp env create --resource-group $ResourceGroup --name $Name --location $Location | ConvertFrom-Json
        if ($env) {
            Write-Host "✅ Container Apps Environment created successfully!" -ForegroundColor Green
            return $env
        }
    } catch {
        Write-Host "❌ Error creating Container Apps Environment: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to build and push container image
function Build-ContainerImage {
    param(
        [string]$RegistryName,
        [string]$ClientId,
        [string]$TenantId
    )
    
    Write-Host "Building and pushing container image..." -ForegroundColor Yellow
    Write-Host "⏳ This may take several minutes..." -ForegroundColor Gray
    
    try {
        # Set build-time environment variables
        $env:NEXT_PUBLIC_AZURE_AD_CLIENT_ID = $ClientId
        $env:NEXT_PUBLIC_AZURE_AD_TENANT_ID = $TenantId
        
        # Build and push image
        $buildResult = az acr build --registry $RegistryName --image printcloud:latest . --platform linux
        
        if ($buildResult) {
            Write-Host "✅ Container image built and pushed successfully!" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Error building container image: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to create container app
function New-ContainerApp {
    param(
        [string]$Name,
        [string]$ResourceGroup,
        [string]$Environment,
        [string]$RegistryName,
        [string]$DatabaseUrl,
        [string]$ClientId,
        [string]$TenantId
    )
    
    Write-Host "Creating Container App: $Name..." -ForegroundColor Yellow
    
    try {
        # Get registry credentials
        $credentials = az acr credential show --name $RegistryName | ConvertFrom-Json
        $registryServer = "$RegistryName.azurecr.io"
        
        # Create container app
        $app = az containerapp create --resource-group $ResourceGroup --name $Name --environment $Environment --image "$registryServer/printcloud:latest" --registry-server $registryServer --registry-username $credentials.username --registry-password $credentials.passwords[0].value --target-port 3000 --ingress external --min-replicas 1 --max-replicas 5 --cpu 1 --memory 2Gi --env-vars "NODE_ENV=production" "NEXT_PUBLIC_AZURE_AD_CLIENT_ID=$ClientId" "NEXT_PUBLIC_AZURE_AD_TENANT_ID=$TenantId" --secrets "database-url=$DatabaseUrl" "nextauth-secret=print-cloud-secret-key-2024" | ConvertFrom-Json
        
        if ($app) {
            Write-Host "✅ Container App created successfully!" -ForegroundColor Green
            return $app
        }
    } catch {
        Write-Host "❌ Error creating Container App: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Main execution
Write-Host "Starting infrastructure deployment..." -ForegroundColor Yellow
Write-Host ""

# Load configuration
$config = Get-Config -FilePath $ConfigFile
if (-not $config) {
    Write-Host "❌ Cannot proceed without configuration. Run 02_configure_azure_ad.ps1 first." -ForegroundColor Red
    exit 1
}

$clientId = $config.AzureAD.ClientId
$tenantId = $config.AzureAD.TenantId

Write-Host "Using configuration:" -ForegroundColor Gray
Write-Host "  Client ID: $clientId" -ForegroundColor Gray
Write-Host "  Tenant ID: $tenantId" -ForegroundColor Gray
Write-Host ""

# Generate database password if not provided
if (-not $DbPassword) {
    $DbPassword = "PrintCloud$(Get-Random -Minimum 1000 -Maximum 9999)!"
    Write-Host "Generated database password: $DbPassword" -ForegroundColor Gray
}

# Register providers
Register-AzureProviders

# Create resource group
$rg = New-ResourceGroup -Name $ResourceGroup -Location $Location
if (-not $rg) {
    Write-Host "❌ Failed to create resource group. Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Create container registry
$acr = New-ContainerRegistry -Name $RegistryName -ResourceGroup $ResourceGroup
if (-not $acr) {
    Write-Host "❌ Failed to create container registry. Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Create PostgreSQL database
$db = New-PostgreSQLDatabase -Name $DbName -ResourceGroup $ResourceGroup -Location $Location -AdminPassword $DbPassword
if (-not $db) {
    Write-Host "❌ Failed to create database. Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Create container apps environment
$env = New-ContainerAppsEnvironment -Name $ContainerEnv -ResourceGroup $ResourceGroup -Location $Location
if (-not $env) {
    Write-Host "❌ Failed to create container apps environment. Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Build and push container image
$imageBuilt = Build-ContainerImage -RegistryName $RegistryName -ClientId $clientId -TenantId $tenantId
if (-not $imageBuilt) {
    Write-Host "❌ Failed to build container image. Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Prepare database URL
$databaseUrl = "postgresql://printcloudadmin:$DbPassword@$($db.fullyQualifiedDomainName)/printcloud?sslmode=require"

# Create container app
$app = New-ContainerApp -Name $AppName -ResourceGroup $ResourceGroup -Environment $ContainerEnv -RegistryName $RegistryName -DatabaseUrl $databaseUrl -ClientId $clientId -TenantId $tenantId
if (-not $app) {
    Write-Host "❌ Failed to create container app. Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Get application URL
$appUrl = "https://$($app.properties.configuration.ingress.fqdn)"

# Update configuration with deployment results
$deploymentResult = @{
    Infrastructure = @{
        ResourceGroup = $ResourceGroup
        Location = $Location
        ContainerRegistry = "$RegistryName.azurecr.io"
        Database = @{
            Server = $db.fullyQualifiedDomainName
            Database = "printcloud"
            Username = "printcloudadmin"
            Password = $DbPassword
            ConnectionString = $databaseUrl
        }
        Application = @{
            Name = $AppName
            URL = $appUrl
            Environment = $ContainerEnv
        }
    }
    DeployedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
}

# Save updated configuration
$config | Add-Member -MemberType NoteProperty -Name "Deployment" -Value $deploymentResult -Force
$config | ConvertTo-Json -Depth 5 | Out-File -FilePath $ConfigFile -Encoding UTF8

Write-Host "📋 Deployment Summary:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Application URL: $appUrl" -ForegroundColor White
Write-Host "Database Server: $($db.fullyQualifiedDomainName)" -ForegroundColor White
Write-Host "Container Registry: $RegistryName.azurecr.io" -ForegroundColor White
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Infrastructure deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update Azure AD redirect URIs: .\04_update_redirect_uris.ps1" -ForegroundColor White
Write-Host "2. Run database migrations: .\05_run_migrations.ps1" -ForegroundColor White
Write-Host "3. Or continue with complete migration: .\migrate_complete.ps1" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Save the database password securely: $DbPassword" -ForegroundColor Yellow

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Infrastructure deployment completed" -ForegroundColor Cyan
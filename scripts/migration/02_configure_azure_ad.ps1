# ============================================================================
# Print Cloud Migration - Step 2: Configure Azure AD
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$AppName = "Print Cloud Production",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputFile = "azure_ad_config.json"
)

Write-Host "🔐 Print Cloud Migration - Azure AD Configuration" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Function to create Azure AD App Registration
function New-AzureADApp {
    param(
        [string]$DisplayName
    )
    
    Write-Host "Creating Azure AD App Registration: $DisplayName..." -ForegroundColor Yellow
    
    try {
        # Create the app registration
        $app = az ad app create --display-name $DisplayName --sign-in-audience "AzureADMyOrg" | ConvertFrom-Json
        
        if ($app) {
            Write-Host "✅ App Registration created successfully!" -ForegroundColor Green
            Write-Host "   App ID: $($app.appId)" -ForegroundColor Gray
            Write-Host "   Object ID: $($app.id)" -ForegroundColor Gray
            
            return $app
        } else {
            throw "Failed to create app registration"
        }
    } catch {
        Write-Host "❌ Error creating App Registration: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to configure Microsoft Graph permissions
function Set-GraphPermissions {
    param(
        [string]$AppId
    )
    
    Write-Host "Configuring Microsoft Graph permissions..." -ForegroundColor Yellow
    
    try {
        # Add required permissions
        az ad app permission add --id $AppId --api 00000003-0000-0000-c000-000000000000 --api-permissions 14dad69e-099b-42c9-810b-d002981feec1=Scope 7427e0e9-2fba-42fe-b0c0-848c9e6a8182=Scope 06da0dbc-49e2-44d2-8312-53f166ab848a=Scope
        
        # Grant admin consent
        az ad app permission admin-consent --id $AppId
        
        Write-Host "✅ Microsoft Graph permissions configured!" -ForegroundColor Green
        Write-Host "   - User.Read" -ForegroundColor Gray
        Write-Host "   - Group.Read.All" -ForegroundColor Gray
        Write-Host "   - Directory.Read.All" -ForegroundColor Gray
        
        return $true
    } catch {
        Write-Host "❌ Error configuring permissions: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to configure SPA redirect URIs
function Set-SPARedirectURIs {
    param(
        [string]$ObjectId,
        [string[]]$RedirectURIs
    )
    
    Write-Host "Configuring SPA redirect URIs..." -ForegroundColor Yellow
    
    try {
        $uriList = $RedirectURIs | ConvertTo-Json -Compress
        
        $body = @{
            spa = @{
                redirectUris = $RedirectURIs
            }
        } | ConvertTo-Json -Depth 3
        
        az rest --method PATCH --uri "https://graph.microsoft.com/v1.0/applications/$ObjectId" --headers "Content-Type=application/json" --body $body
        
        Write-Host "✅ SPA redirect URIs configured!" -ForegroundColor Green
        foreach ($uri in $RedirectURIs) {
            Write-Host "   - $uri" -ForegroundColor Gray
        }
        
        return $true
    } catch {
        Write-Host "❌ Error configuring redirect URIs: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to get tenant information
function Get-TenantInfo {
    try {
        $account = az account show | ConvertFrom-Json
        return @{
            TenantId = $account.tenantId
            TenantName = $account.tenantDefaultDomain
            SubscriptionId = $account.id
            SubscriptionName = $account.name
        }
    } catch {
        Write-Host "❌ Error getting tenant information: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to save configuration
function Save-Configuration {
    param(
        [object]$Config,
        [string]$FilePath
    )
    
    try {
        $Config | ConvertTo-Json -Depth 3 | Out-File -FilePath $FilePath -Encoding UTF8
        Write-Host "✅ Configuration saved to: $FilePath" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Error saving configuration: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
Write-Host "Starting Azure AD configuration..." -ForegroundColor Yellow
Write-Host ""

# Get tenant information
Write-Host "Getting tenant information..." -ForegroundColor Yellow
$tenantInfo = Get-TenantInfo
if (-not $tenantInfo) {
    Write-Host "❌ Failed to get tenant information. Please ensure you're logged in to Azure." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Tenant Information:" -ForegroundColor Green
Write-Host "   Tenant ID: $($tenantInfo.TenantId)" -ForegroundColor Gray
Write-Host "   Tenant: $($tenantInfo.TenantName)" -ForegroundColor Gray
Write-Host "   Subscription: $($tenantInfo.SubscriptionName)" -ForegroundColor Gray
Write-Host ""

# Create App Registration
$app = New-AzureADApp -DisplayName $AppName
if (-not $app) {
    Write-Host "❌ Failed to create Azure AD App Registration. Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Configure Graph permissions
$permissionsOk = Set-GraphPermissions -AppId $app.appId
if (-not $permissionsOk) {
    Write-Host "⚠️  Permissions configuration failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""

# Configure SPA redirect URIs (placeholder - will be updated after deployment)
$redirectURIs = @(
    "http://localhost:3000",
    "http://localhost:3000/"
)

$redirectOk = Set-SPARedirectURIs -ObjectId $app.id -RedirectURIs $redirectURIs
if (-not $redirectOk) {
    Write-Host "⚠️  Redirect URI configuration failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""

# Create final configuration
$finalConfig = @{
    AzureAD = @{
        ClientId = $app.appId
        TenantId = $tenantInfo.TenantId
        ObjectId = $app.id
        AppName = $AppName
    }
    Tenant = $tenantInfo
    CreatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    RedirectURIs = $redirectURIs
    NextSteps = @(
        "Update redirect URIs after deployment",
        "Run infrastructure deployment",
        "Update environment variables"
    )
}

# Save configuration
$saved = Save-Configuration -Config $finalConfig -FilePath $OutputFile

Write-Host ""
Write-Host "📋 Configuration Summary:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "App Name: $AppName" -ForegroundColor White
Write-Host "Client ID: $($app.appId)" -ForegroundColor White
Write-Host "Tenant ID: $($tenantInfo.TenantId)" -ForegroundColor White
Write-Host "Object ID: $($app.id)" -ForegroundColor White
Write-Host ""

if ($saved) {
    Write-Host "🎉 Azure AD configuration completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Run infrastructure deployment: .\03_deploy_infrastructure.ps1" -ForegroundColor White
    Write-Host "2. Or continue with complete migration: .\migrate_complete.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  Important: Save these credentials securely!" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Configuration completed but failed to save to file." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Azure AD configuration completed" -ForegroundColor Cyan
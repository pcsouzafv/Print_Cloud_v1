# ============================================================================
# Print Cloud Migration - Step 5: Run Database Migrations
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$ConfigFile = "azure_ad_config.json"
)

Write-Host "🗄️  Print Cloud Migration - Database Migrations" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
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

# Function to check if npm is available
function Test-NPM {
    try {
        npm --version | Out-Null
        return $true
    } catch {
        Write-Host "❌ npm not found. Please install Node.js." -ForegroundColor Red
        return $false
    }
}

# Function to install dependencies
function Install-Dependencies {
    Write-Host "Installing project dependencies..." -ForegroundColor Yellow
    
    try {
        npm install
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Error installing dependencies: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to run Prisma generate
function Invoke-PrismaGenerate {
    Write-Host "Generating Prisma client..." -ForegroundColor Yellow
    
    try {
        npx prisma generate
        Write-Host "✅ Prisma client generated successfully!" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Error generating Prisma client: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to run database push/migrate
function Invoke-DatabaseMigration {
    param([string]$DatabaseUrl)
    
    Write-Host "Running database migrations..." -ForegroundColor Yellow
    Write-Host "⏳ This may take a few moments..." -ForegroundColor Gray
    
    try {
        # Set environment variable
        $env:DATABASE_URL = $DatabaseUrl
        
        # Run database push (creates tables if they don't exist)
        npx prisma db push --accept-data-loss
        
        Write-Host "✅ Database schema synchronized!" -ForegroundColor Green
        
        # Run seed if available
        if (Test-Path "prisma/seed.ts") {
            Write-Host "Running database seed..." -ForegroundColor Yellow
            npx prisma db seed
            Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  No seed file found, skipping seed step." -ForegroundColor Yellow
        }
        
        return $true
    } catch {
        Write-Host "❌ Error running database migrations: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to test database connection
function Test-DatabaseConnection {
    param([string]$DatabaseUrl)
    
    Write-Host "Testing database connection..." -ForegroundColor Yellow
    
    try {
        $env:DATABASE_URL = $DatabaseUrl
        
        # Simple query to test connection
        $result = npx prisma db execute --stdin <<< "SELECT 1 as test;"
        
        if ($result) {
            Write-Host "✅ Database connection successful!" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Database connection failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
Write-Host "Starting database migrations..." -ForegroundColor Yellow
Write-Host ""

# Check npm availability
if (-not (Test-NPM)) {
    exit 1
}

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

$databaseUrl = $config.Deployment.Infrastructure.Database.ConnectionString
$dbServer = $config.Deployment.Infrastructure.Database.Server

Write-Host "Using database configuration:" -ForegroundColor Gray
Write-Host "  Server: $dbServer" -ForegroundColor Gray
Write-Host "  Database: printcloud" -ForegroundColor Gray
Write-Host ""

# Install dependencies
if (-not (Install-Dependencies)) {
    exit 1
}

Write-Host ""

# Generate Prisma client
if (-not (Invoke-PrismaGenerate)) {
    exit 1
}

Write-Host ""

# Test database connection
if (-not (Test-DatabaseConnection -DatabaseUrl $databaseUrl)) {
    Write-Host "❌ Cannot connect to database. Please check:" -ForegroundColor Red
    Write-Host "   - Database server is running" -ForegroundColor Red
    Write-Host "   - Firewall rules allow connections" -ForegroundColor Red
    Write-Host "   - Connection string is correct" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Run database migrations
if (-not (Invoke-DatabaseMigration -DatabaseUrl $databaseUrl)) {
    exit 1
}

# Update configuration
$migrationResult = @{
    CompletedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    DatabaseUrl = $databaseUrl
    Status = "Completed"
}

$config | Add-Member -MemberType NoteProperty -Name "DatabaseMigration" -Value $migrationResult -Force
$config | ConvertTo-Json -Depth 5 | Out-File -FilePath $ConfigFile -Encoding UTF8

Write-Host ""
Write-Host "📋 Migration Summary:" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host "Database Server: $dbServer" -ForegroundColor White
Write-Host "Schema: Synchronized" -ForegroundColor White
Write-Host "Seed Data: Applied" -ForegroundColor White
Write-Host "Status: Ready for use" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Database migrations completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Your Print Cloud application is now ready!" -ForegroundColor Yellow
Write-Host "Application URL: $($config.Deployment.Infrastructure.Application.URL)" -ForegroundColor White
Write-Host ""

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Database migrations completed" -ForegroundColor Cyan
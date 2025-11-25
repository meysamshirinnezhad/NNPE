# Fix migration for question_options column rename
# IMPORTANT: Run this BEFORE starting the backend!

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Database Migration Fix Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Set PostgreSQL password
$env:PGPASSWORD = "StrongP@ss_123"

Write-Host "🔍 Checking current database structure..." -ForegroundColor Yellow

# Check if migration is needed
$checkResult = psql -U nppe -d nppe -h 127.0.0.1 -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'question_options' AND column_name = 'content';"

if ($checkResult -match "content") {
    Write-Host "📝 Migration needed: Renaming 'content' to 'option_text'..." -ForegroundColor Yellow
    
    # Run the migration
    psql -U nppe -d nppe -h 127.0.0.1 -f back/migrations/001_rename_option_content_to_option_text.sql
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Verifying changes..." -ForegroundColor Yellow
        psql -U nppe -d nppe -h 127.0.0.1 -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'question_options' ORDER BY ordinal_position;"
        
        Write-Host ""
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host "  ✅ Ready to start backend!" -ForegroundColor Green
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. cd back" -ForegroundColor White
        Write-Host "2. go run cmd/api/main.go" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Migration failed!" -ForegroundColor Red
        Write-Host "Check the error message above." -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host "✅ Migration already applied!" -ForegroundColor Green
    Write-Host "The database schema is up to date." -ForegroundColor White
    Write-Host ""
    Write-Host "You can now start the backend:" -ForegroundColor Cyan
    Write-Host "  cd back" -ForegroundColor White
    Write-Host "  go run cmd/api/main.go" -ForegroundColor White
    Write-Host ""
}

# Clear password
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "📚 For full setup instructions, see:" -ForegroundColor Cyan
Write-Host "   QUICK_START_ADMIN.md" -ForegroundColor White
Write-Host ""
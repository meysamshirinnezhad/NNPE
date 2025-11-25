# Fix all existing questions to work with new validation rules
# Run this ONCE to update your existing question data

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Fix Existing Questions" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will update all existing questions to meet the new validation rules:" -ForegroundColor Yellow
Write-Host "  ✓ Update question types to new format" -ForegroundColor White
Write-Host "  ✓ Ensure all questions have correct answers" -ForegroundColor White
Write-Host "  ✓ Fix single-choice questions with multiple correct answers" -ForegroundColor White
Write-Host "  ✓ Fix true/false questions to have exactly 2 options" -ForegroundColor White
Write-Host "  ✓ Set defaults for empty fields" -ForegroundColor White
Write-Host ""

$response = Read-Host "Continue? (Y/N)"
if ($response -ne 'Y' -and $response -ne 'y') {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Running fix script..." -ForegroundColor Cyan

$env:PGPASSWORD = "StrongP@ss_123"
psql -U nppe -d nppe -h 127.0.0.1 -f fix_existing_questions.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "  ✅ Questions Fixed Successfully!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now edit existing questions through the admin UI!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Restart the backend if it's running" -ForegroundColor White
    Write-Host "2. Go to http://localhost:5173/admin/questions" -ForegroundColor White
    Write-Host "3. Try editing a question - it should work now!" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Fix failed - check errors above" -ForegroundColor Red
    Write-Host ""
}

Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
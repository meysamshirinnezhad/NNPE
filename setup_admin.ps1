# Register admin user
$regBody = @{
    email      = "admin@nppepro.local"
    password   = "Passw0rd!"
    first_name = "Admin"
    last_name  = "User"
    province   = "NL"
} | ConvertTo-Json

Write-Host "Registering admin user..." -ForegroundColor Cyan
try {
    $regResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register" -Method POST -ContentType "application/json" -Body $regBody
    Write-Host "Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($regResponse.user.id)" -ForegroundColor Yellow
} catch {
    Write-Host "Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}
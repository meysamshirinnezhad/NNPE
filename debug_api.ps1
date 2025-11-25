# Login
Write-Host "=== LOGIN ===" -ForegroundColor Cyan
$loginBody = @{
    email = "admin@nppepro.local"
    password = "Passw0rd!"
} | ConvertTo-Json

try {
    $authResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $token = $authResponse.access_token
    Write-Host "Success! Token: $($token.Substring(0, 30))..." -ForegroundColor Green
    Write-Host "Full response:" -ForegroundColor Yellow
    $authResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Try getting topics
Write-Host "`n=== GET TOPICS ===" -ForegroundColor Cyan
$headers = @{ 
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    Write-Host "Calling: GET http://localhost:8080/api/v1/topics" -ForegroundColor Gray
    Write-Host "Headers: $($headers | ConvertTo-Json)" -ForegroundColor Gray
    $topics = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/topics" -Headers $headers -Method Get
    Write-Host "Success! Got $($topics.Count) topics" -ForegroundColor Green
    $topics | ConvertTo-Json -Depth 2
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error response: $errorBody" -ForegroundColor Red
    }
}
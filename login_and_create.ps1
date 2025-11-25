# Step 1: Login
Write-Host "Logging in..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@nppepro.local"
    password = "Passw0rd!"
} | ConvertTo-Json

$authResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$token = $authResponse.access_token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "Login successful! Token: $($token.Substring(0, 30))..." -ForegroundColor Green

# Step 2: Get Topics
Write-Host "`nGetting topics..." -ForegroundColor Cyan
$topics = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/topics" -Headers $headers
$topicA = $topics | Where-Object { $_.code -eq "A" }
Write-Host "Topic A ID: $($topicA.id)" -ForegroundColor Green

# Step 3: Get SubTopics
Write-Host "`nGetting subtopics..." -ForegroundColor Cyan
$topicDetails = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/topics/$($topicA.id)" -Headers $headers
$subA1 = $topicDetails.sub_topics | Where-Object { $_.code -eq "A1" }
Write-Host "SubTopic A1 ID: $($subA1.id)" -ForegroundColor Green

# Step 4: Create Question
Write-Host "`nCreating question..." -ForegroundColor Cyan
$questionData = @{
    content = "Which statement best describes a professional engineer primary duty?"
    question_type = "single"
    difficulty = "medium"
    topic_id = $topicA.id
    sub_topic_id = $subA1.id
    province = "NL"
    explanation = "Protection of the public is paramount; other duties are subordinate to this."
    reference_source = "Engineers Act (NL), Code of Ethics"
    options = @(
        @{ content = "Duty to employer profitability above all"; is_correct = $false; position = 1 }
        @{ content = "Duty to protect the public interest"; is_correct = $true; position = 2 }
        @{ content = "Duty to the project schedule first"; is_correct = $false; position = 3 }
        @{ content = "Duty to peers over clients"; is_correct = $false; position = 4 }
    )
}

$questionBody = $questionData | ConvertTo-Json -Depth 5
$question = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/admin/questions" -Method POST -Headers $headers -ContentType "application/json" -Body $questionBody
Write-Host "Question created! ID: $($question.id)" -ForegroundColor Green

# Step 5: Verify
Write-Host "`nVerifying..." -ForegroundColor Cyan
$questions = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/questions?topic_id=$($topicA.id)&limit=10" -Headers $headers
Write-Host "Found $($questions.questions.Count) question(s)" -ForegroundColor Green

Write-Host "`nSETUP COMPLETE!" -ForegroundColor Green
Write-Host "Admin: admin@nppepro.local / Passw0rd!" -ForegroundColor Yellow
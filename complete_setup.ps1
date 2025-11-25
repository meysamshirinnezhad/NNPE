# Login to get access token
Write-Host "`n=== Step 1: Login as Admin ===" -ForegroundColor Cyan
$loginBody = @{
    email = "admin@nppepro.local"
    password = "Passw0rd!"
} | ConvertTo-Json

try {
    $authResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $token = $authResponse.access_token
    $headers = @{ Authorization = "Bearer $token" }
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "Access Token: $($token.Substring(0, 50))..." -ForegroundColor Yellow
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Get Topics
Write-Host "`n=== Step 2: Retrieve Topics ===" -ForegroundColor Cyan
try {
    $topics = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/topics" -Headers $headers
    Write-Host "✓ Retrieved $($topics.Count) topics" -ForegroundColor Green
    
    # Find Topic A
    $topicA = $topics | Where-Object { $_.code -eq "A" }
    Write-Host "Topic A ID: $($topicA.id)" -ForegroundColor Yellow
} catch {
    Write-Host "✗ Failed to get topics: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Get SubTopics for Topic A
Write-Host "`n=== Step 3: Retrieve SubTopics ===" -ForegroundColor Cyan
try {
    $topicDetails = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/topics/$($topicA.id)" -Headers $headers
    $subA1 = $topicDetails.sub_topics | Where-Object { $_.code -eq "A1" }
    Write-Host "✓ SubTopic A1 ID: $($subA1.id)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to get subtopics: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create First Question
Write-Host "`n=== Step 4: Create First Question ===" -ForegroundColor Cyan
$questionBody = @{
    content = "Which statement best describes a professional engineer''s primary duty?"
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
} | ConvertTo-Json -Depth 5

try {
    $question = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/admin/questions" -Method POST -Headers $headers -ContentType "application/json" -Body $questionBody
    Write-Host "✓ Question created successfully!" -ForegroundColor Green
    Write-Host "Question ID: $($question.id)" -ForegroundColor Yellow
    $questionId = $question.id
} catch {
    Write-Host "✗ Failed to create question: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}

# Verify Question
Write-Host "`n=== Step 5: Verify Question ===" -ForegroundColor Cyan
try {
    $questions = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/questions?topic_id=$($topicA.id)&limit=10" -Headers $headers
    Write-Host "✓ Retrieved $($questions.questions.Count) question(s) for Topic A" -ForegroundColor Green
    if ($questions.questions.Count -gt 0) {
        Write-Host "`nFirst Question:" -ForegroundColor Yellow
        Write-Host "  ID: $($questions.questions[0].id)"
        Write-Host "  Content: $($questions.questions[0].content)"
        Write-Host "  Difficulty: $($questions.questions[0].difficulty)"
        Write-Host "  Topic: $($questions.questions[0].topic_code)"
        Write-Host "  SubTopic: $($questions.questions[0].sub_topic_code)"
    }
} catch {
    Write-Host "✗ Failed to verify question: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== ✓ Setup Complete! ===" -ForegroundColor Green
Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  • Admin user: admin@nppepro.local" -ForegroundColor White
Write-Host "  • Password: Passw0rd!" -ForegroundColor White
Write-Host "  • Access token: Available" -ForegroundColor White
Write-Host "  • Topics seeded: 5 (A-E)" -ForegroundColor White
Write-Host "  • SubTopics seeded: 4 (A1, A2, B1, B2)" -ForegroundColor White
Write-Host "  • Questions created: 1" -ForegroundColor White
Write-Host "`nYou can now:" -ForegroundColor Yellow
Write-Host "  1. Add more questions via: POST /api/v1/admin/questions" -ForegroundColor White
Write-Host "  2. Browse questions at: /api/v1/questions" -ForegroundColor White
Write-Host "  3. View topics at: /api/v1/topics" -ForegroundColor White
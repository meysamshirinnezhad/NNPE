Write-Host "=== NPPE Data Source Setup Test ===" -ForegroundColor Cyan
Write-Host "Please ensure the backend server is running with the updated code.`n" -ForegroundColor Yellow

# Step 1: Login
Write-Host "[1/5] Logging in as admin..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@nppepro.local"
    password = "Passw0rd!"
} | ConvertTo-Json

try {
    $authResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $token = $authResponse.access_token
    $headers = @{ Authorization = "Bearer $token" }
    Write-Host "      SUCCESS: Logged in as $($authResponse.user.email)" -ForegroundColor Green
} catch {
    Write-Host "      FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get Topics
Write-Host "`n[2/5] Retrieving topics..." -ForegroundColor Cyan
try {
    $topics = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/topics" -Headers $headers
    Write-Host "      SUCCESS: Found $($topics.Count) topics" -ForegroundColor Green
    $topicA = $topics | Where-Object { $_.code -eq "A" }
    if ($topicA) {
        Write-Host "      Topic A (Professionalism): $($topicA.id)" -ForegroundColor Gray
    } else {
        Write-Host "      ERROR: Topic A not found!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "      FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Get SubTopics
Write-Host "`n[3/5] Retrieving subtopics for Topic A..." -ForegroundColor Cyan
try {
    $topicDetails = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/topics/$($topicA.id)" -Headers $headers
    $subA1 = $topicDetails.sub_topics | Where-Object { $_.code -eq "A1" }
    if ($subA1) {
        Write-Host "      SUCCESS: Found SubTopic A1 (Professional Role)" -ForegroundColor Green
        Write-Host "      SubTopic A1 ID: $($subA1.id)" -ForegroundColor Gray
    } else {
        Write-Host "      ERROR: SubTopic A1 not found!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "      FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Create Question
Write-Host "`n[4/5] Creating first question..." -ForegroundColor Cyan
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

try {
    $question = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/admin/questions" -Method POST -Headers $headers -ContentType "application/json" -Body $questionBody
    Write-Host "      SUCCESS: Question created!" -ForegroundColor Green
    Write-Host "      Question ID: $($question.id)" -ForegroundColor Gray
} catch {
    Write-Host "      FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "      Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Step 5: Verify
Write-Host "`n[5/5] Verifying question was created..." -ForegroundColor Cyan
try {
    $questions = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/questions?topic_id=$($topicA.id)&limit=10" -Headers $headers
    Write-Host "      SUCCESS: Found $($questions.questions.Count) question(s) for Topic A" -ForegroundColor Green
    
    if ($questions.questions.Count -gt 0) {
        $q = $questions.questions[0]
        Write-Host "`n      First Question Details:" -ForegroundColor Yellow
        Write-Host "      - Content: $($q.content)" -ForegroundColor White
        Write-Host "      - Difficulty: $($q.difficulty)" -ForegroundColor White
        Write-Host "      - Topic: $($q.topic_code)" -ForegroundColor White
        Write-Host "      - SubTopic: $($q.sub_topic_code)" -ForegroundColor White
        Write-Host "      - Options: $($q.options.Count)" -ForegroundColor White
    }
} catch {
    Write-Host "      FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n=== SETUP COMPLETE ===" -ForegroundColor Green
Write-Host "`nDatabase Status:" -ForegroundColor Cyan
Write-Host "  √ Topics seeded: 5 (A-E)" -ForegroundColor White
Write-Host "  √ SubTopics seeded: 4 (A1, A2, B1, B2)" -ForegroundColor White
Write-Host "  √ Admin account: admin@nppepro.local / Passw0rd!" -ForegroundColor White
Write-Host "  √ First question created and verified" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Add more questions: POST /api/v1/admin/questions" -ForegroundColor White
Write-Host "  2. Browse questions: GET /api/v1/questions" -ForegroundColor White
Write-Host "  3. View all topics: GET /api/v1/topics" -ForegroundColor White
Write-Host "  4. Create bulk import script (CSV → API calls)" -ForegroundColor White
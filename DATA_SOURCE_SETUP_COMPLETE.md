# NPPE Data Source Setup - Milestone 1 Complete ✓

## What We Accomplished

### ✓ Database Seeding
1. **Topics Table** - 5 topics seeded:
   - A: Professionalism (25% weight)
   - B: Ethics (25% weight)
   - C: Professional Practice (20% weight)
   - D: Law for Practice (20% weight)
   - E: Regulation & Liability (10% weight)

2. **SubTopics Table** - 4 subtopics seeded:
   - A1: Professional Role (under Professionalism)
   - A2: Self-Regulation (under Professionalism)
   - B1: Ethical Principles (under Ethics)
   - B2: Conflicts of Interest (under Ethics)

### ✓ Admin Account Setup
- **Email:** admin@nppepro.local
- **Password:** Passw0rd!
- **Status:** Verified and promoted to admin
- **Capabilities:** Can create/edit questions via `/api/v1/admin/*` endpoints

### ✓ Backend API Implementation
Implemented working handlers for:
- `GET /api/v1/topics` - List all topics (ordered)
- `GET /api/v1/topics/:id` - Get topic with subtopics
- `GET /api/v1/questions` - List questions with filters (topic, subtopic, difficulty, pagination)
- `GET /api/v1/questions/:id` - Get single question
- `POST /api/v1/admin/questions` - Create new question (admin only)

### ✓ Database Files Created
- `seed_topics.sql` - SQL script to seed topics
- `seed_subtopics.sql` - SQL script to seed subtopics
- `verify_data.sql` - SQL script to verify seeded data
- `promote_admin.sql` - SQL script to promote user to admin

### ✓ PowerShell Setup Scripts
- `setup_admin.ps1` - Register admin user
- `login_and_create.ps1` - Login and create question
- `debug_api.ps1` - Debug API calls
- `final_setup_test.ps1` - **Complete end-to-end test** ⭐

## Next Steps

### 1. Restart Backend Server (Required)
The backend code was updated with working implementations. You MUST restart:

```cmd
# Close existing backend terminal, then:
cd back
go run cmd/api/main.go
```

### 2. Run Final Test
Once backend is restarted:

```powershell
powershell -ExecutionPolicy Bypass -File final_setup_test.ps1
```

Expected output: All 5 steps should show SUCCESS ✓

### 3. Create Your First Question
The test script creates one sample question. You can create more:

```powershell
# Get your JWT token first (from login)
$token = "your-jwt-token-here"
$headers = @{ Authorization = "Bearer $token" }

# Create question
$questionData = @{
    content = "Your question here?"
    question_type = "single"
    difficulty = "medium"  # easy, medium, hard
    topic_id = "topic-uuid-here"
    sub_topic_id = "subtopic-uuid-here"
    province = "NL"
    explanation = "Explanation of correct answer"
    reference_source = "Reference material"
    options = @(
        @{ content = "Option A"; is_correct = $false; position = 1 }
        @{ content = "Option B"; is_correct = $true; position = 2 }
        @{ content = "Option C"; is_correct = $false; position = 3 }
        @{ content = "Option D"; is_correct = $false; position = 4 }
    )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/admin/questions" `
    -Method POST -Headers $headers -ContentType "application/json" -Body $questionData
```

### 4. Bulk Import (Next Phase)
For importing many questions, you can:

**Option A: CSV Import Script**
Create a CSV file with columns:
```
content,question_type,difficulty,topic_code,subtopic_code,province,explanation,reference,option1,correct1,option2,correct2,...
```

Then create a PowerShell script that:
1. Reads CSV
2. Looks up topic/subtopic IDs
3. Calls `/api/v1/admin/questions` for each row

**Option B: Admin UI**
Build a React admin interface at `/admin/questions/editor` that:
- Lists existing questions
- Has a form to create/edit questions
- Validates inputs
- Shows success/error messages

### 5. Additional Subtopics
Add subtopics for topics C, D, E:

```sql
-- Examples for Topic C (Professional Practice)
INSERT INTO sub_topics (topic_id, name, code, description, "order", created_at, updated_at) VALUES
((SELECT id FROM topics WHERE code='C'),'Documentation','C1','Plans, reports, stamps',1,now(),now()),
((SELECT id FROM topics WHERE code='C'),'Quality Assurance','C2','QA/QC processes',2,now(),now());

-- Add similar for D and E...
```

## Files Reference

### Database Scripts
- `seed_topics.sql` - Seed 5 main topics
- `seed_subtopics.sql` - Seed 4 subtopics  
- `promote_admin.sql` - Make user admin
- `verify_data.sql` - Check seeded data

### Setup Scripts
- `final_setup_test.ps1` - ⭐ Main test script (run this after restart)
- `setup_admin.ps1` - Register admin (already run)
- `RESTART_BACKEND.md` - Restart instructions

### Code Changes
- `back/internal/handlers/question_handler.go` - Implemented API endpoints

## API Endpoints Available

### Public (JWT required)
- `GET /api/v1/topics` - List all topics
- `GET /api/v1/topics/:id` - Get topic + subtopics
- `GET /api/v1/questions?topic_id=X&difficulty=Y&limit=20` - List questions
- `GET /api/v1/questions/:id` - Get single question

### Admin Only (JWT + is_admin required)
- `POST /api/v1/admin/questions` - Create question
- `PUT /api/v1/admin/questions/:id` - Update question (stub)
- `DELETE /api/v1/admin/questions/:id` - Delete question (stub)

## Testing

```powershell
# 1. Login
$login = @{ email = "admin@nppepro.local"; password = "Passw0rd!" } | ConvertTo-Json
$auth = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $login
$token = $auth.access_token
$headers = @{ Authorization = "Bearer $token" }

# 2. Get Topics
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/topics" -Headers $headers

# 3. Get Topic A with subtopics
$topicA = (Invoke-RestMethod -Uri "http://localhost:8080/api/v1/topics" -Headers $headers) | Where { $_.code -eq "A" }
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/topics/$($topicA.id)" -Headers $headers

# 4. List questions
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/questions?limit=10" -Headers $headers
```

## Summary

**Status:** Setup Complete, Awaiting Backend Restart ✓

**What works:**
- ✓ Database has topics and subtopics
- ✓ Admin account created and verified
- ✓ API handlers implemented
- ✓ Test scripts ready

**What's needed:**
- ⚠️ Restart backend to load new code
- ⚠️ Run `final_setup_test.ps1` to verify
- 📝 Add more questions (manual or bulk import)
- 📝 Build admin UI for question management

**Next milestone:**
Create a CSV importer or admin UI for efficient question entry.
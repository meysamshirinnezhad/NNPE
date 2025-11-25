# Admin Questions Management - Complete Setup Guide

## 🚀 Quick Start (3 Simple Steps)

### Step 1: Fix Database Migration

**Run this command in PowerShell (from project root):**
```powershell
$env:PGPASSWORD = "StrongP@ss_123"; psql -U nppe -d nppe -h 127.0.0.1 -c "ALTER TABLE question_options RENAME COLUMN content TO option_text;"; Remove-Item Env:\PGPASSWORD
```

**Expected:** `ALTER TABLE` (success) or "does not exist" (already applied - also good!)

---

### Step 2: Start Backend & Frontend

**Terminal 1 - Backend:**
```powershell
cd back
go run cmd/api/main.go
```

**Terminal 2 - Frontend:**
```powershell
cd front
npm run dev
```

---

### Step 3: Setup Admin Access

**Terminal 3 - Create & Promote Admin:**
```powershell
# Create admin user
.\setup_admin.ps1

# Promote to admin
$env:PGPASSWORD = "StrongP@ss_123"; psql -U nppe -d nppe -h 127.0.0.1 -f promote_admin.sql; Remove-Item Env:\PGPASSWORD
```

**Login:**
- URL: `http://localhost:5173/login`
- Email: `admin@nppepro.local`
- Password: `Passw0rd!`

**Access Admin Questions:** `http://localhost:5173/admin/questions`

---

## 📋 What You Get

### Admin Questions Management UI
- **List Page**: View all questions with advanced filtering
  - Search by content, explanation, reference
  - Filter by topic, subtopic, type, difficulty, status, province
  - Pagination with configurable page size
  - Statistics dashboard
  - CSV export

- **Create/Edit**: Full-featured question editor
  - Rich form with validation
  - Dynamic topic/subtopic loading
  - Multiple answer options management
  - Single vs multi-correct support
  - Explanation and reference fields
  - Active/inactive toggle

- **Bulk Operations**:
  - Activate/Deactivate multiple questions
  - Bulk delete with confirmation
  - Row selection with checkboxes

### Backend API Endpoints
All protected by admin authentication:
- `GET /api/v1/admin/questions` - List with filters
- `GET /api/v1/admin/questions/:id` - Get single
- `POST /api/v1/admin/questions` - Create
- `PUT /api/v1/admin/questions/:id` - Update
- `DELETE /api/v1/admin/questions/:id` - Delete
- `POST /api/v1/admin/questions/bulk` - Bulk operations

### Features
✅ Transactional CRUD (atomic operations)
✅ Foreign key validation (subtopic belongs to topic)
✅ Business rule enforcement (correct answer count, option requirements)
✅ Full-text search with PostgreSQL indexes
✅ Pagination and filtering
✅ Client & server-side validation
✅ Duplicate questions
✅ CSV export
✅ Inline status toggle

---

## 🗂️ Files Created

### Backend (Go)
```
back/
├── internal/
│   ├── models/question.go (updated - added indexes, cascade delete)
│   ├── handlers/
│   │   ├── dto/question_dto.go (new - DTOs & validation)
│   │   └── question_handler.go (updated - added admin endpoints)
│   └── repo/
│       └── question_repo.go (new - repository with transactions)
├── cmd/api/main.go (updated - added admin routes)
├── pkg/database/postgres.go (updated - added indexes)
└── migrations/
    └── 001_rename_option_content_to_option_text.sql (new - migration)
```

### Frontend (React + TypeScript)
```
front/src/
├── api/
│   ├── types.ts (updated - extended question types)
│   ├── index.ts (updated - exported new service)
│   └── services/
│       └── admin.questions.service.ts (new - admin API client)
├── components/admin/questions/
│   ├── QuestionForm.tsx (new - form component)
│   └── QuestionsTable.tsx (new - table component)
└── pages/admin/questions/
    ├── page.tsx (updated - list page with features)
    └── editor/page.tsx (updated - create/edit/duplicate)
```

---

## 🔧 Troubleshooting

### Error: "column option_text contains null values"
**Fix:** Run Step 1 migration command, then restart backend

### Error: "UPDATE: command not recognized"  
**Fix:** Don't run SQL in PowerShell directly. Use `psql -c "..."`

### Error: "psql: command not found"
**Fix:** Use full path to psql:
```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U nppe -d nppe -h 127.0.0.1 -c "ALTER TABLE question_options RENAME COLUMN content TO option_text;"
```

### Cannot see Admin menu after login
**Fix:**
1. Verify admin status: `psql -U nppe -d nppe -h 127.0.0.1 -c "SELECT email, is_admin FROM users WHERE email = 'admin@nppepro.local';"`
2. Logout and login again
3. Clear browser cache (Ctrl+Shift+Delete)

---

## 🎯 Technical Details

### Database Schema
- **Questions**: ID, Content, QuestionType, Difficulty, TopicID, SubTopicID, Province, Explanation, ReferenceSource, IsActive
- **Question Options**: ID, QuestionID, OptionText, IsCorrect, Position
- **Indexes**: Optimized for filtering, search, and performance
- **Cascade Delete**: Deleting question removes all options

### Validation Rules
- Content: Min 10 characters
- Options: Min 2, at least 1 correct
- Single choice: Exactly 1 correct
- True/False: Exactly 2 options
- SubTopic: Must belong to selected Topic

### Security
- Admin-only endpoints
- JWT authentication required
- Server & client validation
- SQL injection prevention (GORM prepared statements)
- XSS protection (React auto-escaping)

---

## 📚 Useful SQL Commands

### Check Admin Status
```sql
SELECT id, email, is_admin, is_verified FROM users WHERE is_admin = true;
```

### Count Questions
```sql
SELECT COUNT(*) FROM questions;
SELECT COUNT(*) FROM questions WHERE is_active = true;
```

### View Question with Options
```sql
SELECT q.id, q.content, q.difficulty, 
       array_agg(qo.option_text || ' (' || CASE WHEN qo.is_correct THEN '✓' ELSE '✗' END || ')') as options
FROM questions q
LEFT JOIN question_options qo ON q.id = qo.question_id
GROUP BY q.id, q.content, q.difficulty
LIMIT 5;
```

---

## Next Steps After Setup

1. **Seed Topics & Subtopics** (if not already done):
```powershell
$env:PGPASSWORD = "StrongP@ss_123"
psql -U nppe -d nppe -h 127.0.0.1 -f seed_topics.sql
psql -U nppe -d nppe -h 127.0.0.1 -f seed_subtopics.sql
Remove-Item Env:\PGPASSWORD
```

2. **Create Questions via Admin UI**: Navigate to `/admin/questions/new`

3. **Import Bulk Questions**: Use the UI to create questions or develop a CSV import feature

---

## 🎓 Using the Admin Panel

### Creating a Question
1. Go to `/admin/questions`
2. Click "Add Question"
3. Fill in:
   - Question content
   - Select question type
   - Choose difficulty
   - Select topic (subtopic optional)
   - Add 2+ answer options
   - Mark correct answer(s)
   - Add explanation and reference
4. Click "Create Question"

### Editing a Question
1. Find question in list
2. Click "Edit" icon
3. Modify fields
4. Update options (add/remove/modify)
5. Click "Update Question"

### Bulk Operations
1. Select multiple questions (checkboxes)
2. Click "Activate", "Deactivate", or "Delete"
3. Confirm the operation

### Filtering & Search
- Use search box for text search
- Apply filters for topic, type, difficulty, status
- Results update automatically
- Export filtered results to CSV

---

## 🔐 Security Best Practices

- Change default admin password after first login
- Use strong passwords (12+ characters, mixed case, numbers, symbols)
- Don't commit credentials to git
- Enable HTTPS in production
- Implement rate limiting
- Consider 2FA for admin accounts
# Admin Questions CRUD System - Complete Guide

## 🚀 Quick Start (3 Steps to Admin Access)

### Step 1: Fix Database (One-Time Only)
```powershell
$env:PGPASSWORD = "StrongP@ss_123"; psql -U nppe -d nppe -h 127.0.0.1 -c "ALTER TABLE question_options RENAME COLUMN content TO option_text;"; Remove-Item Env:\PGPASSWORD
```

### Step 2: Start Services
```powershell
# Terminal 1 - Backend
cd back
go run cmd/api/main.go

# Terminal 2 - Frontend  
cd front
npm run dev
```

### Step 3: Setup Admin Access
```powershell
# Create admin user
.\setup_admin.ps1

# Promote to admin
$env:PGPASSWORD = "StrongP@ss_123"; psql -U nppe -d nppe -h 127.0.0.1 -f promote_admin.sql; Remove-Item Env:\PGPASSWORD
```

---

## 🎯 Access Admin Panel Through UI

### Login
1. Open: `http://localhost:5173/login`
2. Email: `admin@nppepro.local`
3. Password: `Passw0rd!`

### Access Admin Features (3 Ways)

**Option 1: User Dropdown Menu (Easiest)**
1. After login, click your **user avatar** (top right)
2. You'll see **"Admin Panel"** in the dropdown (blue text with admin icon)
3. Click it to go to `/admin`

**Option 2: Direct URL**
- Navigate directly to: `http://localhost:5173/admin`
- Or questions: `http://localhost:5173/admin/questions`

**Option 3: Dashboard Link**
- From dashboard, look for admin-specific widgets/links

---

## 🎨 UI Features

### Questions List (`/admin/questions`)
- **Statistics Dashboard**: Total, Active, Inactive counts
- **Search Bar**: Search across content, explanation, reference
- **Filters**:
  - Topic (dropdown with all topics)
  - Question Type (single/multi choice, true/false)
  - Difficulty (easy, medium, hard)
  - Status (active/inactive)
  - Province
- **Table Features**:
  - Row selection with checkboxes
  - Inline active/inactive toggle
  - Edit, Duplicate, Delete actions per row
- **Bulk Operations**:
  - Select multiple questions
  - Bulk Activate/Deactivate/Delete
  - Confirmation modals
- **CSV Export**: Export filtered results
- **Pagination**: Navigate through pages

### Question Editor (`/admin/questions/new` or `/edit/:id`)
- **Rich Form**:
  - Question content (textarea)
  - Question type selector
  - Difficulty selector
  - Topic dropdown (auto-loads subtopics)
  - SubTopic dropdown (filtered by topic)
  - Province (optional)
  - Answer options (dynamic add/remove)
  - Correct answer selection (radio for single, checkbox for multi)
  - Explanation (textarea)
  - Reference source
  - Active/Inactive toggle
- **Validation**:
  - Real-time error messages
  - Min content length (10 chars)
  - Min 2 options
  - At least 1 correct answer
  - Business rule enforcement
- **Actions**:
  - Create new question
  - Update existing question
  - Duplicate question

---

## 📋 What Was Built

### Backend (Go)
- **Models**: Enhanced Question & QuestionOption with indexes
- **DTOs**: Request/Response validation
- **Repository**: Transactional CRUD with FK validation
- **Handlers**: 6 admin endpoints + bulk operations
- **Routes**: Protected by admin middleware
- **Database**: Indexes for performance, cascade deletes

### Frontend (React + TypeScript)
- **Types**: Extended question types & DTOs
- **Service**: Admin questions API client
- **Components**: QuestionForm, QuestionsTable
- **Pages**: List view, Editor view
- **Integration**: Added to header navigation

### Files Created/Modified:
```
✅ back/internal/models/question.go (updated)
✅ back/internal/handlers/dto/question_dto.go (new)
✅ back/internal/repo/question_repo.go (new)
✅ back/internal/handlers/question_handler.go (updated)
✅ back/cmd/api/main.go (updated)
✅ back/pkg/database/postgres.go (updated)
✅ back/migrations/001_rename_option_content_to_option_text.sql (new)

✅ front/src/api/types.ts (updated)
✅ front/src/api/services/admin.questions.service.ts (new)
✅ front/src/components/feature/Header.tsx (updated - added admin link)
✅ front/src/components/admin/questions/QuestionForm.tsx (new)
✅ front/src/components/admin/questions/QuestionsTable.tsx (new)
✅ front/src/pages/admin/questions/page.tsx (updated)
✅ front/src/pages/admin/questions/editor/page.tsx (updated)
```

---

## 🔍 Verifying Admin Access

After logging in, check if you're an admin:

**Method 1: Check UI**
- Click your user avatar (top right)
- Look for "Admin Panel" link in dropdown
- If present → You're an admin ✅
- If missing → Run promotion SQL again

**Method 2: Check Database**
```powershell
$env:PGPASSWORD = "StrongP@ss_123"; psql -U nppe -d nppe -h 127.0.0.1 -c "SELECT email, is_admin, is_verified FROM users WHERE email = 'admin@nppepro.local';"; Remove-Item Env:\PGPASSWORD
```

Expected:
```
      email           | is_admin | is_verified 
----------------------+----------+-------------
 admin@nppepro.local | t        | t
```

**Method 3: Browser Console**
- Press F12 (Developer Tools)
- Console tab
- Type: `localStorage.getItem('user')`
- Should show JSON with `"is_admin": true`

---

## 🛠️ Troubleshooting

### "Cannot see Admin Panel in menu"

**Fix 1: Clear cache and re-login**
```
1. Logout
2. Clear browser cache (Ctrl+Shift+Delete)
3. Close all browser tabs
4. Open new tab → Login again
```

**Fix 2: Verify database**
```sql
-- Check admin status
SELECT email, is_admin, is_verified FROM users WHERE email = 'admin@nppepro.local';

-- If is_admin is false, run:
UPDATE users SET is_verified = true, is_admin = true WHERE email = 'admin@nppepro.local';
```

**Fix 3: Check browser console**
```
Press F12 → Console tab
Look for any errors related to auth or user data
```

### "Migration error when starting backend"

**Fix: Run migration first**
```powershell
$env:PGPASSWORD = "StrongP@ss_123"
psql -U nppe -d nppe -h 127.0.0.1 -c "ALTER TABLE question_options RENAME COLUMN content TO option_text;"
Remove-Item Env:\PGPASSWORD
```

Then restart backend.

---

## 🎓 Using the System

### Creating Your First Question
1. Login as admin
2. Click user avatar → "Admin Panel"
3. Click "Questions" or go to `/admin/questions`
4. Click "Add Question" button
5. Fill the form:
   - Write your question
   - Select type and difficulty
   - Choose topic
   - Add 2+ answer options
   - Mark correct answer(s)
   - Add explanation
6. Click "Create Question"

### Bulk Managing Questions
1. Go to questions list
2. Use checkboxes to select multiple
3. Click "Activate", "Deactivate", or "Delete"
4. Confirm the operation

---

## 📚 Documentation Files

- **`README_ADMIN_QUESTIONS.md`** (this file) - Quick start
- **`ADMIN_SETUP_COMPLETE_GUIDE.md`** - Detailed setup with troubleshooting
- **`ADMIN_QUESTIONS_CRUD_IMPLEMENTATION.md`** - Technical implementation
- **`CLEANUP_SUMMARY.md`** - File organization

---

## 🔐 Security Notes

- Admin links only visible to users with `is_admin = true`
- All admin routes protected by middleware
- Change default password after first login
- Use strong passwords in production

---

## ✨ System Ready!

The admin questions management system is fully functional and replaces manual SQL workflows. You can now create, edit, and manage all questions through the beautiful web interface.
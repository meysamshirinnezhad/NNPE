# Known Issues & Fixes - Admin Questions System

## ⚠️ Issue: 400 Bad Request When Editing Old Questions

### Symptom
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
/api/v1/admin/questions/851f75b8-1d24-451e-8294-9145ae6e03f5
```

### Cause
Old questions in your database were created with the previous schema and may not meet the new validation rules:
- Missing required fields
- Invalid question_type values
- Insufficient options
- No correct answers marked

### Solution 1: Create New Questions (Recommended)
Instead of editing old questions:
1. Go to `/admin/questions`
2. Click "Add Question" (not Edit)
3. Create fresh questions with the new system
4. Old questions will still work for testing, just can't be edited

### Solution 2: Fix Individual Question in Database
If you need to fix a specific question:
```sql
-- Check the question's current state
SELECT id, content, question_type, 
       (SELECT COUNT(*) FROM question_options WHERE question_id = 'YOUR_QUESTION_ID') as option_count,
       (SELECT COUNT(*) FROM question_options WHERE question_id = 'YOUR_QUESTION_ID' AND is_correct = true) as correct_count
FROM questions 
WHERE id = 'YOUR_QUESTION_ID';

-- Update question type to new format
UPDATE questions 
SET question_type = 'multiple_choice_single' 
WHERE id = 'YOUR_QUESTION_ID' AND question_type = 'multiple_choice';

-- Ensure at least one option is marked correct
UPDATE question_options 
SET is_correct = true 
WHERE question_id = 'YOUR_QUESTION_ID' 
AND id = (SELECT id FROM question_options WHERE question_id = 'YOUR_QUESTION_ID' LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM question_options WHERE question_id = 'YOUR_QUESTION_ID' AND is_correct = true);
```

### Solution 3: Bulk Update Old Questions
Update all old questions to the new format:
```sql
-- Update question types
UPDATE questions 
SET question_type = 'multiple_choice_single' 
WHERE question_type = 'multiple_choice';

UPDATE questions 
SET question_type = 'true_false' 
WHERE question_type IN ('true/false', 'boolean');

-- Ensure all questions have at least one correct answer
-- (This is a safety check - may need manual review)
UPDATE question_options qo
SET is_correct = true
WHERE question_id IN (
    SELECT q.id 
    FROM questions q
    WHERE NOT EXISTS (
        SELECT 1 FROM question_options 
        WHERE question_id = q.id AND is_correct = true
    )
)
AND id = (
    SELECT id FROM question_options 
    WHERE question_id = qo.question_id 
    LIMIT 1
);
```

---

## 🎯 Recommended Approach

**For Production Use:**

1. **Keep old questions as read-only** (for existing tests/practice)
2. **Create all new questions through the Admin UI**
3. **Gradually migrate old questions** as needed
4. **Use the new system going forward** (it enforces all validation)

---

## 🔍 Debugging 400 Errors

### Check Backend Logs
The backend terminal will show the actual error. Look for lines like:
```
[GIN] 2025/10/13 - 14:00:07 | 400 | ... | PUT /api/v1/admin/questions/:id
Error: "At least one option must be marked as correct"
```

### Check Question in Database
```sql
-- Get question details
SELECT q.*, 
       json_agg(qo.*) as options
FROM questions q
LEFT JOIN question_options qo ON q.id = qo.question_id
WHERE q.id = 'YOUR_QUESTION_ID'
GROUP BY q.id;
```

### Common Validation Failures
- ❌ No correct answer marked
- ❌ question_type = 'multiple_choice' (should be 'multiple_choice_single' or 'multiple_choice_multi')
- ❌ Less than 2 options
- ❌ Empty option_text values
- ❌ True/false with != 2 options

---

## ✅ How to Avoid These Issues

### When Creating New Questions
✅ Use the admin UI form (it enforces validation)
✅ Select proper question type from dropdown
✅ Add at least 2 options
✅ Mark at least 1 as correct
✅ Fill in all option text fields

The new system prevents these errors from happening!

---

## 📝 Quick Reference

### Valid Question Types
- `multiple_choice_single` - One correct answer
- `multiple_choice_multi` - One or more correct answers  
- `true_false` - Exactly 2 options

### Valid Difficulties
- `easy`
- `medium`
- `hard`

### Validation Rules
- Content: Min 10 characters
- Options: Min 2, at least 1 correct
- Single choice: Exactly 1 correct
- True/False: Exactly 2 options
- All option_text must be non-empty

---

## 🚀 Moving Forward

**Best Practice:**
1. Create new questions using `/admin/questions/new`
2. Use the list view to see all questions
3. Filter to find what you need
4. Use duplicate feature for similar questions
5. Export to CSV for backup/review

Old questions will still work for user tests, but editing them through the admin UI requires they meet the new validation rules.
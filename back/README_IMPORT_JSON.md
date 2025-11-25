# NPPE JSON Question Bank Import Tool

## Overview

This tool imports NPPE question bank data from JSON format into the PostgreSQL database. It handles deduplication, invariant validation, and proper relationship management.

## Features

- **JSON Parsing**: Reads question bank data with nested structure
- **Content Deduplication**: Uses SHA256 hash of normalized content to prevent duplicates
- **Invariant Validation**: Enforces question type rules (single correct for multiple_choice_single, etc.)
- **Relationship Management**: Creates topics/subtopics on-demand with proper foreign keys
- **Transaction Safety**: All operations wrapped in database transactions
- **Dry Run Support**: Test imports without making database changes

## JSON Format

```json
{
  "question_bank": {
    "name": "NPPE Mock Exam Question Bank",
    "version": "1.0",
    "total_questions": 64,
    "questions": [
      {
        "id": 1,
        "type": "multiple_choice_single",
        "difficulty": "easy",
        "topic": "Professionalism",
        "subtopic": "I.1",
        "content": "Question text here...",
        "explanation": "Explanation here...",
        "reference_source": "Source reference",
        "options": [
          {
            "text": "Option text",
            "correct": true,
            "position": 1
          }
        ]
      }
    ]
  }
}
```

## Build & Run

### Build
```bash
cd back
go build -o import_json ./cmd/import_json
```

### Dry Run (Recommended First)
```bash
DATABASE_URL="postgres://nppe:StrongP%40ss_123@localhost:5432/nppe?sslmode=disable" \
./import_json --dry-run --json ../questions/nppe_mock_exam_question_bank_1.json
```

### Actual Import
```bash
DATABASE_URL="postgres://nppe:StrongP%40ss_123@localhost:5432/nppe?sslmode=disable" \
./import_json --json ../questions/nppe_mock_exam_question_bank_1.json
```

## Validation Rules

### Question Types
- `multiple_choice_single`: Exactly 1 correct option
- `multiple_choice_multi`: At least 1 correct option
- `true_false`: Exactly 2 options, 1 correct

### Option Positions
- Must be sequential starting from 1
- No duplicates or gaps

### Deduplication
- Content normalized by removing markdown/HTML and converting to lowercase
- SHA256 hash stored in `questions.content_hash`
- Unique constraint on `(content_hash)` WHERE `deleted_at IS NULL`

## Database Schema

### Topics
- Auto-generated codes: `PROFESSIONALISM`, `PROFESSIONAL_PRACTICE`, etc.
- Unique names

### Subtopics
- Codes prefixed with topic: `PROFESSIONALISM_I.1`
- Unique per topic, not globally

### Questions
- UUID primary keys with `gen_random_uuid()`
- Soft deletes with `deleted_at` field
- GORM indexes for performance

## Troubleshooting

### Common Issues

1. **Duplicate subtopic codes**: Tool generates unique codes per topic
2. **Invalid question invariants**: Check error messages for specific violations
3. **Database connection**: Ensure DATABASE_URL is set and PostgreSQL is running
4. **Permission errors**: Ensure database user has INSERT/UPDATE permissions

### Verification Queries

```sql
-- Check import success
SELECT COUNT(*) FROM questions WHERE deleted_at IS NULL AND is_active = TRUE;

-- Verify invariants
SELECT q.id, q.question_type,
       COUNT(o.*) as options,
       SUM(CASE WHEN o.is_correct THEN 1 ELSE 0 END) as correct
FROM questions q
LEFT JOIN question_options o ON q.id = o.question_id
WHERE q.deleted_at IS NULL
GROUP BY q.id, q.question_type
HAVING
  (q.question_type = 'multiple_choice_single' AND SUM(CASE WHEN o.is_correct THEN 1 ELSE 0 END) != 1) OR
  (q.question_type = 'true_false' AND (COUNT(o.*) != 2 OR SUM(CASE WHEN o.is_correct THEN 1 ELSE 0 END) != 1));

-- Check for duplicates
SELECT content_hash, COUNT(*) FROM questions WHERE deleted_at IS NULL GROUP BY content_hash HAVING COUNT(*) > 1;
```

## Integration with API

The imported questions are immediately available for:

- Practice test creation (`POST /v1/practice-tests`)
- Question browsing (`GET /v1/questions`)
- Mock exam functionality

## Performance Notes

- Uses database transactions for atomicity
- Caches topic/subtopic lookups to avoid redundant queries
- Preloads related data efficiently
- Handles large JSON files without memory issues

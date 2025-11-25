# Question Bank Import System

This directory contains the question authoring and import system for the NPPE learning platform.

## Files

- `ethics.qbank.md` - Example question file in the authoring format
- `README.md` - This documentation

## Authoring Format

Questions are authored in Markdown files with YAML front-matter. File extension: `.qbank.md`

### Structure

```yaml
---
type: multiple_choice_single
difficulty: medium
topic: "Ethics"
subtopic: "Ethical Theories"
province: "AB"         # optional
active: true
reference_source: "NPPE Syllabus II"
slug: "ethics-theories-q1"
---

**Question content here with **markdown** formatting?**

- [x] Correct option one
- [ ] Incorrect option two
- [ ] Incorrect option three
- [ ] Incorrect option four

**Explanation:** Detailed explanation with references.
```

### Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | `multiple_choice_single`, `multiple_choice_multi`, `true_false` |
| `difficulty` | Yes | `easy`, `medium`, `hard` |
| `topic` | Yes | Topic name (will be created if doesn't exist) |
| `subtopic` | No | Subtopic name (will be created if doesn't exist) |
| `province` | No | Province code (e.g., "AB", "ON") |
| `active` | No | Whether question is active (default: true) |
| `reference_source` | No | Citation or reference |
| `slug` | No | Unique identifier for deduplication |

### Question Types

#### Multiple Choice Single Answer
- Exactly 1 correct option marked with `[x]`
- At least 2 options total

#### Multiple Choice Multiple Answers
- 1 or more correct options marked with `[x]`
- At least 2 options total

#### True/False
- Exactly 2 options: "True" and "False"
- Use `**Answer:** true` or `**Answer:** false` instead of option list

## Importing Questions

### Prerequisites

1. Apply database migrations:
   ```sql
   -- Run the migration in back/migrations/002_question_import_constraints.sql
   ```

2. Set DATABASE_URL environment variable:
   ```bash
   export DATABASE_URL='postgres://user:pass@localhost:5432/nppe?sslmode=disable'
   ```

### Usage

Build the importer:
```bash
cd back
go build -o import_qbank ./cmd/import_qbank
```

Import questions:
```bash
# Import single file
./import_qbank questions/ethics.qbank.md

# Import all .qbank.md files in directory
./import_qbank questions/

# Import recursively
./import_qbank /path/to/question/directory
```

### Import Behavior

- **Topics/Subtopics**: Created automatically if they don't exist
- **Deduplication**: Uses content hash to detect duplicates
- **Updates**: If duplicate found, updates existing question
- **Transactions**: Each question import is atomic
- **Validation**: Strict validation before database writes

### Output

```
✓ questions/ethics.qbank.md: imported (ethics-theories-q1)
✗ questions/invalid.qbank.md: invalid: single-choice must have exactly 1 correct (got 0)
```

## Database Schema

After migration, the following constraints are enforced:

- Single-choice questions: exactly 1 correct option
- True/False questions: exactly 2 options
- Unique option positions per question
- Content hash uniqueness for live questions
- Full-text search indexes on content and topic names

## Development

### Testing the Parser

```bash
# Test parsing without database
go run ./cmd/import_qbank --dry-run questions/ethics.qbank.md
```

### Adding New Question Types

1. Update validation logic in `validate()` function
2. Add parsing logic if needed
3. Update database triggers if new constraints required

## Troubleshooting

### Common Issues

1. **"missing required fields"**: Check YAML front-matter syntax
2. **"single-choice must have exactly 1 correct"**: Use `[x]` for correct option, `[ ]` for incorrect
3. **"true/false must have exactly 2 options"**: Use `**Answer:** true/false` format
4. **Database connection failed**: Check DATABASE_URL and PostgreSQL server

### Debug Mode

Add debug logging to see parsed content:
```go
fmt.Printf("Parsed: %+v\n", q)

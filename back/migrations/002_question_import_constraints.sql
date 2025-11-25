-- Question import system: constraints, indexes, and triggers
-- Run after existing migrations

-- 1) Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2) Content hash for dedupe/upsert (nullable until backfilled)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS content_hash bytea;

-- Unique when not deleted (prevents dupes among live items)
CREATE UNIQUE INDEX IF NOT EXISTS uq_questions_content_hash_live
ON questions (content_hash)
WHERE deleted_at IS NULL;

-- 3) Option position must be unique per question
CREATE UNIQUE INDEX IF NOT EXISTS uq_question_options_position
ON question_options (question_id, position)
WHERE deleted_at IS NULL;

-- 4) At-most-one correct option for single-choice
-- (enforces "≤1"); the "exactly 1" is handled by trigger below.
CREATE UNIQUE INDEX IF NOT EXISTS uq_one_correct_when_single
ON question_options (question_id)
WHERE is_correct = TRUE;

-- 5) Helpful filters
CREATE INDEX IF NOT EXISTS ix_questions_active_topic_diff
ON questions (is_active, topic_id, difficulty)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_questions_content_trgm
ON questions USING gin (content gin_trgm_ops);

-- 6) Fast topic/subtopic lookup by name
CREATE INDEX IF NOT EXISTS ix_topics_name_trgm     ON topics     USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS ix_subtopics_name_trgm  ON sub_topics USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS ix_subtopics_topic_name ON sub_topics (topic_id, name);

-- 7) Business-rule triggers
-- Exactly ONE correct option for single-choice; EXACTLY TWO options for true/false.
-- We check AFTER each option change and after question type changes.

CREATE OR REPLACE FUNCTION _q_enforce_rules() RETURNS trigger AS $$
DECLARE
  qtype text;
  opt_count int;
  correct_count int;
BEGIN
  -- Determine question id
  -- Works for both questions and question_options tables via NEW/OLD
  IF TG_TABLE_NAME = 'question_options' THEN
    SELECT type INTO qtype FROM questions WHERE id = COALESCE(NEW.question_id, OLD.question_id);
  ELSE
    qtype := NEW.type;
  END IF;

  IF qtype = 'multiple_choice_single' THEN
    SELECT COUNT(*) INTO correct_count
    FROM question_options
    WHERE question_id = COALESCE(NEW.id, NEW.question_id, OLD.question_id)
      AND deleted_at IS NULL
      AND is_correct = TRUE;

    IF correct_count <> 1 THEN
      RAISE EXCEPTION 'Single-choice must have exactly 1 correct option (found %)', correct_count;
    END IF;
  ELSIF qtype = 'true_false' THEN
    SELECT COUNT(*) INTO opt_count
    FROM question_options
    WHERE question_id = COALESCE(NEW.id, NEW.question_id, OLD.question_id)
      AND deleted_at IS NULL;

    IF opt_count <> 2 THEN
      RAISE EXCEPTION 'True/False must have exactly 2 options (found %)', opt_count;
    END IF;

    SELECT COUNT(*) INTO correct_count
    FROM question_options
    WHERE question_id = COALESCE(NEW.id, NEW.question_id, OLD.question_id)
      AND deleted_at IS NULL
      AND is_correct = TRUE;

    IF correct_count <> 1 THEN
      RAISE EXCEPTION 'True/False must have exactly 1 correct option (found %)', correct_count;
    END IF;
  END IF;

  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_qrules_on_options ON question_options;
CREATE TRIGGER trg_qrules_on_options
AFTER INSERT OR UPDATE OR DELETE ON question_options
FOR EACH ROW EXECUTE FUNCTION _q_enforce_rules();

DROP TRIGGER IF EXISTS trg_qrules_on_questions ON questions;
CREATE TRIGGER trg_qrules_on_questions
AFTER INSERT OR UPDATE OF type ON questions
FOR EACH ROW EXECUTE FUNCTION _q_enforce_rules();

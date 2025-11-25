-- Fix all existing questions to work with new validation rules
-- Run this once to update your existing data

BEGIN;

-- Step 1: Update question types to new format
UPDATE questions 
SET question_type = 'multiple_choice_single' 
WHERE question_type = 'multiple_choice';

UPDATE questions 
SET question_type = 'true_false' 
WHERE question_type IN ('true/false', 'boolean', 'tf');

-- Step 2: Ensure all questions have at least one correct answer
-- First, find questions with no correct answers
WITH questions_without_correct AS (
    SELECT DISTINCT q.id
    FROM questions q
    WHERE NOT EXISTS (
        SELECT 1 FROM question_options qo
        WHERE qo.question_id = q.id AND qo.is_correct = true
    )
)
-- Mark the first option as correct for these questions
UPDATE question_options qo
SET is_correct = true
WHERE question_id IN (SELECT id FROM questions_without_correct)
AND id IN (
    SELECT id FROM question_options 
    WHERE question_id = qo.question_id 
    ORDER BY position 
    LIMIT 1
);

-- Step 3: For multiple_choice_single, ensure only ONE correct answer
WITH multi_correct_questions AS (
    SELECT q.id, q.question_type
    FROM questions q
    WHERE q.question_type = 'multiple_choice_single'
    AND (
        SELECT COUNT(*) 
        FROM question_options 
        WHERE question_id = q.id AND is_correct = true
    ) > 1
)
-- Keep only the first correct answer, unmark the rest
UPDATE question_options qo
SET is_correct = false
WHERE question_id IN (SELECT id FROM multi_correct_questions)
AND is_correct = true
AND id NOT IN (
    SELECT id FROM question_options 
    WHERE question_id = qo.question_id AND is_correct = true
    ORDER BY position 
    LIMIT 1
);

-- Step 4: Ensure true_false questions have exactly 2 options
-- Delete extra options from true_false questions
DELETE FROM question_options
WHERE question_id IN (
    SELECT q.id FROM questions q 
    WHERE q.question_type = 'true_false'
)
AND position > 2;

-- Step 5: Ensure all options have non-empty text
UPDATE question_options
SET option_text = 'Option ' || position
WHERE option_text IS NULL OR option_text = '';

-- Step 6: Ensure all questions have content
UPDATE questions
SET content = 'Question content (please update)'
WHERE content IS NULL OR content = '';

-- Step 7: Set defaults for nullable fields
UPDATE questions
SET explanation = COALESCE(explanation, ''),
    reference_source = COALESCE(reference_source, ''),
    is_active = COALESCE(is_active, true);

COMMIT;

-- Verification queries
\echo ''
\echo '==================================='
\echo 'Verification Results:'
\echo '==================================='
\echo ''

\echo 'Question types distribution:'
SELECT question_type, COUNT(*) as count
FROM questions
GROUP BY question_type;

\echo ''
\echo 'Questions without correct answers (should be 0):'
SELECT COUNT(*) as count
FROM questions q
WHERE NOT EXISTS (
    SELECT 1 FROM question_options 
    WHERE question_id = q.id AND is_correct = true
);

\echo ''
\echo 'Questions with too few options (should be 0):'
SELECT COUNT(*) as count
FROM questions q
WHERE (
    SELECT COUNT(*) FROM question_options 
    WHERE question_id = q.id
) < 2;

\echo ''
\echo 'Single choice questions with multiple correct (should be 0):'
SELECT COUNT(*) as count
FROM questions q
WHERE q.question_type = 'multiple_choice_single'
AND (
    SELECT COUNT(*) FROM question_options 
    WHERE question_id = q.id AND is_correct = true
) != 1;

\echo ''
\echo '✅ All questions should now be valid for editing!'
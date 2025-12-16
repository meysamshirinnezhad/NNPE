-- Migration: Clean question option prefixes
-- This migration removes common prefixes like "A)", "b.", "C -" from existing question options

-- Update all question options to remove prefixes
UPDATE question_options
SET option_text = regexp_replace(
    option_text,
    '^([a-eA-E])\s*[\)\.\-\s]+\s*',
    '',
    'g'
)
WHERE option_text ~ '^([a-eA-E])\s*[\)\.\-\s]+\s*.*';

-- Trim any resulting whitespace
UPDATE question_options
SET option_text = trim(option_text)
WHERE option_text != trim(option_text);

-- Migration to rename question_options.content to option_text
-- Handles existing data safely

-- Check if the content column exists and option_text doesn't
DO $$
BEGIN
    -- If content column exists and option_text doesn't, rename it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'question_options' 
        AND column_name = 'content'
        AND table_schema = CURRENT_SCHEMA()
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'question_options' 
        AND column_name = 'option_text'
        AND table_schema = CURRENT_SCHEMA()
    ) THEN
        -- Rename the column
        ALTER TABLE question_options RENAME COLUMN content TO option_text;
        RAISE NOTICE 'Renamed column content to option_text';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'question_options' 
        AND column_name = 'content'
        AND table_schema = CURRENT_SCHEMA()
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'question_options' 
        AND column_name = 'option_text'
        AND table_schema = CURRENT_SCHEMA()
    ) THEN
        -- Both columns exist - copy data and drop old column
        UPDATE question_options SET option_text = content WHERE option_text IS NULL;
        ALTER TABLE question_options DROP COLUMN content;
        RAISE NOTICE 'Copied data from content to option_text and dropped content column';
    ELSE
        RAISE NOTICE 'Migration already applied or column structure is as expected';
    END IF;
END $$;

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_options_position ON question_options(question_id, position);

-- Display final structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'question_options' 
  AND table_schema = CURRENT_SCHEMA()
ORDER BY ordinal_position;
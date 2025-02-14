/*
  # Add summary column to notes table

  1. Changes
    - Add `summary` column to `notes` table
      - Type: text
      - Nullable: true (allows notes without summaries)
      - Default: null

  2. Notes
    - Safe migration that adds a new column
    - No data loss or table recreation required
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notes' AND column_name = 'summary'
  ) THEN
    ALTER TABLE notes ADD COLUMN summary text;
  END IF;
END $$;
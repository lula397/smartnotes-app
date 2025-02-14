/*
  # Add summary column to notes table

  1. Changes
    - Add `summary` column to `notes` table
      - Type: text
      - Nullable: true (to maintain compatibility with existing notes)

  2. Notes
    - Uses IF NOT EXISTS to prevent errors if column already exists
    - Maintains existing RLS policies
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
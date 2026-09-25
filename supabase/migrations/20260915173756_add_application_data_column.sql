/*
# Add application_data column to applications table

The application form submits form data into `application_data` but the column
doesn't exist, causing the insert to fail silently.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'application_data') THEN
    ALTER TABLE applications ADD COLUMN application_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

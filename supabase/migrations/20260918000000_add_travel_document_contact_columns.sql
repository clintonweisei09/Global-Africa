-- Keep the existing travel_documents table aligned with application submissions.
ALTER TABLE travel_documents
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS nationality text;

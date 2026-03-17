-- Verification runs and results
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('verified', 'suspicious', 'failed')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  owner_match BOOLEAN NOT NULL,
  document_authentic BOOLEAN NOT NULL,
  vehicle_valid BOOLEAN NOT NULL,
  rego TEXT,
  vin TEXT,
  registration_owner TEXT,
  id_document_name TEXT,
  raw_rego_data JSONB,
  raw_id_data JSONB,
  fraud_signals JSONB DEFAULT '[]'
);

-- Document storage references (files stored in Supabase Storage)
CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('registration', 'id', 'selfie', 'vehicle_photo')),
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (optional: use service role for API)
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

-- Allow anon/authenticated read of own verifications if using auth
-- CREATE POLICY "Users can read own verifications" ON verifications FOR SELECT USING (auth.uid() = user_id);
-- For API-only usage, use service role key and skip RLS or add service role policy.

CREATE INDEX idx_verifications_created_at ON verifications(created_at DESC);
CREATE INDEX idx_verifications_status ON verifications(status);
CREATE INDEX idx_verification_documents_verification_id ON verification_documents(verification_id);

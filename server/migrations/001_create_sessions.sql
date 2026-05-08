CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','done','failed')),
  total_comments INT DEFAULT 0,
  processed_count INT DEFAULT 0,
  aggregate_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

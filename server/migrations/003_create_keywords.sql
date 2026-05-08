CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  frequency INT DEFAULT 1,
  tf_idf_weight FLOAT DEFAULT 0,
  UNIQUE(session_id, word)
);

CREATE INDEX IF NOT EXISTS idx_keywords_session_id ON keywords(session_id);

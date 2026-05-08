CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive','negative','neutral')),
  sentiment_score FLOAT,
  summary TEXT
);

CREATE INDEX IF NOT EXISTS idx_comments_session_id ON comments(session_id);
CREATE INDEX IF NOT EXISTS idx_comments_sentiment ON comments(session_id, sentiment);

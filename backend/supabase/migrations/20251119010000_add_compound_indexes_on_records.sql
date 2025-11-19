-- Optimize /records where+orderBy queries with compound indexes
-- Note: If your migration runner wraps in a transaction, avoid CONCURRENTLY here.

CREATE INDEX IF NOT EXISTS "idx_records_user_cooked_at"
  ON "records" ("user_id", "cooked_at");

CREATE INDEX IF NOT EXISTS "idx_records_user_created_at"
  ON "records" ("user_id", "created_at");


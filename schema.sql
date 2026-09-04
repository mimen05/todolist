-- Rebuild the database from scratch with:
--   createdb todolist
--   psql todolist -f schema.sql

CREATE TABLE IF NOT EXISTS tasks (
  id         BIGSERIAL PRIMARY KEY,
  text       TEXT NOT NULL,
  image      TEXT,
  done       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

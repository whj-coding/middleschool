CREATE TABLE import_jobs (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  status TEXT NOT NULL,
  failure_reason TEXT
);

CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  module TEXT NOT NULL,
  knowledge_point TEXT NOT NULL,
  question_type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  ability TEXT NOT NULL,
  answer TEXT NOT NULL,
  stem TEXT NOT NULL,
  explanation TEXT NOT NULL,
  review_status TEXT NOT NULL,
  published_at TEXT
);

CREATE TABLE question_assets (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id),
  asset_type TEXT NOT NULL,
  path TEXT NOT NULL
);

CREATE TABLE figure_recognitions (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id),
  figure_type TEXT NOT NULL,
  elements_json TEXT NOT NULL,
  confidence REAL NOT NULL,
  review_status TEXT NOT NULL
);

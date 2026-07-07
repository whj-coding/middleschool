CREATE TABLE source_documents (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  title TEXT,
  subject TEXT NOT NULL DEFAULT '数学',
  grade TEXT,
  module TEXT,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'pending',
    'parsing',
    'parsed',
    'parse_failed',
    'reviewing',
    'archived'
  )),
  page_count INTEGER,
  uploaded_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL
);

CREATE TABLE content_units (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES source_documents(id),
  question_id TEXT REFERENCES questions(id),
  chunk_type TEXT NOT NULL CHECK (chunk_type IN (
    'concept',
    'example',
    'problem',
    'scenario',
    'explanation'
  )),
  content_markdown TEXT NOT NULL,
  knowledge_tags_json TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('基础', '提升', '冲刺')),
  ability TEXT CHECK (ability IN ('概念', '表达式', '图像', '应用', '综合')),
  error_types_json TEXT NOT NULL,
  review_status TEXT NOT NULL CHECK (review_status IN (
    'pending_review',
    'needs_revision',
    'approved',
    'rejected'
  )),
  quality_score REAL NOT NULL DEFAULT 1.0,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE knowledge_points (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  module TEXT NOT NULL,
  description TEXT NOT NULL,
  parent_id TEXT REFERENCES knowledge_points(id)
);

CREATE TABLE knowledge_edges (
  source_id TEXT NOT NULL REFERENCES knowledge_points(id),
  target_id TEXT NOT NULL REFERENCES knowledge_points(id),
  relation_type TEXT NOT NULL CHECK (relation_type IN (
    'prerequisite',
    'related',
    'contrasted'
  )),
  strength REAL NOT NULL DEFAULT 1.0,
  PRIMARY KEY (source_id, target_id, relation_type)
);

CREATE TABLE interaction_logs (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id),
  task_id TEXT REFERENCES learning_tasks(id),
  question_id TEXT,
  content_unit_id TEXT REFERENCES content_units(id),
  action TEXT NOT NULL CHECK (action IN (
    'view_content',
    'submit_answer',
    'request_hint',
    'view_explanation',
    'view_full_answer',
    'voice_input',
    'rate_ai_response'
  )),
  student_answer TEXT,
  hint_level INTEGER NOT NULL DEFAULT 0,
  time_to_answer_ms INTEGER,
  correct INTEGER CHECK (correct IN (0, 1)),
  ai_response TEXT,
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  created_at TEXT NOT NULL
);

CREATE TABLE prompt_templates (
  id TEXT PRIMARY KEY,
  scenario TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  template TEXT NOT NULL,
  is_active INTEGER NOT NULL CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL
);

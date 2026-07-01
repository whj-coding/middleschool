CREATE TABLE users (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'teacher'))
);

CREATE TABLE student_profiles (
  student_id TEXT PRIMARY KEY REFERENCES users(id),
  goal_score TEXT NOT NULL,
  current_stage TEXT NOT NULL
);

CREATE TABLE diagnostic_sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id),
  diagnostic_type TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE diagnostic_answers (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES diagnostic_sessions(id),
  question_id TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  confidence TEXT NOT NULL
);

CREATE TABLE learning_tasks (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id),
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE practice_sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id),
  task_id TEXT NOT NULL REFERENCES learning_tasks(id),
  status TEXT NOT NULL
);

CREATE TABLE student_answers (
  id TEXT PRIMARY KEY,
  practice_session_id TEXT NOT NULL REFERENCES practice_sessions(id),
  question_id TEXT NOT NULL,
  final_answer TEXT NOT NULL
);

CREATE TABLE mistake_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id),
  question_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence TEXT NOT NULL,
  retry_status TEXT NOT NULL
);

CREATE TABLE ai_conversations (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id),
  task_id TEXT,
  question_id TEXT
);

CREATE TABLE ai_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES ai_conversations(id),
  role TEXT NOT NULL,
  mode TEXT NOT NULL,
  content TEXT NOT NULL
);

-- ReadVolley D1 Schema (SQLite)
-- Migrated from Supabase (PostgreSQL)

CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    rules_type TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    "order" TEXT,
    document_type TEXT
);

CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    article_n TEXT NOT NULL,
    document_type TEXT,
    rules_type TEXT,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

CREATE TABLE IF NOT EXISTS rules (
    id TEXT PRIMARY KEY,
    title TEXT,
    text TEXT,
    rule_n TEXT,
    article_id TEXT,
    rules_type TEXT,
    sort_index_rule INTEGER,
    is_placeholder INTEGER DEFAULT 0,
    document_type TEXT,
    FOREIGN KEY (article_id) REFERENCES articles(id)
);

CREATE TABLE IF NOT EXISTS casebook (
    id TEXT PRIMARY KEY,
    case_number TEXT,
    case_text TEXT,
    case_ruling TEXT,
    video_link TEXT,
    case_section TEXT,
    case_subsection TEXT,
    chapter_n TEXT,
    chapter_name TEXT,
    document_type TEXT,
    rule_ref_text TEXT,
    rule_reference_array TEXT,
    rules_type TEXT,
    chapter_id TEXT
);

CREATE TABLE IF NOT EXISTS casebook_rules (
    casebook_id TEXT NOT NULL,
    rule_id TEXT NOT NULL,
    FOREIGN KEY (casebook_id) REFERENCES casebook(id),
    FOREIGN KEY (rule_id) REFERENCES rules(id)
);

CREATE TABLE IF NOT EXISTS definitions (
    id TEXT PRIMARY KEY,
    term TEXT,
    definition TEXT,
    rules_type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS diagrams (
    id TEXT PRIMARY KEY,
    diagram_name TEXT,
    diagram_n TEXT,
    rules_type TEXT NOT NULL,
    diagram_order INTEGER NOT NULL,
    diagram_image TEXT
);

CREATE TABLE IF NOT EXISTS gestures (
    id TEXT PRIMARY KEY,
    gesture_name TEXT,
    gesture_n TEXT,
    rules_type TEXT NOT NULL,
    gesture_order INTEGER NOT NULL,
    title TEXT,
    text TEXT,
    notes TEXT,
    image TEXT,
    first_r TEXT,
    first_r_special TEXT,
    second_r TEXT,
    second_r_special TEXT
);

CREATE TABLE IF NOT EXISTS game_protocol (
    id TEXT PRIMARY KEY,
    title TEXT,
    protocolText TEXT,
    rules_type TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    protocoltype TEXT,
    description TEXT,
    referees TEXT,
    teams TEXT,
    time_to_start TEXT
);

CREATE TABLE IF NOT EXISTS other_protocols (
    id TEXT PRIMARY KEY,
    title TEXT,
    protocolText TEXT,
    protocol_filter TEXT,
    sort_order INTEGER,
    protocol_type TEXT,
    content TEXT
);

CREATE TABLE IF NOT EXISTS guidelines (
    id TEXT PRIMARY KEY,
    title TEXT,
    text TEXT,
    notes TEXT,
    article_id TEXT,
    rule_id TEXT,
    rules_type TEXT,
    rule TEXT,
    rule_ref TEXT,
    section TEXT,
    FOREIGN KEY (article_id) REFERENCES articles(id),
    FOREIGN KEY (rule_id) REFERENCES rules(id)
);

CREATE TABLE IF NOT EXISTS extras (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    content TEXT,
    image_path TEXT,
    link_url TEXT,
    type TEXT DEFAULT 'post',
    rules_type TEXT NOT NULL,
    season TEXT,
    tags TEXT DEFAULT '[]',
    ssk_name TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_chapters_rules_type ON chapters(rules_type);
CREATE INDEX IF NOT EXISTS idx_articles_chapter_id ON articles(chapter_id);
CREATE INDEX IF NOT EXISTS idx_rules_article_id ON rules(article_id);
CREATE INDEX IF NOT EXISTS idx_rules_rules_type ON rules(rules_type);
CREATE INDEX IF NOT EXISTS idx_casebook_rules_rule_id ON casebook_rules(rule_id);
CREATE INDEX IF NOT EXISTS idx_casebook_rules_casebook_id ON casebook_rules(casebook_id);
CREATE INDEX IF NOT EXISTS idx_definitions_rules_type ON definitions(rules_type);
CREATE INDEX IF NOT EXISTS idx_diagrams_rules_type ON diagrams(rules_type);
CREATE INDEX IF NOT EXISTS idx_gestures_rules_type ON gestures(rules_type);
CREATE INDEX IF NOT EXISTS idx_game_protocol_rules_type ON game_protocol(rules_type);
CREATE INDEX IF NOT EXISTS idx_guidelines_article_id ON guidelines(article_id);
CREATE INDEX IF NOT EXISTS idx_guidelines_rule_id ON guidelines(rule_id);
CREATE INDEX IF NOT EXISTS idx_extras_rules_type ON extras(rules_type);

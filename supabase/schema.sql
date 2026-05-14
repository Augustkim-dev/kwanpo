-- 인사 게시판 스키마
-- Supabase SQL Editor에서 실행

-- posts
CREATE TABLE IF NOT EXISTS posts (
  id            BIGSERIAL    PRIMARY KEY,
  nickname      VARCHAR(20)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  content       TEXT         NOT NULL,
  ip_hash       VARCHAR(64)  NOT NULL,
  like_count    INT          NOT NULL DEFAULT 0,
  view_count    INT          NOT NULL DEFAULT 0,
  is_deleted    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_ip_hash    ON posts (ip_hash);

-- comments
CREATE TABLE IF NOT EXISTS comments (
  id            BIGSERIAL    PRIMARY KEY,
  post_id       BIGINT       NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  nickname      VARCHAR(20)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  content       VARCHAR(300) NOT NULL,
  ip_hash       VARCHAR(64)  NOT NULL,
  is_deleted    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id, created_at);

-- likes  (post_id + ip_hash 복합 유니크)
CREATE TABLE IF NOT EXISTS likes (
  id         BIGSERIAL   PRIMARY KEY,
  post_id    BIGINT      NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  ip_hash    VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, ip_hash)
);

-- RLS 비활성화 (서버사이드 service_role 키로만 접근)
ALTER TABLE posts    DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE likes    DISABLE ROW LEVEL SECURITY;

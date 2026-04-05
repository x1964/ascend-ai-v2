-- ============================================
-- ASCEND AI — Database Schema
-- Run this in MySQL / phpMyAdmin / CLI
-- ============================================

CREATE DATABASE IF NOT EXISTS ascend_ai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ascend_ai;

-- ── Users ──────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)     NOT NULL,
  email         VARCHAR(180)     NOT NULL,
  password_hash VARCHAR(255)     NOT NULL,
  xp            INT UNSIGNED     NOT NULL DEFAULT 0,
  streak        INT UNSIGNED     NOT NULL DEFAULT 0,
  last_active   DATETIME                  DEFAULT NULL,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY   (id),
  UNIQUE KEY    uq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Tasks ──────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED  NOT NULL,
  title       VARCHAR(255)  NOT NULL,
  completed   TINYINT(1)    NOT NULL DEFAULT 0,
  xp_reward   INT UNSIGNED  NOT NULL DEFAULT 10,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME               DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY         idx_user_id (user_id),
  CONSTRAINT  fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── User Settings (API keys, prefs) ────────
CREATE TABLE IF NOT EXISTS user_settings (
  user_id     INT UNSIGNED  NOT NULL,
  openai_key  VARCHAR(255)           DEFAULT NULL,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT  fk_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Optional: seed demo user ───────────────
-- Password: demo1234  (bcrypt hash)
-- INSERT INTO users (name, email, password_hash, xp, streak) VALUES
-- ('Demo User', 'demo@ascend.ai', '$2y$10$somehashedvaluehere', 150, 3);

-- ── Verify ─────────────────────────────────
SELECT 'Schema installed successfully!' AS status;

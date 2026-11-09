-- Passerelle : comptes, sessions de connexion, progression synchronisée et classement.
-- Appliquer avec : npx wrangler d1 migrations apply passerelle --remote (ou --local)

-- Comptes : pseudo unique (insensible à la casse), mot de passe jamais stocké en clair.
CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  pseudo      TEXT NOT NULL,
  pseudo_key  TEXT NOT NULL UNIQUE,          -- pseudo en minuscules (unicité)
  pw_hash     TEXT NOT NULL,                 -- PBKDF2-SHA256 de la clé dérivée côté client
  pw_salt     TEXT NOT NULL,
  pw_iter     INTEGER NOT NULL,
  created_at  INTEGER NOT NULL,
  level_label TEXT,                          -- niveau estimé affiché au classement
  hidden      INTEGER NOT NULL DEFAULT 0     -- 1 : n'apparaît pas au classement
);

-- Sessions de connexion : seul le hachage SHA-256 du jeton est conservé.
CREATE TABLE auth_sessions (
  token_hash   TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   INTEGER NOT NULL,
  last_used_at INTEGER NOT NULL,
  expires_at   INTEGER NOT NULL
);
CREATE INDEX idx_auth_sessions_user ON auth_sessions(user_id);

-- Progression : instantané complet (compressé côté client) avec numéro de version
-- pour ne jamais écraser silencieusement une version plus récente.
CREATE TABLE progress (
  user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  version    INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  data       TEXT NOT NULL,
  summary    TEXT NOT NULL
);

-- Séances comptées au classement (XP recalculés et plafonnés par le serveur).
CREATE TABLE scores (
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id  TEXT NOT NULL,
  ended_at    INTEGER NOT NULL,
  day         TEXT NOT NULL,
  exercises   INTEGER NOT NULL,
  correct     INTEGER NOT NULL,
  xp          INTEGER NOT NULL,
  received_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, session_id)
);
CREATE INDEX idx_scores_ended ON scores(ended_at);
CREATE INDEX idx_scores_user_day ON scores(user_id, day);

-- Limitation des tentatives (connexion, inscription, suppression de compte).
CREATE TABLE attempts (
  bucket TEXT NOT NULL,
  at     INTEGER NOT NULL
);
CREATE INDEX idx_attempts_bucket ON attempts(bucket, at);

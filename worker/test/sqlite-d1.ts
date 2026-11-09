/**
 * Base D1 simulée pour les tests : SQLite en mémoire (module node:sqlite),
 * avec le schéma des migrations réelles.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { D1Database, D1PreparedStatement, D1Result } from '../src/types';

const MIGRATIONS = join(__dirname, '..', 'migrations');

export function createTestD1(): D1Database & { raw: DatabaseSync } {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  for (const f of readdirSync(MIGRATIONS).filter((n) => n.endsWith('.sql')).sort()) db.exec(readFileSync(join(MIGRATIONS, f), 'utf8'));

  const stmt = (sql: string, params: unknown[] = []): D1PreparedStatement => ({
    bind: (...values: unknown[]) => stmt(sql, values),
    first: async <T>() => (db.prepare(sql).get(...(params as never[])) as T | undefined) ?? null,
    all: async <T>() => ({ results: db.prepare(sql).all(...(params as never[])) as T[], success: true, meta: {} }) as D1Result<T>,
    run: async () => {
      const r = db.prepare(sql).run(...(params as never[]));
      return { results: [], success: true, meta: { changes: Number(r.changes) } };
    },
  });

  return {
    raw: db,
    prepare: (sql: string) => stmt(sql),
    batch: async (statements: D1PreparedStatement[]) => {
      db.exec('BEGIN');
      try {
        const out: D1Result[] = [];
        for (const s of statements) out.push(await s.run());
        db.exec('COMMIT');
        return out;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
  };
}

/**
 * Types minimaux de l'environnement Cloudflare (sous-ensemble de D1 utilisé
 * par l'API) : ils évitent d'ajouter une dépendance de typage au projet.
 */
export interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: { changes?: number };
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}

export interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
}

export interface Env {
  DB: D1Database;
  /** Origines autorisées (CORS), séparées par des virgules. */
  ALLOWED_ORIGINS: string;
}

export interface UserRow {
  id: string;
  pseudo: string;
  pseudo_key: string;
  pw_hash: string;
  pw_salt: string;
  pw_iter: number;
  created_at: number;
  level_label: string | null;
  hidden: number;
}

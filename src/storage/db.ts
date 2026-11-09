/**
 * Persistance locale : IndexedDB (avec repli en mémoire si indisponible,
 * par exemple en navigation privée sur certains navigateurs).
 */

export const DB_NAME = 'passerelle';
/** v2 : magasin « writings » (productions écrites des niveaux B2 → C2). */
export const DB_VERSION = 2;

export type StoreName = 'settings' | 'profile' | 'skills' | 'items' | 'attempts' | 'sessions' | 'daily' | 'mistakes' | 'exposure' | 'meta' | 'writings';

export const STORES: { name: StoreName; keyPath: string; autoIncrement?: boolean; indexes?: string[] }[] = [
  { name: 'settings', keyPath: 'id' },
  { name: 'profile', keyPath: 'id' },
  { name: 'skills', keyPath: 'id' },
  { name: 'items', keyPath: 'id' },
  { name: 'attempts', keyPath: 'id', autoIncrement: true, indexes: ['ts', 'skillId'] },
  { name: 'sessions', keyPath: 'id', indexes: ['startedAt'] },
  { name: 'daily', keyPath: 'date' },
  { name: 'mistakes', keyPath: 'id' },
  { name: 'exposure', keyPath: 'key' },
  { name: 'meta', keyPath: 'id' },
  { name: 'writings', keyPath: 'id', indexes: ['ts'] },
];

export interface Backend {
  readonly kind: 'indexeddb' | 'memory';
  get<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined>;
  getAll<T>(store: StoreName): Promise<T[]>;
  /** Les n derniers enregistrements selon un index (ordre décroissant). */
  getLatest<T>(store: StoreName, index: string, n: number): Promise<T[]>;
  put<T>(store: StoreName, value: T): Promise<void>;
  putMany<T>(store: StoreName, values: T[]): Promise<void>;
  delete(store: StoreName, key: IDBValidKey): Promise<void>;
  clear(store: StoreName): Promise<void>;
  count(store: StoreName): Promise<number>;
}

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('Transaction annulée'));
  });
}

export function openIndexedDb(factory: IDBFactory = indexedDB, name = DB_NAME): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const open = factory.open(name, DB_VERSION);
    open.onupgradeneeded = () => {
      const db = open.result;
      for (const s of STORES) {
        if (db.objectStoreNames.contains(s.name)) continue;
        const os = db.createObjectStore(s.name, { keyPath: s.keyPath, autoIncrement: s.autoIncrement });
        for (const idx of s.indexes ?? []) os.createIndex(idx, idx);
      }
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
    open.onblocked = () => reject(new Error('Base de données bloquée par un autre onglet.'));
  });
}

export class IndexedDbBackend implements Backend {
  readonly kind = 'indexeddb' as const;
  constructor(private db: IDBDatabase) {}

  async get<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> {
    const tx = this.db.transaction(store, 'readonly');
    return (await req(tx.objectStore(store).get(key))) as T | undefined;
  }

  async getAll<T>(store: StoreName): Promise<T[]> {
    const tx = this.db.transaction(store, 'readonly');
    return (await req(tx.objectStore(store).getAll())) as T[];
  }

  getLatest<T>(store: StoreName, index: string, n: number): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const out: T[] = [];
      const tx = this.db.transaction(store, 'readonly');
      const cursorReq = tx.objectStore(store).index(index).openCursor(null, 'prev');
      cursorReq.onsuccess = () => {
        const cur = cursorReq.result;
        if (cur && out.length < n) {
          out.push(cur.value as T);
          cur.continue();
        } else resolve(out);
      };
      cursorReq.onerror = () => reject(cursorReq.error);
    });
  }

  async put<T>(store: StoreName, value: T): Promise<void> {
    const tx = this.db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value);
    await txDone(tx);
  }

  async putMany<T>(store: StoreName, values: T[]): Promise<void> {
    if (!values.length) return;
    const tx = this.db.transaction(store, 'readwrite');
    const os = tx.objectStore(store);
    for (const v of values) os.put(v);
    await txDone(tx);
  }

  async delete(store: StoreName, key: IDBValidKey): Promise<void> {
    const tx = this.db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    await txDone(tx);
  }

  async clear(store: StoreName): Promise<void> {
    const tx = this.db.transaction(store, 'readwrite');
    tx.objectStore(store).clear();
    await txDone(tx);
  }

  async count(store: StoreName): Promise<number> {
    const tx = this.db.transaction(store, 'readonly');
    return req(tx.objectStore(store).count());
  }
}

/** Repli en mémoire (la progression n'est alors pas conservée après fermeture). */
export class MemoryBackend implements Backend {
  readonly kind = 'memory' as const;
  private data = new Map<StoreName, Map<IDBValidKey, unknown>>();
  private auto = 0;

  private store(name: StoreName): Map<IDBValidKey, unknown> {
    let m = this.data.get(name);
    if (!m) {
      m = new Map();
      this.data.set(name, m);
    }
    return m;
  }

  private keyOf(name: StoreName, value: unknown): IDBValidKey {
    const def = STORES.find((s) => s.name === name)!;
    const v = value as Record<string, IDBValidKey>;
    if (v[def.keyPath] === undefined && def.autoIncrement) {
      this.auto += 1;
      (value as Record<string, unknown>)[def.keyPath] = this.auto;
    }
    return v[def.keyPath];
  }

  async get<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> {
    return structuredClone(this.store(store).get(key)) as T | undefined;
  }

  async getAll<T>(store: StoreName): Promise<T[]> {
    return [...this.store(store).values()].map((v) => structuredClone(v)) as T[];
  }

  async getLatest<T>(store: StoreName, index: string, n: number): Promise<T[]> {
    const all = (await this.getAll<Record<string, number>>(store)).sort((a, b) => (b[index] ?? 0) - (a[index] ?? 0));
    return all.slice(0, n) as T[];
  }

  async put<T>(store: StoreName, value: T): Promise<void> {
    const copy = structuredClone(value);
    this.store(store).set(this.keyOf(store, copy), copy);
  }

  async putMany<T>(store: StoreName, values: T[]): Promise<void> {
    for (const v of values) await this.put(store, v);
  }

  async delete(store: StoreName, key: IDBValidKey): Promise<void> {
    this.store(store).delete(key);
  }

  async clear(store: StoreName): Promise<void> {
    this.store(store).clear();
  }

  async count(store: StoreName): Promise<number> {
    return this.store(store).size;
  }
}

export async function openBackend(): Promise<Backend> {
  try {
    if (typeof indexedDB === 'undefined') throw new Error('IndexedDB indisponible');
    const db = await openIndexedDb();
    return new IndexedDbBackend(db);
  } catch (e) {
    console.warn('IndexedDB indisponible, repli en mémoire :', e);
    return new MemoryBackend();
  }
}

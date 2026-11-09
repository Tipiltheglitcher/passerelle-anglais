/**
 * Persistance (IndexedDB simulée par fake-indexeddb) : sauvegarde et
 * restauration de la progression, reprise d'une séance, export / import,
 * refus d'un import invalide, réinitialisation.
 */
import { describe, expect, it } from 'vitest';
import { IndexedDbBackend, MemoryBackend, openIndexedDb } from './db';
import { Store } from '@/state/store';
import type { EvalResult } from '@/engine/exercises/types';
import { currentItem } from '@/engine/learning/session';
import { dayKey } from '@/state/dates';

let dbCount = 0;
async function freshBackend() {
  dbCount += 1;
  return new IndexedDbBackend(await openIndexedDb(indexedDB, `test-${dbCount}-${Date.now()}`));
}

async function readyStore(backend?: IndexedDbBackend) {
  const store = new Store();
  await store.init(backend ?? (await freshBackend()));
  return store;
}

const ok: EvalResult = { correct: true, score: 1, expected: '', userAnswer: '', headline: 'Correct' };
const ko: EvalResult = { correct: false, score: 0, expected: 'x', userAnswer: 'y', headline: 'Incorrect', errorTag: 'meaning' };

/** Répond à tous les exercices d'une séance avec la suite de résultats donnée. */
function play(store: Store, results: EvalResult[]) {
  let s = store.getState().activeSession!;
  for (const r of results) {
    if (!currentItem(s)) break;
    s = store.answer(s, r, 3000);
    s = store.next(s);
  }
  return s;
}

describe('sauvegarde et restauration', () => {
  it('démarre avec des réglages par défaut et un profil neuf', async () => {
    const store = await readyStore();
    const st = store.getState();
    expect(st.status).toBe('ready');
    expect(st.storage).toBe('indexeddb');
    expect(st.settings.theme).toBe('system');
    expect(st.profile.totalXp).toBe(0);
    expect(st.sessions).toHaveLength(0);
  });

  it('une séance terminée est restaurée intégralement au redémarrage', async () => {
    const backend = await freshBackend();
    const store = await readyStore(backend);
    const session = store.startSession('guided', { size: 6 });
    expect(session.items.length).toBeGreaterThan(0);
    const end = play(store, [ok, ok, ko, ok, ok, ok, ok, ok, ok, ok]);
    expect(end.finished).toBe(true);
    await store.flush();
    const st = store.getState();
    expect(st.sessions).toHaveLength(1);
    expect(st.daily[dayKey(Date.now())].exercises).toBe(end.answers.length);
    expect(st.profile.streak).toBe(1);
    expect(st.mistakes.length).toBeGreaterThanOrEqual(0);

    // nouveau démarrage sur la même base
    const again = await readyStore(backend);
    const st2 = again.getState();
    expect(st2.sessions).toHaveLength(1);
    expect(st2.sessions[0].total).toBe(end.answers.length);
    expect(st2.profile.totalXp).toBe(st.profile.totalXp);
    expect(Object.keys(st2.skills).sort()).toEqual(Object.keys(st.skills).sort());
    expect(st2.daily[dayKey(Date.now())].exercises).toBe(end.answers.length);
    expect(st2.activeSession).toBeNull();
    const attempts = await again.loadAttempts();
    expect(attempts).toHaveLength(end.answers.length);
  });

  it('une séance interrompue se reprend là où elle s’était arrêtée', async () => {
    const backend = await freshBackend();
    const store = await readyStore(backend);
    let s = store.startSession('practice', { focusSkills: ['articles'], size: 5 });
    s = store.answer(s, ok, 2000);
    s = store.next(s);
    store.saveActive(s);
    await store.flush();
    const again = await readyStore(backend);
    const active = again.getState().activeSession;
    expect(active?.id).toBe(s.id);
    expect(active?.answers).toHaveLength(1);
    expect(active?.index).toBe(1);
  });

  it('lancer une autre séance clôture la précédente dans l’historique', async () => {
    const store = await readyStore();
    const s = store.startSession('practice', { focusSkills: ['comparatives'], size: 4 });
    store.answer(s, ok, 2000);
    store.startSession('practice', { focusSkills: ['superlatives'], size: 4 });
    expect(store.getState().sessions).toHaveLength(1);
    expect(store.getState().activeSession?.answers).toHaveLength(0);
  });

  it('les erreurs sont enregistrées puis retirées après deux réussites en révision', async () => {
    const store = await readyStore();
    let s = store.startSession('practice', { focusSkills: ['present_simple'], size: 4, focusTypes: ['mcq'] });
    s = store.answer(s, ko, 2000);
    expect(store.getState().mistakes).toHaveLength(1);
    store.end(s);
    for (let round = 0; round < 2; round++) {
      let m = store.startSession('mistakes', { size: 4 });
      const idx = m.items.findIndex((it) => it.slot.mistake);
      expect(idx).toBeGreaterThanOrEqual(0);
      while (m.index < idx) m = store.next(store.answer(m, ok, 1000));
      m = store.answer(m, ok, 1000);
      store.end(m);
    }
    expect(store.getState().mistakes).toHaveLength(0);
  });

  it('réglages et leçons consultées sont persistés', async () => {
    const backend = await freshBackend();
    const store = await readyStore(backend);
    store.updateSettings({ theme: 'dark', dailyGoalXp: 150, audio: { ...store.getState().settings.audio, rate: 0.8 } });
    store.markLessonSeen('passive');
    await store.flush();
    const again = await readyStore(backend);
    expect(again.getState().settings.theme).toBe('dark');
    expect(again.getState().settings.dailyGoalXp).toBe(150);
    expect(again.getState().settings.audio.rate).toBe(0.8);
    expect(again.getState().skills.passive?.lessonSeen).toBe(true);
  });
});

describe('export, import et réinitialisation', () => {
  it('export puis import dans une autre base : progression identique', async () => {
    const source = await readyStore();
    source.startSession('guided', { size: 5 });
    play(source, [ok, ko, ok, ok, ok, ok, ok]);
    const json = await source.exportData();
    const parsed = JSON.parse(json);
    expect(parsed.app).toBe('passerelle');

    const target = await readyStore();
    await target.importData(json);
    const a = source.getState();
    const b = target.getState();
    expect(b.sessions).toHaveLength(a.sessions.length);
    expect(b.profile.totalXp).toBe(a.profile.totalXp);
    expect(Object.keys(b.items).sort()).toEqual(Object.keys(a.items).sort());
    expect(b.skills.present_simple?.attempts).toBe(a.skills.present_simple?.attempts);
  });

  it("refuse un fichier invalide sans toucher aux données", async () => {
    const store = await readyStore();
    store.startSession('guided', { size: 4 });
    play(store, [ok, ok, ok, ok, ok]);
    await store.flush();
    const before = store.getState().sessions.length;
    await expect(store.importData('pas du json')).rejects.toThrow(/JSON/);
    await expect(store.importData(JSON.stringify({ app: 'autre', version: 1, data: {} }))).rejects.toThrow(/Passerelle/);
    await expect(store.importData(JSON.stringify({ app: 'passerelle', version: 99, data: {} }))).rejects.toThrow(/Version/);
    await expect(store.importData(JSON.stringify({ app: 'passerelle', version: 1, data: { skills: [{ nope: true }] } }))).rejects.toThrow();
    expect(store.getState().sessions.length).toBe(before);
  });

  it('réinitialisation complète', async () => {
    const backend = await freshBackend();
    const store = await readyStore(backend);
    store.startSession('guided', { size: 4 });
    play(store, [ok, ok, ok, ok, ok]);
    store.updateSettings({ theme: 'light' });
    await store.reset();
    const st = store.getState();
    expect(st.status).toBe('ready');
    expect(st.sessions).toHaveLength(0);
    expect(Object.keys(st.skills)).toHaveLength(0);
    expect(st.settings.theme).toBe('system');
    const again = await readyStore(backend);
    expect(again.getState().sessions).toHaveLength(0);
  });

  it('repli en mémoire si IndexedDB est indisponible', async () => {
    const store = new Store();
    await store.init(new MemoryBackend());
    expect(store.getState().storage).toBe('memory');
    store.startSession('vocab', { size: 4 });
    expect(store.getState().activeSession).not.toBeNull();
  });
});

describe('progression A2 → C2 (persistance)', () => {
  it('test de niveau adaptatif : arrêt après une bande nettement échouée', async () => {
    const store = await readyStore();
    let s = store.startSession('placement');
    const first = s.items[0].slot.band;
    while (currentItem(s)) {
      s = store.answer(s, ko, 2000);
      s = store.next(s);
    }
    expect(s.answers.length).toBe(s.answers.filter((_, i) => s.items[i].slot.band === first).length);
    expect(store.getState().profile.placementLevel).toBe('A2−');
  });

  it("une évaluation de fin de niveau réussie valide le niveau et ouvre l'étape suivante", async () => {
    const backend = await freshBackend();
    const store = await readyStore(backend);
    expect(store.unlocked().has('b2c1')).toBe(false);
    let s = store.startSession('exam', { examId: 'b2_final' });
    while (currentItem(s)) {
      s = store.answer(s, ok, 2000);
      s = store.next(s);
    }
    expect(store.getState().profile.levelsPassed).toContain('B2');
    expect(store.unlocked().has('b2c1')).toBe(true);
    expect(store.getState().sessions[0].result).toMatch(/B2 validé/);
    await store.flush();
    const again = await readyStore(backend);
    expect(again.getState().profile.levelsPassed).toContain('B2');
  });

  it('une évaluation interrompue ne valide rien', async () => {
    const store = await readyStore();
    let s = store.startSession('exam', { examId: 'b2_final' });
    s = store.answer(s, ok, 2000);
    store.end(s);
    expect(store.getState().profile.levelsPassed ?? []).not.toContain('B2');
  });

  it('les rédactions sont conservées et restaurées', async () => {
    const backend = await freshBackend();
    const store = await readyStore(backend);
    const s = store.startSession('practice', { focusSkills: ['writing_b2'] });
    expect(s.items).toHaveLength(1);
    const res: EvalResult = { ...ok, score: 0.8, approximate: true, selfScore: 0.75, production: 'In my view, remote work is better.' };
    store.answer(s, res, 60000);
    expect(store.getState().writings[0].text).toBe('In my view, remote work is better.');
    await store.flush();
    const again = await readyStore(backend);
    expect(again.getState().writings[0]?.selfScore).toBe(0.75);
  });

  it("migration : un profil de la version précédente garde sa progression et retrouve le B1 validé", async () => {
    const backend = await freshBackend();
    await backend.put('profile', { id: 'me', createdAt: 1, placementDone: true, placementLevel: 'B1−', streak: 4, bestStreak: 9, totalXp: 1234 });
    const bySkill: Record<string, { total: number; correct: number }> = { present_simple: { total: 10, correct: 9 }, reading: { total: 1, correct: 1 }, vocab_travel: { total: 2, correct: 2 } };
    await backend.put('sessions', { id: 'old', mode: 'exam', startedAt: 5, endedAt: 6, total: 13, correct: 12, xp: 100, durationMs: 1, skills: [], bySkill, title: 'Examen blanc 4 — Niveau B1 complet' });
    await backend.put('skills', { id: 'present_simple', mastery: 0.8, attempts: 30, correct: 25, streak: 2, lastSeen: 5, card: null, errors: {}, avgMs: 3000, lessonSeen: true });
    const store = await readyStore(backend);
    const p = store.getState().profile;
    expect(p.totalXp).toBe(1234);
    expect(p.levelsPassed).toEqual(['B1']);
    expect(p.dataVersion).toBe(2);
    expect(store.getState().skills.present_simple.mastery).toBe(0.8);
    expect(store.unlocked().has('b1b2')).toBe(true);
    await store.flush();
    const raw = await backend.get<{ dataVersion?: number }>('profile', 'me');
    expect(raw?.dataVersion).toBe(2);
  });
});

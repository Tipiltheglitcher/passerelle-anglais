/**
 * « Je ne peux pas écouter » et entraînement libre par niveau et par thème.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { LISTEN_PAUSE_MS, Store } from './store';
import { MemoryBackend } from '@/storage/db';
import { AUDIO_TYPES } from '@/engine/exercises/types';
import { CEFR_LEVELS } from '@/content/levels';
import { ALL_UNITS, SKILL_BY_ID } from '@/content/curriculum';
import { themesFor } from '@/pages/freeThemes';

async function storeWithAudio() {
  const store = new Store();
  await store.init(new MemoryBackend());
  // jsdom n'a pas de synthèse vocale : on la déclare disponible pour générer des exercices d'écoute
  Object.assign(store.getState(), { audioSupported: true });
  return store;
}

describe('Je ne peux pas écouter', () => {
  beforeEach(() => localStorage.clear());

  it('remplace les exercices d’écoute restants, sans réponse comptée, et suspend l’écoute une heure', async () => {
    const store = await storeWithAudio();
    const s = store.startSession('practice', { focusSkills: ['present_simple', 'listening'], focusTypes: ['dictation', 'listening', 'mcq'], size: 6 });
    expect(s.items.some((i) => AUDIO_TYPES.has(i.exercise.type))).toBe(true);
    const xpBefore = store.getState().profile.totalXp;

    const t0 = Date.now();
    const n = store.pauseListening(s);
    expect(n.items.length).toBeGreaterThan(0);
    expect(n.items.every((i) => !AUDIO_TYPES.has(i.exercise.type))).toBe(true);
    expect(n.answers).toHaveLength(0);
    expect(n.index).toBe(0);
    expect(store.getState().profile.totalXp).toBe(xpBefore);
    // pause d'une heure, conservée pour les prochaines visites
    const until = store.getState().listenPausedUntil;
    expect(until).toBeGreaterThanOrEqual(t0 + LISTEN_PAUSE_MS);
    expect(Number(localStorage.getItem('passerelle.listenPause'))).toBe(until);
    expect(store.audioEnabled()).toBe(false);
    expect(store.audioEnabled(until + 1)).toBe(true);

    // les séances suivantes ne proposent plus d'écoute
    const next = store.startSession('practice', { focusSkills: ['present_simple'], focusTypes: ['dictation', 'mcq'], size: 6 });
    expect(next.items.every((i) => !AUDIO_TYPES.has(i.exercise.type))).toBe(true);

    // réactivation manuelle
    store.resumeListening();
    expect(store.audioEnabled()).toBe(true);
    expect(localStorage.getItem('passerelle.listenPause')).toBeNull();
  });

  it('les exercices déjà faits ne sont pas modifiés', async () => {
    const store = await storeWithAudio();
    const s = store.startSession('practice', { focusSkills: ['present_simple'], focusTypes: ['dictation'], size: 4 });
    const done = { ...s, index: 1 };
    const n = store.pauseListening(done);
    expect(n.items[0]).toBe(s.items[0]);
    expect(n.items.slice(1).every((i) => !AUDIO_TYPES.has(i.exercise.type))).toBe(true);
  });
});

describe('entraînement libre : thèmes par niveau', () => {
  it('chaque niveau propose des thèmes, et chaque notion du niveau apparaît exactement une fois', () => {
    for (const level of CEFR_LEVELS) {
      const themes = themesFor(level);
      expect(themes.length).toBeGreaterThan(0);
      const listed = themes.flatMap((t) => t.skills);
      const expected = ALL_UNITS.flatMap((u) => u.skills).filter((id) => SKILL_BY_ID[id].level === level);
      expect([...listed].sort()).toEqual([...expected].sort());
      for (const t of themes) {
        expect(t.skills.every((id) => SKILL_BY_ID[id].level === level)).toBe(true);
        if (t.group === 'vocab') expect(t.skills).toHaveLength(1);
      }
    }
  });

  it('les niveaux avancés proposent grammaire, vocabulaire et compréhension', () => {
    for (const level of ['B2', 'C1', 'C2'] as const) {
      const groups = new Set(themesFor(level).map((t) => t.group));
      expect(groups).toEqual(new Set(['grammar', 'vocab', 'function']));
    }
  });
});

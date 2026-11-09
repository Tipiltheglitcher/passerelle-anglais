/** Intégrité du contenu pédagogique : curriculum, leçons, vocabulaire. */
import { describe, expect, it } from 'vitest';
import { ALL_SKILLS, ALL_UNITS, GUIDED_ORDER, SKILL_BY_ID } from './curriculum';
import { LESSONS } from './lessons';
import { POS_LABELS, VOCAB_THEMES } from './vocabulary';
import { ITEM_GENERATORS } from '@/engine/generator/registry';

describe('curriculum', () => {
  it('prérequis existants, sans cycle, placés avant dans le parcours', () => {
    for (const s of ALL_SKILLS) {
      for (const p of s.prereq) {
        expect(SKILL_BY_ID[p], `${s.id} → ${p}`).toBeDefined();
        expect(GUIDED_ORDER.indexOf(p), `${p} doit précéder ${s.id}`).toBeLessThan(GUIDED_ORDER.indexOf(s.id));
      }
    }
  });

  it('chaque notion de grammaire a son générateur et appartient à une unité', () => {
    for (const s of ALL_SKILLS.filter((x) => x.kind === 'grammar')) {
      expect(ITEM_GENERATORS[s.id], s.id).toBeTypeOf('function');
      expect(ALL_UNITS.some((u) => u.skills.includes(s.id)), s.id).toBe(true);
    }
    expect(new Set(ALL_SKILLS.map((s) => s.id)).size).toBe(ALL_SKILLS.length);
  });
});

describe('leçons', () => {
  it('une leçon complète pour chaque notion de grammaire et de communication', () => {
    for (const s of ALL_SKILLS.filter((x) => x.kind !== 'vocab')) {
      const l = LESSONS[s.id];
      expect(l, s.id).toBeDefined();
      expect(l.intro.length, s.id).toBeGreaterThan(80);
      expect(l.blocks.length, s.id).toBeGreaterThanOrEqual(2);
      expect(l.remember.length, s.id).toBeGreaterThanOrEqual(1);
      if (s.kind === 'grammar') expect(l.pitfalls.length, s.id).toBeGreaterThanOrEqual(2);
      for (const b of l.blocks) {
        expect(b.text || b.points || b.table || b.examples, `${s.id} / ${b.title}`).toBeTruthy();
        for (const e of b.examples ?? []) {
          expect(e.en.trim(), `${s.id} : exemple vide`).not.toBe('');
          expect(/[.!?]$/.test(e.en.trim()), `${s.id} : « ${e.en} » sans ponctuation finale`).toBe(true);
          expect(e.fr.trim()).not.toBe('');
        }
        for (const row of b.table?.rows ?? []) expect(row.length, `${s.id} / ${b.title}`).toBe(b.table!.head.length);
      }
      for (const p of l.pitfalls) expect(p.wrong).not.toBe(p.right);
    }
  });

  it('pas de mise en gras mal fermée', () => {
    for (const [id, l] of Object.entries(LESSONS)) {
      const texts = [l.intro, ...l.remember, ...l.blocks.flatMap((b) => [b.text ?? '', ...(b.points ?? [])]), ...l.pitfalls.map((p) => p.why)];
      for (const t of texts) expect((t.match(/\*\*/g) ?? []).length % 2, `${id} : ${t.slice(0, 40)}`).toBe(0);
    }
  });
});

describe('vocabulaire', () => {
  it('identifiants uniques, traductions et natures valides', () => {
    const ids = new Set<string>();
    for (const t of VOCAB_THEMES) {
      expect(t.items.length, t.id).toBeGreaterThanOrEqual(20);
      for (const it of t.items) {
        expect(ids.has(it.id), it.id).toBe(false);
        ids.add(it.id);
        expect(it.en.every((w) => w.trim().length > 0), it.id).toBe(true);
        expect(it.fr.every((w) => w.trim().length > 0), it.id).toBe(true);
        expect(POS_LABELS[it.pos], `${it.id} : nature ${it.pos}`).toBeDefined();
        expect(['A2', 'B1', 'B2', 'C1', 'C2']).toContain(it.lv);
      }
    }
    expect(ids.size).toBeGreaterThan(500);
  });
});

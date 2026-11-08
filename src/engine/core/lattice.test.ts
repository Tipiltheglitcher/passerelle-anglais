/** Correspondance des réponses libres : variantes correctes acceptées, erreurs refusées. */
import { describe, expect, it } from 'vitest';
import { diffWords, focusSlot, lattice, matchAnswer, opt, s, spec, specFromStrings } from './lattice';
import { matchFrench } from '@/engine/exercises/evaluate';

describe('variantes acceptées', () => {
  const isNot = spec(lattice([s('She'), focusSlot(['is not', "isn't"]), s('at home')]));

  it('contractions dans les deux sens', () => {
    expect(matchAnswer("She isn't at home.", isNot).ok).toBe(true);
    expect(matchAnswer('She is not at home', isNot).ok).toBe(true);
    expect(matchAnswer("She's not at home.", isNot).ok).toBe(true);
  });

  it('majuscules, ponctuation et espaces ignorés', () => {
    expect(matchAnswer("  SHE ISN'T   AT HOME !!!", isNot).ok).toBe(true);
  });

  it("refuse une forme fausse sur l'élément évalué", () => {
    expect(matchAnswer("She aren't at home.", isNot).ok).toBe(false);
    expect(matchAnswer('She not at home.', isNot).ok).toBe(false);
  });

  it("'s ambigu : is, has ou possessif côté saisie", () => {
    const hasGot = spec(lattice([s('He'), s(['has', "'s"]), s('got a car')]));
    expect(matchAnswer("He's got a car", hasGot).ok).toBe(true);
    const possessive = spec(lattice([s("Tom's"), s('car is red')]));
    expect(matchAnswer("Tom's car is red", possessive).ok).toBe(true);
    expect(matchAnswer('Tom car is red', possessive).ok).toBe(false);
  });

  it('orthographe britannique ou américaine', () => {
    const colour = spec(lattice([s('My favourite colour is blue')]));
    expect(matchAnswer('My favorite color is blue', colour).ok).toBe(true);
    expect(matchAnswer('My favourite colour is blue', colour).ok).toBe(true);
  });

  it('nombres en chiffres ou en lettres', () => {
    const cats = spec(lattice([s('I have three cats')]));
    expect(matchAnswer('I have 3 cats', cats).ok).toBe(true);
    expect(matchAnswer('I have four cats', cats).ok).toBe(false);
  });

  it('élément facultatif et réponses alternatives', () => {
    const l = spec(lattice([s('I'), opt('really'), s(['like', 'love']), s('it')]));
    expect(matchAnswer('I like it', l).ok).toBe(true);
    expect(matchAnswer('I really love it', l).ok).toBe(true);
    expect(matchAnswer('I it like', l).ok).toBe(false);
    const multi = specFromStrings(['shop', 'store']);
    expect(matchAnswer('store', multi).ok).toBe(true);
  });

  it('plusieurs ordres de mots corrects (plusieurs treillis)', () => {
    const sp = spec(lattice([s('Yesterday'), s('I went out')]), lattice([s('I went out'), s('yesterday')]));
    expect(matchAnswer('I went out yesterday', sp).ok).toBe(true);
    expect(matchAnswer('Yesterday I went out', sp).ok).toBe(true);
  });
});

describe('fautes de frappe', () => {
  const gym = spec(lattice([s('My mum'), focusSlot('goes'), s('to the theatre every evening')]));

  it('tolérées hors de la notion évaluée', () => {
    const r = matchAnswer('My mum goes to the theatr every evening', gym);
    expect(r.ok).toBe(true);
    expect(r.typos).toBe(1);
  });

  it("jamais sur l'élément évalué (focus)", () => {
    expect(matchAnswer('My mum gos to the theatre every evening', gym).ok).toBe(false);
    expect(matchAnswer('My mum go to the theatre every evening', gym).ok).toBe(false);
  });
});

describe('réponses en français', () => {
  it('accents facultatifs mais signalés', () => {
    const exact = matchFrench('Je suis allé au cinéma.', ['Je suis allé au cinéma.']);
    expect(exact.ok).toBe(true);
    expect(exact.accentOnly).toBe(false);
    const noAccent = matchFrench('je suis alle au cinema', ['Je suis allé au cinéma.']);
    expect(noAccent.ok).toBe(true);
    expect(noAccent.accentOnly).toBe(true);
    expect(matchFrench('je vais au cinéma', ['Je suis allé au cinéma.']).ok).toBe(false);
  });
});

describe('différences mot à mot', () => {
  it('signale le mot remplacé et le mot manquant', () => {
    const ops = diffWords('She goes to work every day', 'She go to work day');
    expect(ops.some((o) => o.kind === 'wrong' && o.text === 'go' && o.expected === 'goes')).toBe(true);
    expect(ops.some((o) => o.kind === 'missing' && o.text === 'every')).toBe(true);
  });
});

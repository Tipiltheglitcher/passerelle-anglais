import { describe, expect, it } from 'vitest';
import { realizeEn, realizeFr, type Clause } from './clause';
import { latticeText, matchAnswer, spec, lattice } from '@/engine/core/lattice';
import { predicate } from '@/content/lexicon/predicates';
import { noun } from '@/content/lexicon/nouns';
import { ALL_SUBJECTS } from '@/content/lexicon/subjects';
import { TIME_BY_ID, FREQ_ADVERBS } from '@/content/lexicon/time';

const subj = (id: string) => ALL_SUBJECTS.find((x) => x.id === id)!;
const freq = (id: string) => FREQ_ADVERBS.find((f) => f.id === id)!;

function en(c: Clause, contract = true): string {
  const r = realizeEn(c, { contract });
  return latticeText(lattice(r.slots, r.end));
}

describe('réalisation des propositions', () => {
  it('présent simple, 3e personne et fréquence', () => {
    const c: Clause = { subj: subj('she'), pred: predicate('drink'), obj: { noun: noun('coffee'), det: 'a', plural: false }, tense: 'presSimple', freq: freq('often') };
    expect(en(c)).toBe('She often drinks coffee.');
    expect(realizeFr(c)).toBe('Elle boit souvent du café.');
  });

  it('négation avec jamais et article partitif', () => {
    const c: Clause = { subj: subj('he'), pred: predicate('eat_unc'), obj: { noun: noun('meat'), det: 'a', plural: false }, tense: 'presSimple', freq: freq('never') };
    expect(en(c)).toBe('He never eats meat.');
    expect(realizeFr(c)).toBe('Il ne mange jamais de viande.');
  });

  it('question au présent simple avec do-support', () => {
    const c: Clause = { subj: subj('you'), pred: predicate('play_sport'), obj: { noun: noun('tennis'), det: 'none', plural: false }, tense: 'presSimple', form: 'yn', time: TIME_BY_ID.at_weekend };
    expect(en(c)).toBe('Do you play tennis at the weekend?');
    expect(realizeFr(c)).toBe('Est-ce que tu joues au tennis le week-end\u00a0?');
  });

  it('négation au présent continu', () => {
    const c: Clause = { subj: subj('n_emma'), pred: predicate('watch_tv'), tense: 'presCont', neg: true, time: TIME_BY_ID.at_moment };
    expect(en(c)).toBe("Emma isn't watching TV at the moment.");
    expect(realizeFr(c)).toBe('Emma ne regarde pas la télé en ce moment.');
  });

  it('passé composé avec être et accord', () => {
    const c: Clause = { subj: subj('my_sister'), pred: predicate('go_city'), obj: { noun: noun('london'), det: 'none', plural: false }, tense: 'pastSimple', time: TIME_BY_ID.last_summer };
    expect(en(c)).toBe('My sister went to London last summer.');
    expect(realizeFr(c)).toBe("Ma sœur est allée à Londres l'été dernier.");
  });

  it('present perfect : been to + déjà', () => {
    const c: Clause = { subj: subj('you'), pred: predicate('go_country'), obj: { noun: noun('japan'), det: 'none', plural: false }, tense: 'presPerf', form: 'yn', ppAdv: 'ever' };
    expect(en(c)).toBe('Have you ever been to Japan?');
    expect(realizeFr(c)).toBe('Est-ce que tu es déjà allé au Japon\u00a0?');
  });

  it('present perfect + for → présent + depuis', () => {
    const c: Clause = { subj: subj('they'), pred: predicate('live_city'), obj: { noun: noun('dublin'), det: 'none', plural: false }, tense: 'presPerf', time: TIME_BY_ID.for_ten_years };
    expect(en(c)).toBe('They have lived in Dublin for ten years.');
    expect(realizeFr(c)).toBe('Ils habitent à Dublin depuis dix ans.');
  });

  it('pronominal au futur proche négatif', () => {
    const c: Clause = { subj: subj('we'), pred: predicate('get_up'), tense: 'goingTo', neg: true, time: TIME_BY_ID.tomorrow };
    expect(en(c)).toBe("We aren't going to get up early tomorrow.");
    expect(realizeFr(c)).toBe('Nous n\'allons pas nous lever tôt demain.');
  });

  it('question en wh sur le lieu', () => {
    const c: Clause = { subj: subj('n_tom'), pred: predicate('live_country'), obj: { noun: noun('canada'), det: 'none', plural: false }, tense: 'presSimple', form: 'wh', wh: 'place' };
    expect(en(c)).toBe('Where does Tom live?');
    expect(realizeFr(c)).toBe("Où est-ce que Tom habite\u00a0?");
  });

  it('possessif accordé au sujet', () => {
    const c: Clause = { subj: subj('n_emma'), pred: predicate('do_homework'), tense: 'pastSimple', neg: true, time: TIME_BY_ID.yesterday };
    expect(en(c)).toBe("Emma didn't do her homework yesterday.");
    expect(realizeFr(c)).toBe("Emma n'a pas fait ses devoirs hier.");
  });

  it('accepte les contractions et variantes', () => {
    const c: Clause = { subj: subj('she'), pred: predicate('watch'), obj: { noun: noun('film'), det: 'a', plural: false }, tense: 'presCont', neg: true };
    const r = realizeEn(c);
    const sp = spec(lattice(r.slots, r.end));
    expect(matchAnswer("She isn't watching a movie", sp).ok).toBe(true);
    expect(matchAnswer("she's not watching a film.", sp).ok).toBe(true);
    expect(matchAnswer('She is not watching a film', sp).ok).toBe(true);
    expect(matchAnswer('She not watching a film', sp).ok).toBe(false);
  });

  it('négation partitive dans un complément fixe', () => {
    const c: Clause = { subj: subj('i'), pred: predicate('listen_music_bare'), tense: 'presSimple', neg: true, time: TIME_BY_ID.every_evening };
    expect(realizeFr(c)).toBe("Je n'écoute pas de musique tous les soirs.");
  });
});

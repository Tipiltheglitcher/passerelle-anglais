/**
 * Adjectifs : forme anglaise, type de comparatif, adverbe dérivé, formes
 * françaises (accord) et catégories de noms qu'ils peuvent qualifier.
 * Format : id | anglais | comparatif (er, more, both, ou « better|best ») | options | fr m/f[/mpl/fpl] | catégories | niveau
 * Options : dbl (redoublement), pre (avant le nom en français), adv=… (adverbe), fcmp=… (comparatif FR), mv=… (masc. devant voyelle)
 */
import type { AdjEntry, Level } from './types';

const DATA = `
tall|tall|er||grand/grande|person|A2
short_p|short|er||petit/petite|person|A2
old_p|old|er||âgé/âgée|person|A2
young|young|er|pre|jeune/jeune|person|A2
funny|funny|er||drôle/drôle|person,media|A2
friendly|friendly|both|adv=-|sympathique/sympathique|person|A2
kind|kind|er||gentil/gentille|person|A2
clever|clever|both||intelligent/intelligente|person|A2
lazy|lazy|er||paresseux/paresseuse|person|A2
strong|strong|er||fort/forte|person,drink|A2
rich|rich|er||riche/riche|person|A2
happy|happy|er||heureux/heureuse|person|A2
patient|patient|more||patient/patiente|person|B1
polite|polite|more||poli/polie|person|B1
shy|shy|shyer|shyest|timide/timide|person|B1
serious|serious|more||sérieux/sérieuse|person|B1
generous|generous|more||généreux/généreuse|person|B1
strict|strict|er||strict/stricte|person|B1
busy_p|busy|er||occupé/occupée|person|A2
big|big|er|dbl,pre|grand/grande|city,home,room,vehicle,device,clothes|A2
small|small|er|pre|petit/petite|city,home,room,vehicle,device,clothes|A2
old_t|old|er|pre,mv=vieil|vieux/vieille/vieux/vieilles|city,home,vehicle,device|A2
new|new|er|pre,mv=nouvel|nouveau/nouvelle/nouveaux/nouvelles|vehicle,device|A2
fast|fast|er|adv=fast|rapide/rapide|vehicle,device|A2
slow|slow|er||lent/lente|vehicle,device|A2
expensive|expensive|more||cher/chère|city,home,vehicle,device,place,food,clothes,trip|A2
cheap|cheap|er|fcmp=moins cher;moins chère|bon marché/bon marché/bon marché/bon marché|city,home,vehicle,device,place,food,clothes,trip|A2
comfortable|comfortable|more||confortable/confortable|home,vehicle,place,clothes|A2
modern|modern|more||moderne/moderne|city,home,vehicle,device,place|A2
beautiful|beautiful|more|pre,mv=bel|beau/belle/beaux/belles|city,home,clothes|A2
interesting|interesting|more||intéressant/intéressante|city,media,task,trip|A2
boring|boring|more||ennuyeux/ennuyeuse|media,task,trip|A2
exciting|exciting|more||passionnant/passionnante|media,trip|B1
long|long|er|pre|long/longue|media,task,trip,street|A2
short_t|short|er||court/courte|media,task,trip,street|A2
easy|easy|er||facile/facile|task|A2
difficult|difficult|more||difficile/difficile|task|A2
good|good|better|best|bon/bonne|media,place,food,drink,weather|A2
bad|bad|worse|worst|mauvais/mauvaise|media,place,food,weather|A2
hot|hot|er|dbl|chaud/chaude|drink,food,weather|A2
cold|cold|er||froid/froide|drink,food,weather|A2
sunny|sunny|er||ensoleillé/ensoleillée|weather|A2
quiet|quiet|both||calme/calme|city,home,place,street|A2
noisy|noisy|er||bruyant/bruyante|city,home,place,street|A2
safe|safe|er||sûr/sûre|city,vehicle,street|A2
dangerous|dangerous|more||dangereux/dangereuse|city,street,vehicle|A2
clean|clean|er||propre/propre|city,home,place|A2
dirty|dirty|er||sale/sale|city,home,place|A2
busy_pl|busy|er||animé/animée|city,place,street|B1
popular|popular|more||populaire/populaire|place,media|A2
famous|famous|more||célèbre/célèbre|place,media|A2
healthy|healthy|er||sain/saine|food|A2
delicious|delicious|more||délicieux/délicieuse|food|A2
spicy|spicy|er||épicé/épicée|food|B1
sweet|sweet|er||sucré/sucrée|food,drink|A2
fresh|fresh|er||frais/fraîche/frais/fraîches|food|A2
light|light|er||léger/légère|device,clothes|A2
heavy|heavy|er||lourd/lourde|device,clothes|A2
bright|bright|er||lumineux/lumineuse|home,room|B1
dark|dark|er||sombre/sombre|home,room|B1
reliable|reliable|more||fiable/fiable|vehicle,device|B1
powerful|powerful|more||puissant/puissante|vehicle,device|B1
stressful|stressful|more||stressant/stressante|task|B1
tiring|tiring|more||fatigant/fatigante|task,trip|B1
relaxing|relaxing|more||reposant/reposante|trip|B1
wide|wide|er||large/large|street|B1
narrow|narrow|both||étroit/étroite|street|B1
important|important|more||important/importante|task|A2
useful|useful|more||utile/utile|device,task|A2
careful|careful|more||prudent/prudente|person|A2
`;

function parse(): AdjEntry[] {
  const out: AdjEntry[] = [];
  for (const raw of DATA.trim().split('\n')) {
    const [id, en, cmpField, optField, frField, cats, lv] = raw.split('|');
    // Les adjectifs irréguliers s'écrivent « good|better|best|… » : on recolle.
    let cmp = cmpField;
    let opts = optField;
    if (!['er', 'more', 'both'].includes(cmpField)) {
      cmp = `${cmpField}|${optField}`;
      opts = '';
    }
    const flags = opts ? opts.split(',') : [];
    const get = (k: string) => flags.find((f) => f.startsWith(`${k}=`))?.slice(k.length + 1);
    const [m, f, mpl, fpl] = frField.split('/');
    const advRaw = get('adv');
    out.push({
      id,
      en,
      cmp,
      dbl: flags.includes('dbl') || undefined,
      adv: advRaw === undefined ? undefined : advRaw === '-' ? null : advRaw,
      fr: { m, f, ...(mpl ? { mpl } : {}), ...(fpl ? { fpl } : {}), ...(get('mv') ? { mv: get('mv') } : {}) },
      fpre: flags.includes('pre') || undefined,
      fcmp: get('fcmp'),
      on: cats.split(','),
      lv: lv as Level,
    });
  }
  return out;
}

/** Compléments pour les adjectifs irréguliers (format abrégé dans la table). */
const IRREGULAR_EXTRA: Record<string, Partial<AdjEntry>> = {
  good: { fpre: true, fcmp: 'meilleur;meilleure', adv: 'well' },
  bad: { fpre: true, fcmp: 'pire;pire', adv: 'badly' },
  shy: { adv: 'shyly' },
};

export const ADJECTIVES: AdjEntry[] = parse().map((a) => ({ ...a, ...(IRREGULAR_EXTRA[a.id] ?? {}) }));

export const ADJ_BY_ID: Record<string, AdjEntry> = Object.fromEntries(ADJECTIVES.map((a) => [a.id, a]));

export function adjectivesFor(category: string, maxLevel: Level = 'B1'): AdjEntry[] {
  return ADJECTIVES.filter((a) => a.on.includes(category) && (maxLevel === 'B1' || a.lv === 'A2'));
}

/** Adverbes de manière avec leur traduction (prédicats compatibles). */
export interface MannerAdverb {
  en: string;
  adj: string;
  fr: string;
  /** Prédicats (id) compatibles. */
  with: string[];
}

export const MANNER_ADVERBS: MannerAdverb[] = [
  { en: 'carefully', adj: 'careful', fr: 'prudemment', with: ['drive'] },
  { en: 'slowly', adj: 'slow', fr: 'lentement', with: ['drive', 'speak', 'walk', 'eat', 'work'] },
  { en: 'quickly', adj: 'quick', fr: 'vite', with: ['speak', 'walk', 'eat', 'work', 'run'] },
  { en: 'fast', adj: 'fast', fr: 'vite', with: ['drive', 'run', 'swim'] },
  { en: 'well', adj: 'good', fr: 'bien', with: ['sing', 'dance', 'cook', 'swim', 'speak_en', 'play_piano', 'sleep'] },
  { en: 'badly', adj: 'bad', fr: 'mal', with: ['sing', 'dance', 'cook', 'drive', 'sleep'] },
  { en: 'hard', adj: 'hard', fr: 'dur', with: ['work', 'study'] },
  { en: 'quietly', adj: 'quiet', fr: 'doucement', with: ['speak'] },
  { en: 'loudly', adj: 'loud', fr: 'fort', with: ['speak', 'sing'] },
  { en: 'beautifully', adj: 'beautiful', fr: 'magnifiquement', with: ['sing', 'dance', 'play_piano'] },
  { en: 'fluently', adj: 'fluent', fr: 'couramment', with: ['speak_en'] },
  { en: 'clearly', adj: 'clear', fr: 'clairement', with: ['speak', 'explain'] },
  { en: 'patiently', adj: 'patient', fr: 'patiemment', with: ['wait', 'explain'] },
  { en: 'politely', adj: 'polite', fr: 'poliment', with: ['speak', 'answer'] },
  { en: 'easily', adj: 'easy', fr: 'facilement', with: ['win'] },
  { en: 'dangerously', adj: 'dangerous', fr: 'dangereusement', with: ['drive'] },
  { en: 'perfectly', adj: 'perfect', fr: 'parfaitement', with: ['speak_en', 'play_piano'] },
  { en: 'healthily', adj: 'healthy', fr: 'sainement', with: ['eat'] },
];

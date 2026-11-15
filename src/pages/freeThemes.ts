/** Thèmes de l'entraînement libre, regroupés par niveau. */
import { ALL_UNITS, SKILL_BY_ID } from '@/content/curriculum';
import type { CefrLevel } from '@/content/lexicon/types';

export type ThemeGroup = 'grammar' | 'vocab' | 'function';

export interface Theme {
  id: string;
  title: string;
  subtitle: string;
  group: ThemeGroup;
  icon: string;
  skills: string[];
}

/** Thèmes proposés pour un niveau : unités de grammaire et de compréhension, thèmes de vocabulaire un par un. */
export function themesFor(level: CefrLevel): Theme[] {
  const out: Theme[] = [];
  for (const u of ALL_UNITS) {
    const skills = u.skills.filter((id) => SKILL_BY_ID[id]?.level === level);
    if (!skills.length) continue;
    if (u.kind === 'vocab') {
      for (const id of skills) {
        const d = SKILL_BY_ID[id];
        out.push({ id, title: d.title, subtitle: d.summary, group: 'vocab', icon: u.icon, skills: [id] });
      }
    } else {
      out.push({
        id: u.id,
        title: u.title,
        subtitle: skills.map((id) => SKILL_BY_ID[id].title).join(' · '),
        group: u.kind === 'grammar' ? 'grammar' : 'function',
        icon: u.icon,
        skills,
      });
    }
  }
  return out;
}

/**
 * Verbes anglais et français.
 * - IRREGULAR_VERBS : liste d'étude des verbes irréguliers (base, prétérit, participe, sens).
 * - EN_VERBS : toutes les entrées utilisables par le générateur.
 * - FR_VERBS : conjugaisons françaises nécessaires aux traductions.
 */
import type { EnVerb } from '@/engine/lang/en/morphology';
import type { FrVerb } from '@/engine/lang/fr/morphology';
import { ALLER, AVOIR, ETRE, VENIR } from '@/engine/lang/fr/morphology';
import type { Level } from './types';

export interface IrregularVerb {
  base: string;
  past: string[];
  pp: string[];
  fr: string;
  lv: Level;
  /** Groupe de forme pour la mémorisation (ABC, ABB, AAA, ABA). */
  pattern: 'AAA' | 'ABB' | 'ABA' | 'ABC';
}

// base | prétérit (variantes /) | participe (variantes /) | sens | niveau
const IRREGULAR_TABLE = `
be|was/were|been|être|A2
become|became|become|devenir|A2
begin|began|begun|commencer|A2
break|broke|broken|casser|A2
bring|brought|brought|apporter|A2
build|built|built|construire|A2
buy|bought|bought|acheter|A2
catch|caught|caught|attraper|A2
choose|chose|chosen|choisir|A2
come|came|come|venir|A2
cost|cost|cost|coûter|A2
cut|cut|cut|couper|A2
do|did|done|faire|A2
draw|drew|drawn|dessiner|A2
drink|drank|drunk|boire|A2
drive|drove|driven|conduire|A2
eat|ate|eaten|manger|A2
fall|fell|fallen|tomber|A2
feel|felt|felt|ressentir, se sentir|A2
find|found|found|trouver|A2
fly|flew|flown|voler, prendre l'avion|A2
forget|forgot|forgotten|oublier|A2
get|got|got/gotten|obtenir, recevoir, devenir|A2
give|gave|given|donner|A2
go|went|gone|aller|A2
grow|grew|grown|grandir, cultiver|A2
have|had|had|avoir|A2
hear|heard|heard|entendre|A2
hurt|hurt|hurt|blesser, faire mal|A2
keep|kept|kept|garder|A2
know|knew|known|savoir, connaître|A2
learn|learned/learnt|learned/learnt|apprendre|A2
leave|left|left|partir, quitter, laisser|A2
lend|lent|lent|prêter|A2
lose|lost|lost|perdre|A2
make|made|made|faire, fabriquer|A2
meet|met|met|rencontrer, retrouver|A2
pay|paid|paid|payer|A2
put|put|put|mettre, poser|A2
read|read|read|lire|A2
ride|rode|ridden|faire du vélo / du cheval|A2
ring|rang|rung|sonner|A2
run|ran|run|courir|A2
say|said|said|dire|A2
see|saw|seen|voir|A2
sell|sold|sold|vendre|A2
send|sent|sent|envoyer|A2
sing|sang|sung|chanter|A2
sit|sat|sat|s'asseoir|A2
sleep|slept|slept|dormir|A2
speak|spoke|spoken|parler|A2
spend|spent|spent|dépenser, passer (du temps)|A2
stand|stood|stood|être debout|A2
swim|swam|swum|nager|A2
take|took|taken|prendre|A2
teach|taught|taught|enseigner|A2
tell|told|told|dire, raconter|A2
think|thought|thought|penser|A2
understand|understood|understood|comprendre|A2
wake|woke|woken|(se) réveiller|A2
wear|wore|worn|porter (un vêtement)|A2
win|won|won|gagner|A2
write|wrote|written|écrire|A2
bite|bit|bitten|mordre|B1
blow|blew|blown|souffler|B1
burn|burned/burnt|burned/burnt|brûler|B1
deal|dealt|dealt|traiter, gérer|B1
dig|dug|dug|creuser|B1
dream|dreamed/dreamt|dreamed/dreamt|rêver|B1
feed|fed|fed|nourrir|B1
fight|fought|fought|se battre|B1
forgive|forgave|forgiven|pardonner|B1
freeze|froze|frozen|geler|B1
hang|hung|hung|accrocher, suspendre|B1
hide|hid|hidden|cacher|B1
hit|hit|hit|frapper, heurter|B1
hold|held|held|tenir|B1
lay|laid|laid|poser, mettre (la table)|B1
lead|led|led|mener, guider|B1
let|let|let|laisser, permettre|B1
light|lit|lit|allumer|B1
mean|meant|meant|signifier, vouloir dire|B1
quit|quit|quit|arrêter, démissionner|B1
rise|rose|risen|se lever, augmenter|B1
set|set|set|fixer, régler|B1
shake|shook|shaken|secouer|B1
shine|shone|shone|briller|B1
shoot|shot|shot|tirer, tourner (un film)|B1
show|showed|shown/showed|montrer|B1
shut|shut|shut|fermer|B1
sink|sank|sunk|couler|B1
smell|smelled/smelt|smelled/smelt|sentir (une odeur)|B1
spell|spelled/spelt|spelled/spelt|épeler|B1
spread|spread|spread|étaler, répandre|B1
steal|stole|stolen|voler (dérober)|B1
stick|stuck|stuck|coller|B1
sting|stung|stung|piquer|B1
strike|struck|struck|frapper, faire grève|B1
swear|swore|sworn|jurer|B1
sweep|swept|swept|balayer|B1
tear|tore|torn|déchirer|B1
throw|threw|thrown|lancer, jeter|B1
upset|upset|upset|contrarier|B1
`;

function classify(base: string, past: string, pp: string): IrregularVerb['pattern'] {
  if (base === past && past === pp) return 'AAA';
  if (past === pp) return 'ABB';
  if (base === pp) return 'ABA';
  return 'ABC';
}

export const IRREGULAR_VERBS: IrregularVerb[] = IRREGULAR_TABLE.trim()
  .split('\n')
  .map((line) => {
    const [base, past, pp, fr, lv] = line.split('|');
    const pastList = past.split('/');
    const ppList = pp.split('/');
    return {
      base,
      past: pastList,
      pp: ppList,
      fr,
      lv: lv as Level,
      pattern: classify(base, pastList[0], ppList[0]),
    };
  });

/** Verbes réguliers utilisés par le générateur (drapeaux : dbl = redoublement, lUK = « l » britannique). */
const REGULAR = `
work live play watch listen cook clean wash visit call help study walk talk like love hate
want need start finish open close stay arrive use download check charge post order book rent
paint fix repair dance look wait ask answer carry try cry enjoy decide hope promise refuse
avoid suggest mind imagine invite move change phone borrow share explain improve prepare
pass fail miss kiss push pull rain snow smile laugh tidy hurry worry marry reply deliver
receive believe follow happen offer own pick print recommend relax remember rest return save
taste turn type celebrate complain compare create design earn expect fill install join knock
park pack practise practice record repeat serve shout support text thank train translate
update upload agree argue continue organise organize exercise iron vacuum water wish learn
dress shower brush climb jump kick lock unlock film fry bake boil cancel sign arrange attend
manage afford hire report email visit discover invent
stop:dbl plan:dbl shop:dbl chat:dbl jog:dbl drop:dbl rob:dbl hug:dbl admit:dbl regret:dbl
prefer:dbl refer:dbl occur:dbl permit:dbl travel:lUK quarrel:lUK label:lUK control:dbl
`;

function buildEnVerbs(): Record<string, EnVerb> {
  const out: Record<string, EnVerb> = {};
  for (const tok of REGULAR.trim().split(/\s+/)) {
    const [base, flag] = tok.split(':');
    out[base] = { base, ...(flag === 'dbl' ? { dbl: true } : flag === 'lUK' ? { lUK: true } : {}) };
  }
  // « cancel » : cancelled (UK) / canceled (US)
  out.cancel = { base: 'cancel', lUK: true };
  for (const iv of IRREGULAR_VERBS) {
    out[iv.base] = { base: iv.base, past: iv.past, pp: iv.pp };
  }
  // redoublement de la consonne finale devant -ing pour ces irréguliers
  const dblIrregular = ['begin', 'cut', 'get', 'hit', 'let', 'put', 'run', 'set', 'shut', 'sit', 'swim', 'win', 'forget', 'dig', 'upset', 'quit'];
  for (const b of dblIrregular) out[b] = { ...out[b], dbl: true };
  out.lie = { base: 'lie' }; // « mentir » (régulier)
  return out;
}

export const EN_VERBS: Record<string, EnVerb> = buildEnVerbs();

export function enVerb(base: string): EnVerb {
  const v = EN_VERBS[base];
  if (!v) throw new Error(`Verbe anglais inconnu : ${base}`);
  return v;
}

// ---------- Verbes français ----------

// infinitif | présent (6 formes, vide = régulier) | participe | auxiliaire (ê = être) | radical futur | radical imparfait | ir2
const FR_TABLE = `
faire|fais,fais,fait,faisons,faites,font|fait||fer||
prendre|prends,prends,prend,prenons,prenez,prennent|pris||||
apprendre|apprends,apprends,apprend,apprenons,apprenez,apprennent|appris||||
comprendre|comprends,comprends,comprend,comprenons,comprenez,comprennent|compris||||
mettre|mets,mets,met,mettons,mettez,mettent|mis||||
promettre|promets,promets,promet,promettons,promettez,promettent|promis||||
boire|bois,bois,boit,buvons,buvez,boivent|bu||||
lire|lis,lis,lit,lisons,lisez,lisent|lu||||
écrire|écris,écris,écrit,écrivons,écrivez,écrivent|écrit||||
inscrire|inscris,inscris,inscrit,inscrivons,inscrivez,inscrivent|inscrit||||
dire|dis,dis,dit,disons,dites,disent|dit||||
voir|vois,vois,voit,voyons,voyez,voient|vu||verr||
prévoir|prévois,prévois,prévoit,prévoyons,prévoyez,prévoient|prévu||prévoir||
vivre|vis,vis,vit,vivons,vivez,vivent|vécu||||
suivre|suis,suis,suit,suivons,suivez,suivent|suivi||||
connaître|connais,connais,connaît,connaissons,connaissez,connaissent|connu||||
savoir|sais,sais,sait,savons,savez,savent|su||saur||
vouloir|veux,veux,veut,voulons,voulez,veulent|voulu||voudr||
pouvoir|peux,peux,peut,pouvons,pouvez,peuvent|pu||pourr||
devoir|dois,dois,doit,devons,devez,doivent|dû||devr||
recevoir|reçois,reçois,reçoit,recevons,recevez,reçoivent|reçu||recevr||
partir|pars,pars,part,partons,partez,partent|parti|ê|||
sortir|sors,sors,sort,sortons,sortez,sortent|sorti|ê|||
dormir|dors,dors,dort,dormons,dormez,dorment|dormi||||
sentir|sens,sens,sent,sentons,sentez,sentent|senti||||
courir|cours,cours,court,courons,courez,courent|couru||courr||
ouvrir|ouvre,ouvres,ouvre,ouvrons,ouvrez,ouvrent|ouvert||||
offrir|offre,offres,offre,offrons,offrez,offrent|offert||||
conduire|conduis,conduis,conduit,conduisons,conduisez,conduisent|conduit||||
construire|construis,construis,construit,construisons,construisez,construisent|construit||||
attendre|attends,attends,attend,attendons,attendez,attendent|attendu||||
vendre|vends,vends,vend,vendons,vendez,vendent|vendu||||
perdre|perds,perds,perd,perdons,perdez,perdent|perdu||||
rendre|rends,rends,rend,rendons,rendez,rendent|rendu||||
entendre|entends,entends,entend,entendons,entendez,entendent|entendu||||
répondre|réponds,réponds,répond,répondons,répondez,répondent|répondu||||
descendre|descends,descends,descend,descendons,descendez,descendent|descendu|ê|||
détendre|détends,détends,détend,détendons,détendez,détendent|détendu||||
peindre|peins,peins,peint,peignons,peignez,peignent|peint||||
éteindre|éteins,éteins,éteint,éteignons,éteignez,éteignent|éteint||||
croire|crois,crois,croit,croyons,croyez,croient|cru||||
devenir|deviens,deviens,devient,devenons,devenez,deviennent|devenu|ê|deviendr||
revenir|reviens,reviens,revient,revenons,revenez,reviennent|revenu|ê|reviendr||
souvenir|souviens,souviens,souvient,souvenons,souvenez,souviennent|souvenu||souviendr||
pleuvoir|pleut,pleut,pleut,pleut,pleut,pleut|plu||pleuvr|pleuv|
acheter|achète,achètes,achète,achetons,achetez,achètent|||achèter||
appeler|appelle,appelles,appelle,appelons,appelez,appellent|||appeller||
rappeler|rappelle,rappelles,rappelle,rappelons,rappelez,rappellent|||rappeller||
payer|paie,paies,paie,payons,payez,paient|||paier||
essayer|essaie,essaies,essaie,essayons,essayez,essaient|||essaier||
envoyer|envoie,envoies,envoie,envoyons,envoyez,envoient|||enverr||
nettoyer|nettoie,nettoies,nettoie,nettoyons,nettoyez,nettoient|||nettoier||
ennuyer|ennuie,ennuies,ennuie,ennuyons,ennuyez,ennuient|||ennuier||
préférer|préfère,préfères,préfère,préférons,préférez,préfèrent|||||
espérer|espère,espères,espère,espérons,espérez,espèrent|||||
répéter|répète,répètes,répète,répétons,répétez,répètent|||||
célébrer|célèbre,célèbres,célèbre,célébrons,célébrez,célèbrent|||||
inquiéter|inquiète,inquiètes,inquiète,inquiétons,inquiétez,inquiètent|||||
lever|lève,lèves,lève,levons,levez,lèvent|||lèver||
promener|promène,promènes,promène,promenons,promenez,promènent|||promèner||
emmener|emmène,emmènes,emmène,emmenons,emmenez,emmènent|||emmèner||
jeter|jette,jettes,jette,jetons,jetez,jettent|||jetter||
finir||||||ir2
choisir||||||ir2
réussir||||||ir2
grandir||||||ir2
remplir||||||ir2
réfléchir||||||ir2
arriver|||ê|||
rester|||ê|||
rentrer|||ê|||
entrer|||ê|||
tomber|||ê|||
monter|||ê|||
retourner|||ê|||
passer||||||
`;

function buildFrVerbs(): Record<string, FrVerb> {
  const out: Record<string, FrVerb> = { être: ETRE, avoir: AVOIR, aller: ALLER, venir: VENIR };
  for (const raw of FR_TABLE.trim().split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const [inf, pres, pp, aux, fut, imp, flag] = line.split('|');
    const v: FrVerb = { inf };
    if (pres) v.pres = pres.split(',').join('|');
    if (pp) v.pp = pp;
    if (aux === 'ê') v.aux = 'être';
    if (fut) v.fut = fut;
    if (imp) v.imp = imp;
    if (flag === 'ir2') v.ir2 = true;
    out[inf] = v;
  }
  return out;
}

export const FR_VERBS: Record<string, FrVerb> = buildFrVerbs();

/** Verbe français ; les verbes réguliers en -er non listés sont créés à la volée. */
export function frVerb(inf: string): FrVerb {
  const v = FR_VERBS[inf];
  if (v) return v;
  if (inf.endsWith('er')) {
    const created: FrVerb = { inf };
    FR_VERBS[inf] = created;
    return created;
  }
  throw new Error(`Verbe français inconnu : ${inf}`);
}

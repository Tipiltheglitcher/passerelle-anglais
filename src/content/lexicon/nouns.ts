/**
 * Noms utilisés par le générateur de phrases.
 * Format : anglais[/synonymes] | français | genre | catégories | options
 * Options : u (indénombrable), po (toujours pluriel en anglais), fpo (toujours
 * pluriel en français), pl=… / fpl=… (pluriels irréguliers), proper (nom propre),
 * the (article obligatoire), fprep=… (préposition de lieu), lv=B1, id=….
 */
import type { Level, Noun } from './types';

const DATA = `
# --- nourriture dénombrable
apple|pomme|f|food,fruit,count_food
banana|banane|f|food,fruit,count_food
orange|orange|f|food,fruit,count_food
pear|poire|f|food,fruit,count_food
peach|pêche|f|food,fruit,count_food
lemon|citron|m|food,fruit,count_food
strawberry|fraise|f|food,fruit,count_food
tomato|tomate|f|food,veg,count_food
carrot|carotte|f|food,veg,count_food
potato|pomme de terre|f|food,veg,count_food|fpl=pommes de terre
onion|oignon|m|food,veg,count_food
egg|œuf|m|food,count_food
sandwich|sandwich|m|food,dish,count_food|fpl=sandwichs
pizza|pizza|f|food,dish,count_food
cake|gâteau|m|food,dish,count_food
biscuit/cookie|biscuit|m|food,count_food
croissant|croissant|m|food,count_food
burger/hamburger|hamburger|m|food,dish,count_food
salad|salade|f|food,dish,count_food
omelette/omelet|omelette|f|food,dish,count_food
sausage|saucisse|f|food,count_food
vegetable|légume|m|food,veg,count_food
# --- nourriture indénombrable
bread|pain|m|food,unc_food|u
rice|riz|m|food,unc_food|u
pasta|pâtes|f|food,unc_food|u,fpo
cheese|fromage|m|food,unc_food|u
meat|viande|f|food,unc_food|u
fish|poisson|m|food,unc_food|u
chicken|poulet|m|food,unc_food|u
soup|soupe|f|food,unc_food,dish|u
chocolate|chocolat|m|food,unc_food|u
butter|beurre|m|food,unc_food|u
sugar|sucre|m|food,unc_food|u
salt|sel|m|food,unc_food|u
fruit|fruits|m|food,unc_food|u,fpo
honey|miel|m|food,unc_food|u
yoghurt/yogurt|yaourt|m|food,unc_food|u
cereal|céréales|f|food,unc_food|u,fpo
jam|confiture|f|food,unc_food|u
ice cream|glace|f|food,unc_food|u
flour|farine|f|food,unc_food|u
oil|huile|f|food,unc_food|u
# --- boissons
water|eau|f|drink|u
coffee|café|m|drink|u
tea|thé|m|drink|u
milk|lait|m|drink|u
orange juice|jus d'orange|m|drink|u
apple juice|jus de pomme|m|drink|u
wine|vin|m|drink|u
lemonade|limonade|f|drink|u
hot chocolate|chocolat chaud|m|drink|u
# --- repas
breakfast|petit-déjeuner|m|meal|u
lunch|déjeuner|m|meal|u
dinner|dîner|m|meal|u
# --- lecture / écriture
book|livre|m|reading,buyable
newspaper|journal|m|reading,buyable
magazine|magazine|m|reading,buyable
novel|roman|m|reading
article|article|m|reading,writing
comic/comic book|bande dessinée|f|reading,buyable
letter|lettre|f|reading,writing
email/e-mail|e-mail|m|reading,writing
message|message|m|reading,writing
report|rapport|m|reading,writing|lv=B1
recipe|recette|f|reading
story|histoire|f|reading,writing
postcard|carte postale|f|writing,buyable
poem|poème|m|reading,writing
# --- à regarder
film/movie|film|m|watch
series|série|f|watch|pl=series
documentary|documentaire|m|watch
match/game|match|m|watch|fpl=matchs
cartoon|dessin animé|m|watch
video|vidéo|f|watch
# --- sports, instruments, jeux
football/soccer|football|m|sport
tennis|tennis|m|sport
basketball|basket|m|sport
volleyball|volley|m|sport
rugby|rugby|m|sport
golf|golf|m|sport
badminton|badminton|m|sport
table tennis/ping-pong|ping-pong|m|sport
handball|handball|m|sport
piano|piano|m|instrument
guitar|guitare|f|instrument
violin|violon|m|instrument
drums|batterie|f|instrument|po
flute|flûte|f|instrument
saxophone|saxophone|m|instrument
trumpet|trompette|f|instrument
chess|échecs|m|game|fpo,u
cards|cartes|f|game|po,fpo
video games|jeux vidéo|m|game|po,fpo
board games|jeux de société|m|game|po,fpo
# --- véhicules et transports
car|voiture|f|vehicle,buyable,thing
bike/bicycle|vélo|m|vehicle,buyable,thing
motorbike/motorcycle|moto|f|vehicle,buyable
scooter|scooter|m|vehicle
boat|bateau|m|vehicle,transport
bus|bus|m|transport
train|train|m|transport
metro/underground/tube/subway|métro|m|transport
tram|tramway|m|transport
taxi/cab|taxi|m|transport
plane/airplane/aeroplane|avion|m|transport
ferry|ferry|m|transport|fpl=ferries
# --- logement
kitchen|cuisine|f|room
bathroom|salle de bain|f|room|fpl=salles de bain
bedroom|chambre|f|room
living room/lounge/sitting room|salon|m|room
garden/yard|jardin|m|room
garage|garage|m|room
house|maison|f|home,buyable
flat/apartment|appartement|m|home
balcony|balcon|m|room
# --- mobilier et maison
window|fenêtre|f|household
door|porte|f|household
floor|sol|m|household
table|table|f|furniture,household
desk|bureau|m|furniture
chair|chaise|f|furniture
sofa/couch|canapé|m|furniture
bed|lit|m|furniture
fridge/refrigerator|frigo|m|furniture,appliance
oven|four|m|appliance
shelf|étagère|f|furniture
box|boîte|f|container
drawer|tiroir|m|container
wardrobe|armoire|f|furniture
lamp|lampe|f|furniture,buyable
mirror|miroir|m|furniture
plant|plante|f|household,buyable
washing machine|machine à laver|f|appliance
dishwasher|lave-vaisselle|m|appliance|fpl=lave-vaisselle
# --- appareils
phone/mobile/mobile phone/cellphone/cell phone/smartphone|téléphone|m|device,buyable,item,thing
laptop|ordinateur portable|m|device,buyable,item,thing
computer|ordinateur|m|device,buyable,thing
tablet|tablette|f|device,buyable,item
printer|imprimante|f|device
camera|appareil photo|m|device,buyable,item|fpl=appareils photo
TV/television/TV set|télévision|f|device,buyable
watch|montre|f|item,buyable,thing
charger|chargeur|m|item,device
remote/remote control|télécommande|f|item
# --- objets personnels
key|clé|f|item,smallitem
wallet|portefeuille|m|item,smallitem
passport|passeport|m|item,smallitem
umbrella|parapluie|m|item,buyable
glasses|lunettes|f|item,smallitem|po,fpo
bag|sac|m|item,buyable,container
ticket|billet|m|item,smallitem,buyable
jacket|veste|f|clothes,item,buyable
coat|manteau|m|clothes,buyable
password|mot de passe|m|item|fpl=mots de passe
pen|stylo|m|item,smallitem,buyable
notebook|cahier|m|item,buyable
hat|chapeau|m|clothes,buyable
scarf|écharpe|f|clothes,buyable
shoe|chaussure|f|clothes,buyable
T-shirt/tee-shirt/t shirt|tee-shirt|m|clothes,buyable
dress|robe|f|clothes,buyable
jumper/sweater/pullover|pull|m|clothes,buyable
skirt|jupe|f|clothes,buyable
suitcase|valise|f|item,buyable,container
map|plan|m|item
present/gift|cadeau|m|gift,buyable
flower|fleur|f|gift,buyable
stamp|timbre|m|buyable
souvenir|souvenir|m|gift,buyable
# --- personnes
mother/mum/mom|mère|f|person,family
father/dad|père|m|person,family
parents|parents|m|person,family|po,fpo
sister|sœur|f|person,family
brother|frère|m|person,family
grandparents|grands-parents|m|person,family|po,fpo
grandmother/grandma/granny|grand-mère|f|person,family|fpl=grands-mères
grandfather/grandad/grandpa|grand-père|m|person,family|fpl=grands-pères
aunt|tante|f|person,family
uncle|oncle|m|person,family
cousin|cousin|m|person,family
friend|ami|m|person,friend
neighbour/neighbor|voisin|m|person
colleague|collègue|m|person
boss|patron|m|person|lv=B1
child|enfant|m|person|pl=children
son|fils|m|person,family
daughter|fille|f|person,family
teacher|professeur|m|person
doctor|médecin|m|person
# --- lieux (destinations)
cinema/movies|cinéma|m|place,leisureplace
gym|salle de sport|f|place,leisureplace|fpl=salles de sport
supermarket|supermarché|m|place,shop
library|bibliothèque|f|place
park|parc|m|place,leisureplace
beach|plage|f|place,leisureplace
bank|banque|f|place,building
post office|poste|f|place,building
station/train station/railway station|gare|f|place,building
airport|aéroport|m|place
hospital|hôpital|m|place,building
museum|musée|m|place,leisureplace,building
restaurant|restaurant|m|place,leisureplace,building
market|marché|m|place,shop
swimming pool/pool|piscine|f|place,leisureplace
theatre/theater|théâtre|m|place,leisureplace,building
bakery|boulangerie|f|place,shop,building
pharmacy/chemist's/drugstore|pharmacie|f|place,shop,building
bookshop/bookstore|librairie|f|place,shop,building
café/cafe|café|m|place,leisureplace,building
hotel|hôtel|m|place,building
church|église|f|place,building
zoo|zoo|m|place,leisureplace
stadium|stade|m|place,leisureplace
shopping centre/shopping center/shopping mall/mall|centre commercial|m|place,shop
# --- villes
London|Londres|f|city|proper,fprep=à
Paris|Paris|m|city|proper,fprep=à
New York|New York|m|city|proper,fprep=à
Rome|Rome|f|city|proper,fprep=à
Madrid|Madrid|m|city|proper,fprep=à
Berlin|Berlin|m|city|proper,fprep=à
Dublin|Dublin|m|city|proper,fprep=à
Edinburgh|Édimbourg|m|city|proper,fprep=à
Lisbon|Lisbonne|f|city|proper,fprep=à
Barcelona|Barcelone|f|city|proper,fprep=à
Tokyo|Tokyo|m|city|proper,fprep=à
Sydney|Sydney|m|city|proper,fprep=à
Brussels|Bruxelles|f|city|proper,fprep=à
Amsterdam|Amsterdam|m|city|proper,fprep=à
Manchester|Manchester|m|city|proper,fprep=à
Montreal|Montréal|m|city|proper,fprep=à
Venice|Venise|f|city|proper,fprep=à
Prague|Prague|f|city|proper,fprep=à
Vienna|Vienne|f|city|proper,fprep=à
Athens|Athènes|f|city|proper,fprep=à
Geneva|Genève|f|city|proper,fprep=à
Toronto|Toronto|m|city|proper,fprep=à
Boston|Boston|m|city|proper,fprep=à
Copenhagen|Copenhague|f|city|proper,fprep=à
Seville|Séville|f|city|proper,fprep=à
# --- pays
Spain|Espagne|f|country|proper,fprep=en
Italy|Italie|f|country|proper,fprep=en
Germany|Allemagne|f|country|proper,fprep=en
England|Angleterre|f|country|proper,fprep=en
Scotland|Écosse|f|country|proper,fprep=en
Ireland|Irlande|f|country|proper,fprep=en
Portugal|Portugal|m|country|proper,fprep=au
Japan|Japon|m|country|proper,fprep=au
Canada|Canada|m|country|proper,fprep=au
United States/US/USA|États-Unis|m|country|proper,the,fpo,fprep=aux
United Kingdom/UK|Royaume-Uni|m|country|proper,the,fprep=au
Mexico|Mexique|m|country|proper,fprep=au
Brazil|Brésil|m|country|proper,fprep=au
Greece|Grèce|f|country|proper,fprep=en
China|Chine|f|country|proper,fprep=en
Australia|Australie|f|country|proper,fprep=en
Morocco|Maroc|m|country|proper,fprep=au
Belgium|Belgique|f|country|proper,fprep=en
Switzerland|Suisse|f|country|proper,fprep=en
Netherlands|Pays-Bas|m|country|proper,the,fpo,fprep=aux
Norway|Norvège|f|country|proper,fprep=en
Sweden|Suède|f|country|proper,fprep=en
India|Inde|f|country|proper,fprep=en
Egypt|Égypte|f|country|proper,fprep=en
Turkey|Turquie|f|country|proper,fprep=en
Thailand|Thaïlande|f|country|proper,fprep=en
Peru|Pérou|m|country|proper,fprep=au
Argentina|Argentine|f|country|proper,fprep=en
Iceland|Islande|f|country|proper,fprep=en
Croatia|Croatie|f|country|proper,fprep=en
Poland|Pologne|f|country|proper,fprep=en
# --- langues
English|anglais|m|language|proper,u
Spanish|espagnol|m|language|proper,u
German|allemand|m|language|proper,u
Italian|italien|m|language|proper,u
Chinese|chinois|m|language|proper,u
Japanese|japonais|m|language|proper,u
Portuguese|portugais|m|language|proper,u
Arabic|arabe|m|language|proper,u
Russian|russe|m|language|proper,u
French|français|m|language|proper,u
# --- matières
maths/math/mathematics|maths|f|subject|u,fpo
history|histoire|f|subject|u
geography|géographie|f|subject|u
biology|biologie|f|subject|u
chemistry|chimie|f|subject|u
physics|physique|f|subject|u
economics|économie|f|subject|u,lv=B1
law|droit|m|subject|u,lv=B1
medicine|médecine|f|subject|u,lv=B1
computer science|informatique|f|subject|u
music|musique|f|subject,listen|u
art|art|m|subject|u
# --- à écouter
radio|radio|f|listen
podcast|podcast|m|listen
song|chanson|f|listen
# --- tâches et divers
homework|devoirs|m|chore|u,fpo
housework|ménage|m|chore|u
shopping|courses|f|chore|u,fpo
washing-up/dishes|vaisselle|f|chore|u
exercise|exercice|m|chore|u
photo/picture|photo|f|thing
`;

function parse(): Noun[] {
  const out: Noun[] = [];
  for (const raw of DATA.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const [enField, fr, g, cats, flagField = ''] = line.split('|');
    const [en, ...syn] = enField.split('/');
    const flags = flagField.split(',').filter(Boolean);
    const get = (k: string) => flags.find((f) => f.startsWith(`${k}=`))?.slice(k.length + 1);
    const has = (k: string) => flags.includes(k);
    const lv = (get('lv') as Level | undefined) ?? 'A2';
    out.push({
      id: get('id') ?? en.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      en,
      syn,
      pl: get('pl'),
      u: has('u') || undefined,
      po: has('po') || undefined,
      proper: has('proper') || undefined,
      the: has('the') || undefined,
      fr,
      g: g as 'm' | 'f',
      fpl: get('fpl'),
      fpo: has('fpo') || undefined,
      fprep: get('fprep'),
      c: cats.split(',').filter(Boolean),
      lv,
    });
  }
  return out;
}

export const NOUNS: Noun[] = parse();

export const NOUN_BY_ID: Record<string, Noun> = Object.fromEntries(NOUNS.map((n) => [n.id, n]));

export function noun(id: string): Noun {
  const n = NOUN_BY_ID[id];
  if (!n) throw new Error(`Nom inconnu : ${id}`);
  return n;
}

export function nounsIn(cats: readonly string[]): Noun[] {
  return NOUNS.filter((n) => n.c.some((c) => cats.includes(c)));
}

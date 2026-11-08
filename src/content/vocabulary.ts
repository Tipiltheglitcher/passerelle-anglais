/**
 * Vocabulaire thématique A2 → B1.
 * Format : anglais[/variantes] | français[/variantes] | nature | niveau | exemple EN | exemple FR
 * Natures : n (nom), v (verbe), adj, adv, expr (expression), pv (phrasal verb),
 * idiom (expression idiomatique), ff (faux ami), coll (collocation).
 */
import type { Level } from './lexicon/types';

export interface VocabItem {
  id: string;
  theme: string;
  en: string[];
  fr: string[];
  pos: string;
  lv: Level;
  ex?: { en: string; fr: string };
}

export interface VocabTheme {
  id: string;
  title: string;
  icon: string;
  items: VocabItem[];
}

const RAW = `
## daily|Vie quotidienne|sun
wake up|se réveiller|v|A2|I usually wake up at seven.|Je me réveille généralement à sept heures.
get up|se lever|v|A2
have a shower/take a shower|prendre une douche/se doucher|v|A2
get dressed|s'habiller|v|A2
brush your teeth|se brosser les dents|v|A2
have breakfast|prendre le petit-déjeuner|v|A2
commute|faire le trajet domicile-travail|v|B1|It takes me an hour to commute every day.|Je mets une heure pour faire le trajet chaque jour.
alarm clock|réveil|n|A2
routine|routine|n|A2
do the housework|faire le ménage|v|A2
do the washing-up/do the dishes|faire la vaisselle|v|A2
do the laundry/do the washing|faire la lessive|v|A2
iron|repasser|v|A2
vacuum/hoover|passer l'aspirateur|v|B1
tidy up|ranger|v|A2
take out the rubbish/take out the trash|sortir les poubelles|v|B1
cook|cuisiner/faire la cuisine|v|A2
relax|se détendre|v|A2
go to bed|aller se coucher/se coucher|v|A2
fall asleep|s'endormir|v|B1|I fell asleep in front of the TV.|Je me suis endormi devant la télé.
nap|sieste|n|B1|I often have a nap after lunch.|Je fais souvent une sieste après le déjeuner.
weekday|jour de semaine|n|B1
early|tôt|adv|A2
late|tard/en retard|adv|A2
usually|d'habitude/généralement|adv|A2
sometimes|parfois/quelquefois|adv|A2
busy|occupé|adj|A2
free time|temps libre|n|A2
appointment|rendez-vous|n|B1|I have a dentist appointment at ten.|J'ai rendez-vous chez le dentiste à dix heures.
neighbour/neighbor|voisin|n|A2
key|clé|n|A2
umbrella|parapluie|n|A2
wallet|portefeuille|n|A2
calendar|calendrier|n|A2
noisy|bruyant|adj|A2
quiet|calme/silencieux|adj|A2
## work|Travail et études|briefcase
job|travail/emploi/boulot|n|A2
office|bureau|n|A2
colleague|collègue|n|A2
boss|patron/chef|n|A2
salary|salaire|n|B1
earn|gagner (de l'argent)|v|B1|She earns two thousand euros a month.|Elle gagne deux mille euros par mois.
meeting|réunion|n|A2
interview|entretien|n|B1
apply for a job|postuler à un emploi|v|B1|He applied for a job in a bank.|Il a postulé à un emploi dans une banque.
CV/resume|CV|n|B1
skills|compétences|n|B1
experience|expérience|n|A2
full-time|à temps plein|adj|B1
part-time|à temps partiel|adj|B1
unemployed|au chômage|adj|B1
retire|prendre sa retraite|v|B1
school|école|n|A2
university|université|n|A2
student|étudiant/élève|n|A2
lesson|leçon/cours|n|A2
homework|devoirs|n|A2
exam|examen|n|A2
fail an exam|rater un examen/échouer à un examen|v|B1
revise/review|réviser|v|B1|I need to revise for my exam.|J'ai besoin de réviser pour mon examen.
degree|diplôme|n|B1
subject|matière|n|A2
timetable/schedule|emploi du temps|n|A2
break|pause|n|A2
classroom|salle de classe|n|A2
notebook|cahier|n|A2
learn|apprendre|v|A2
teach|enseigner|v|A2
mark/grade|note|n|B1
course|cours/formation|n|B1
career|carrière|n|B1
deadline|date limite/échéance|n|B1|The deadline for the report is Friday.|La date limite pour le rapport est vendredi.
## travel|Voyages et transports|plane
trip/journey|voyage/trajet|n|A2
holiday/vacation|vacances|n|A2
abroad|à l'étranger|adv|B1|She lives abroad.|Elle vit à l'étranger.
passport|passeport|n|A2|Don't forget your passport!|N'oublie pas ton passeport !
luggage/baggage|bagages|n|A2|How much luggage can I take on the plane?|Combien de bagages puis-je emporter dans l'avion ?
suitcase|valise|n|A2
ticket|billet/ticket|n|A2
return ticket/round-trip ticket|aller-retour|n|B1
single ticket/one-way ticket|aller simple|n|B1
book|réserver|v|A2|We need to book a table for tonight.|Il faut réserver une table pour ce soir.
booking/reservation|réservation|n|B1
flight|vol|n|A2|Our flight was delayed by two hours.|Notre vol a été retardé de deux heures.
airport|aéroport|n|A2
board|embarquer|v|B1
delay|retard|n|B1|There is a two-hour delay.|Il y a un retard de deux heures.
cancel|annuler|v|B1|They had to cancel the trip because of the storm.|Ils ont dû annuler le voyage à cause de la tempête.
platform|quai|n|B1|The train to London leaves from platform 4.|Le train pour Londres part du quai 4.
station|gare|n|A2
bus stop|arrêt de bus|n|A2
departure|départ|n|B1
arrival|arrivée|n|B1
miss the train|rater le train|v|A2|Hurry up or we'll miss the train!|Dépêche-toi ou on va rater le train !
traffic jam|embouteillage|n|B1|We were stuck in a traffic jam for an hour.|Nous sommes restés coincés dans un embouteillage pendant une heure.
map|carte/plan|n|A2
guidebook|guide touristique|n|A2
sightseeing|tourisme/visites|n|B1
souvenir|souvenir|n|A2|I bought a souvenir for my grandmother.|J'ai acheté un souvenir pour ma grand-mère.
single room|chambre simple|n|A2
double room|chambre double|n|A2
tourist|touriste|n|A2
countryside|campagne|n|B1
motorway/highway|autoroute|n|B1
seat|siège/place|n|A2
## food|Nourriture et restaurant|utensils
meal|repas|n|A2|We usually have our main meal in the evening.|Nous prenons généralement notre repas principal le soir.
menu|carte/menu|n|A2|Can I see the menu, please?|Je peux voir la carte, s'il vous plaît ?
starter|entrée|n|B1
main course|plat principal|n|B1
dessert|dessert|n|A2
waiter/waitress|serveur/serveuse|n|A2|The waiter brought us some water.|Le serveur nous a apporté de l'eau.
bill/check|addition|n|A2|Could we have the bill, please?|Pourrions-nous avoir l'addition, s'il vous plaît ?
tip|pourboire|n|B1|We left a tip for the waitress.|Nous avons laissé un pourboire à la serveuse.
order|commander|v|A2|Are you ready to order?|Vous êtes prêts à commander ?
vegetarian|végétarien|adj|A2|My sister is vegetarian, so she doesn't eat meat.|Ma sœur est végétarienne, donc elle ne mange pas de viande.
spicy|épicé|adj|B1|This curry is too spicy for me.|Ce curry est trop épicé pour moi.
salty|salé|adj|B1
sweet|sucré|adj|A2
delicious|délicieux|adj|A2|The soup was absolutely delicious.|La soupe était absolument délicieuse.
fresh|frais|adj|A2
bread|pain|n|A2
butter|beurre|n|A2
cheese|fromage|n|A2
meat|viande|n|A2
chicken|poulet|n|A2
fish|poisson|n|A2
vegetables|légumes|n|A2
rice|riz|n|A2
pasta|pâtes|n|A2
egg|œuf|n|A2
strawberry|fraise|n|A2
mushroom|champignon|n|B1
onion|oignon|n|A2
garlic|ail|n|B1
pepper|poivre|n|A2
juice|jus|n|A2
bottle|bouteille|n|A2
glass|verre|n|A2
plate|assiette|n|A2
knife|couteau|n|A2
fork|fourchette|n|A2
spoon|cuillère|n|A2
recipe|recette|n|B1|Can you give me the recipe for this cake?|Tu peux me donner la recette de ce gâteau ?
boil|faire bouillir|v|B1
fry|faire frire|v|B1
bake|faire cuire au four|v|B1
## home|Maison et famille|home
flat/apartment|appartement|n|A2
living room|salon|n|A2
floor|étage/sol|n|A2
stairs|escalier|n|A2
furniture|meubles|n|B1
cupboard|placard|n|B1
shelf|étagère|n|B1
rent|loyer|n|B1|The rent is very high in London.|Le loyer est très élevé à Londres.
landlord|propriétaire|n|B1
move house|déménager|v|B1|We moved house last year.|Nous avons déménagé l'année dernière.
neighbourhood/neighborhood|quartier|n|B1
parents|parents|n|A2
husband|mari|n|A2
wife|femme/épouse|n|A2
son|fils|n|A2
daughter|fille|n|A2
grandparents|grands-parents|n|A2
aunt|tante|n|A2
uncle|oncle|n|A2
nephew|neveu|n|B1
niece|nièce|n|B1
twins|jumeaux|n|B1
only child|enfant unique|n|B1
married|marié|adj|A2
single|célibataire|adj|A2
divorced|divorcé|adj|B1
get married|se marier|v|B1
grow up|grandir|v|B1|I grew up in a small village.|J'ai grandi dans un petit village.
look after|s'occuper de|v|B1|She looks after her grandmother.|Elle s'occupe de sa grand-mère.
## health|Santé et corps|heart
health|santé|n|A2
healthy|en bonne santé/sain|adj|A2|Fruit and vegetables are healthy.|Les fruits et les légumes sont bons pour la santé.
ill/sick|malade|adj|A2
headache|mal de tête|n|A2|I've got a terrible headache.|J'ai un terrible mal de tête.
stomachache|mal de ventre|n|A2
toothache|mal de dents|n|A2
sore throat|mal de gorge|n|B1|She has a sore throat and a cough.|Elle a mal à la gorge et elle tousse.
cold|rhume|n|A2
flu|grippe|n|A2|Half of my class has got the flu.|La moitié de ma classe a la grippe.
fever/temperature|fièvre|n|B1
cough|toux|n|B1
hurt|faire mal|v|A2|My back hurts.|J'ai mal au dos.
pain|douleur|n|B1
injury|blessure|n|B1|He missed the match because of an injury.|Il a raté le match à cause d'une blessure.
nurse|infirmier/infirmière|n|A2
chemist's/pharmacy|pharmacie|n|A2
medicine|médicament|n|A2|Take this medicine twice a day.|Prenez ce médicament deux fois par jour.
prescription|ordonnance|n|B1|You need a prescription for these pills.|Il vous faut une ordonnance pour ces comprimés.
feel better|aller mieux|v|A2|I hope you feel better soon.|J'espère que tu iras mieux bientôt.
get better|guérir/se remettre|v|B1
diet|régime/alimentation|n|B1
lose weight|perdre du poids|v|B1|My dad wants to lose weight.|Mon père veut perdre du poids.
put on weight|prendre du poids|v|B1
stressed|stressé|adj|B1
head|tête|n|A2
arm|bras|n|A2
leg|jambe|n|A2
back|dos|n|A2
stomach|ventre/estomac|n|A2
tooth|dent|n|A2
hand|main|n|A2
foot|pied|n|A2
eye|œil|n|A2
ear|oreille|n|A2
## leisure|Loisirs et sports|music
hobby|loisir/passe-temps|n|A2|Photography is my favourite hobby.|La photographie est mon passe-temps préféré.
go hiking|faire de la randonnée|v|B1|We often go hiking in the mountains.|Nous faisons souvent de la randonnée en montagne.
go camping|faire du camping|v|B1
team|équipe|n|A2|Which football team do you support?|Quelle équipe de foot soutiens-tu ?
match|match|n|A2
win|gagner|v|A2|I hope our team will win tomorrow.|J'espère que notre équipe va gagner demain.
lose|perdre|v|A2
score|marquer|v|B1|He scored two goals.|Il a marqué deux buts.
player|joueur|n|A2
coach|entraîneur|n|B1|Our coach is very strict.|Notre entraîneur est très exigeant.
gym|salle de sport|n|A2
concert|concert|n|A2
band|groupe|n|A2
song|chanson|n|A2
singer|chanteur/chanteuse|n|A2
painting|peinture|n|A2
drawing|dessin|n|A2
photography|photographie|n|B1
exhibition|exposition|n|B1|There's a great exhibition at the museum.|Il y a une super exposition au musée.
novel|roman|n|A2
board game|jeu de société|n|B1|Let's play a board game tonight.|Jouons à un jeu de société ce soir.
chess|échecs|n|A2
party|fête/soirée|n|A2
join a club|s'inscrire dans un club|v|B1|I'd like to join a club to meet new people.|J'aimerais m'inscrire dans un club pour rencontrer de nouvelles personnes.
race|course|n|B1
cycling|cyclisme/vélo|n|A2
swimming|natation|n|A2
## tech|Technologie et médias|laptop
screen|écran|n|A2|The screen on my laptop is broken.|L'écran de mon ordinateur portable est cassé.
keyboard|clavier|n|A2
printer|imprimante|n|A2
charger|chargeur|n|A2|Can I borrow your phone charger?|Je peux emprunter ton chargeur de téléphone ?
battery|batterie|n|A2
password|mot de passe|n|A2|I forgot my password again.|J'ai encore oublié mon mot de passe.
website|site web/site internet|n|A2
app|application|n|A2
download|télécharger|v|A2|You can download the app for free.|Vous pouvez télécharger l'application gratuitement.
upload|mettre en ligne|v|B1
log in/sign in|se connecter|v|B1|You need to log in to see your account.|Il faut vous connecter pour voir votre compte.
log out/sign out|se déconnecter|v|B1
search|chercher/rechercher|v|A2
click|cliquer|v|A2
save|enregistrer/sauvegarder|v|A2
delete|supprimer|v|B1|Don't delete that file, I need it.|Ne supprime pas ce fichier, j'en ai besoin.
file|fichier|n|A2
folder|dossier|n|B1
social media|réseaux sociaux|n|A2
share|partager|v|A2|Can you share the link with me?|Tu peux partager le lien avec moi ?
follow|suivre|v|A2
text|envoyer un SMS/envoyer un texto|v|A2
news|informations/nouvelles|n|A2
TV channel|chaîne de télévision|n|B1
advert/advertisement/ad|publicité|n|B1
online|en ligne|adv|A2|I buy most of my clothes online.|J'achète la plupart de mes vêtements en ligne.
offline|hors ligne|adv|B1
update|mise à jour|n|B1|Your phone needs an update.|Ton téléphone a besoin d'une mise à jour.
## social|Relations sociales|users
best friend|meilleur ami/meilleure amie|n|A2|Tom has been my best friend since primary school.|Tom est mon meilleur ami depuis l'école primaire.
boyfriend|petit ami/copain|n|A2
girlfriend|petite amie/copine|n|A2
partner|partenaire/compagnon|n|B1
get on with/get along with|bien s'entendre avec|v|B1|I get on well with my sister.|Je m'entends bien avec ma sœur.
fall in love|tomber amoureux|v|B1
break up|rompre|v|B1
argue|se disputer|v|B1|My brother and I often argue about money.|Mon frère et moi, nous nous disputons souvent à propos de l'argent.
argument|dispute|n|B1
apologise/apologize|s'excuser|v|B1|You should apologise to her.|Tu devrais t'excuser auprès d'elle.
forgive|pardonner|v|B1
trust|faire confiance|v|B1|I trust you completely.|Je te fais entièrement confiance.
chat|bavarder/discuter|v|A2
introduce|présenter|v|B1|Let me introduce my friend Tom.|Laisse-moi te présenter mon ami Tom.
guest|invité|n|A2
host|hôte|n|B1
kind|gentil|adj|A2
friendly|sympathique/amical|adj|A2
polite|poli|adj|A2|It isn't polite to interrupt people.|Ce n'est pas poli d'interrompre les gens.
rude|impoli/grossier|adj|B1
shy|timide|adj|A2|He's too shy to speak in public.|Il est trop timide pour parler en public.
funny|drôle|adj|A2
honest|honnête|adj|B1
generous|généreux|adj|B1
selfish|égoïste|adj|B1
reliable|fiable|adj|B1|Anna is very reliable: she always keeps her promises.|Anna est très fiable : elle tient toujours ses promesses.
lonely|seul|adj|B1
together|ensemble|adv|A2
alone|seul|adv|A2
relationship|relation|n|B1
wedding|mariage|n|A2|We're going to a wedding on Saturday.|Nous allons à un mariage samedi.
birthday|anniversaire|n|A2
## shopping|Achats et argent|bag
shop/store|magasin|n|A2
market|marché|n|A2
shopping centre/shopping mall/mall|centre commercial|n|A2
pay|payer|v|A2
cost|coûter|v|A2
price|prix|n|A2
cheap|bon marché/pas cher|adj|A2
expensive|cher|adj|A2
money|argent|n|A2
cash|espèces/liquide|n|A2
credit card|carte de crédit/carte bancaire|n|A2
change|monnaie|n|B1|Here's your change.|Voici votre monnaie.
receipt|ticket de caisse/reçu|n|B1
discount|réduction/remise|n|B1
sales|soldes|n|B1
customer|client|n|A2
shop assistant/sales assistant|vendeur/vendeuse|n|A2
queue|file d'attente|n|B1
size|taille|n|A2
try on|essayer|v|A2|Can I try on these jeans?|Est-ce que je peux essayer ce jean ?
fit|aller (à la bonne taille)|v|B1|These shoes don't fit me.|Ces chaussures ne me vont pas.
changing room/fitting room|cabine d'essayage|n|B1
refund|remboursement|n|B1
spend|dépenser|v|A2
save|économiser|v|A2
borrow|emprunter|v|A2
lend|prêter|v|A2
afford|avoir les moyens de|v|B1|I can't afford a new car.|Je n'ai pas les moyens de m'offrir une nouvelle voiture.
clothes|vêtements|n|A2
## feelings|Sentiments et opinions|smile
happy|heureux/content|adj|A2
sad|triste|adj|A2
angry|en colère/fâché|adj|A2
afraid/scared|effrayé|adj|A2
worried|inquiet|adj|A2|I'm worried about my exam.|Je suis inquiet pour mon examen.
excited|enthousiaste/impatient|adj|A2
surprised|surpris|adj|A2
disappointed|déçu|adj|B1|She was disappointed with her results.|Elle a été déçue par ses résultats.
proud|fier|adj|B1|Your parents must be very proud of you.|Tes parents doivent être très fiers de toi.
embarrassed|gêné|adj|B1
jealous|jaloux|adj|B1|Don't be jealous of your sister.|Ne sois pas jaloux de ta sœur.
nervous|nerveux/anxieux|adj|A2
relaxed|détendu|adj|A2
upset|contrarié/bouleversé|adj|B1|She was upset because nobody called her.|Elle était contrariée parce que personne ne l'avait appelée.
calm|calme|adj|A2
mood|humeur|n|B1|She's in a good mood today.|Elle est de bonne humeur aujourd'hui.
feel|se sentir/ressentir|v|A2
believe|croire|v|A2
agree|être d'accord|v|A2|I completely agree with you.|Je suis tout à fait d'accord avec toi.
disagree|ne pas être d'accord|v|B1
opinion|opinion/avis|n|A2
in my opinion|à mon avis|expr|A2|In my opinion, the film was too long.|À mon avis, le film était trop long.
prefer|préférer|v|A2|I prefer tea to coffee.|Je préfère le thé au café.
hate|détester|v|A2
can't stand|ne pas supporter|v|B1|I can't stand waiting.|Je ne supporte pas d'attendre.
enjoy|aimer/apprécier|v|A2
fed up|en avoir marre|adj|B1|I'm fed up with this weather.|J'en ai marre de ce temps.
amazing|incroyable/génial|adj|A2
awful/terrible|affreux/horrible|adj|A2
## professional|Situations professionnelles|building
company/firm|entreprise/société|n|A2
manager|responsable/directeur|n|B1|I need to talk to my manager first.|Je dois d'abord en parler à mon responsable.
employee|employé|n|A2
employer|employeur|n|B1
client|client|n|A2
project|projet|n|A2
report|rapport|n|B1|Can you send me the report by Friday?|Pouvez-vous m'envoyer le rapport d'ici vendredi ?
presentation|présentation/exposé|n|B1
agenda|ordre du jour|n|B1
attend|assister à|v|B1|I attended a conference in Berlin.|J'ai assisté à une conférence à Berlin.
reply|répondre|v|A2
attach|joindre|v|B1|I attach my CV to this email.|Je joins mon CV à cet e-mail.
attachment|pièce jointe|n|B1|I've sent the contract as an attachment.|J'ai envoyé le contrat en pièce jointe.
on time|à l'heure|adv|A2|The meeting started on time.|La réunion a commencé à l'heure.
business trip|voyage d'affaires|n|B1
conference|conférence|n|B1
contract|contrat|n|B1
negotiate|négocier|v|B1|We need to negotiate a better price.|Nous devons négocier un meilleur prix.
promotion|promotion|n|B1
training|formation|n|B1|All new employees get two weeks of training.|Tous les nouveaux employés suivent deux semaines de formation.
responsible for|responsable de|adj|B1
in charge of|chargé de|adj|B1|Who is in charge of the project?|Qui est chargé du projet ?
staff|personnel|n|B1
customer service|service client|n|B1
## conversation|Expressions de conversation|chat
How are you?|Comment vas-tu ?/Comment allez-vous ?/Comment ça va ?|expr|A2
Nice to meet you.|Enchanté.|expr|A2
See you later!|À plus tard !|expr|A2
See you soon!|À bientôt !|expr|A2
Excuse me.|Excusez-moi.|expr|A2
Could you repeat that, please?|Pourriez-vous répéter, s'il vous plaît ?|expr|A2
What do you mean?|Qu'est-ce que tu veux dire ?|expr|B1
I'm not sure.|Je ne suis pas sûr.|expr|A2
It doesn't matter.|Ce n'est pas grave.|expr|A2
Never mind.|Laisse tomber./Peu importe.|expr|B1
You're welcome.|De rien.|expr|A2
No problem.|Pas de problème.|expr|A2
Of course!|Bien sûr !|expr|A2
That sounds great!|Ça a l'air génial !|expr|A2
What a pity!/What a shame!|Quel dommage !|expr|B1
Good luck!|Bonne chance !|expr|A2
Have a nice day!|Bonne journée !|expr|A2
How about...?|Et si on… ?|expr|B1
Why don't we...?|Pourquoi ne pas… ?|expr|B1
I'd rather...|Je préférerais…|expr|B1
Me too.|Moi aussi.|expr|A2
Me neither.|Moi non plus.|expr|B1
I see.|Je vois.|expr|A2
Really?|Vraiment ?|expr|A2
Hang on./Hold on.|Attends./Ne quittez pas.|expr|B1
By the way|Au fait|expr|B1
Anyway|Bref/En tout cas|expr|B1
I don't mind.|Ça m'est égal.|expr|B1
It's up to you.|C'est comme tu veux.|expr|B1
Don't worry.|Ne t'inquiète pas.|expr|A2
## idioms|Expressions idiomatiques|sparkles
It's raining cats and dogs.|Il pleut des cordes.|idiom|B1
a piece of cake|du gâteau (très facile)|idiom|B1|The exam was a piece of cake.|L'examen était du gâteau.
break the ice|briser la glace|idiom|B1|He told a joke to break the ice.|Il a raconté une blague pour briser la glace.
under the weather|patraque/pas dans son assiette|idiom|B1|I'm feeling a bit under the weather.|Je ne suis pas trop dans mon assiette.
call it a day|s'arrêter là pour aujourd'hui|idiom|B1|Let's call it a day.|Arrêtons-nous là pour aujourd'hui.
once in a blue moon|tous les trente-six du mois|idiom|B1|We go to the theatre once in a blue moon.|Nous allons au théâtre tous les trente-six du mois.
cost an arm and a leg|coûter les yeux de la tête|idiom|B1|This car cost an arm and a leg.|Cette voiture a coûté les yeux de la tête.
get cold feet|se dégonfler|idiom|B1
in hot water|dans le pétrin|idiom|B1
keep an eye on|surveiller/garder un œil sur|idiom|B1|Can you keep an eye on my bag?|Tu peux surveiller mon sac ?
by heart|par cœur|idiom|A2|I know this song by heart.|Je connais cette chanson par cœur.
make up your mind|se décider|idiom|B1|Make up your mind!|Décide-toi !
take it easy|se détendre/y aller doucement|idiom|B1
a couch potato|un pantouflard|idiom|B1
the last straw|la goutte d'eau qui fait déborder le vase|idiom|B1
sleep on it|y réfléchir (la nuit porte conseil)|idiom|B1
in the same boat|dans la même galère|idiom|B1
feel blue|avoir le cafard|idiom|B1
see eye to eye|être d'accord|idiom|B1
let the cat out of the bag|vendre la mèche|idiom|B1
when pigs fly|quand les poules auront des dents|idiom|B1
over the moon|aux anges/ravi|idiom|B1|She was over the moon with her results.|Elle était aux anges avec ses résultats.
## phrasal|Phrasal verbs fréquents|zap
turn on/switch on|allumer|pv|A2|Can you turn on the light?|Peux-tu allumer la lumière ?
turn off/switch off|éteindre|pv|A2|Turn off your phone, please.|Éteins ton téléphone, s'il te plaît.
put on|mettre (un vêtement)|pv|A2|Put on your coat, it's cold.|Mets ton manteau, il fait froid.
take off|enlever/décoller|pv|A2|Please take off your shoes.|Enlève tes chaussures, s'il te plaît.
look for|chercher|pv|A2|I'm looking for my keys.|Je cherche mes clés.
look after|s'occuper de|pv|B1|She looks after her little brother.|Elle s'occupe de son petit frère.
look forward to|avoir hâte de|pv|B1|I'm looking forward to the holidays.|J'ai hâte d'être en vacances.
look up|chercher (dans un dictionnaire)|pv|B1|Look up the word in the dictionary.|Cherche le mot dans le dictionnaire.
find out|découvrir/apprendre|pv|B1|I found out the truth.|J'ai découvert la vérité.
give up|abandonner/arrêter|pv|B1|He gave up smoking.|Il a arrêté de fumer.
give back|rendre|pv|B1|Can you give back my book?|Peux-tu me rendre mon livre ?
go out|sortir|pv|A2|We go out every Friday.|Nous sortons tous les vendredis.
come back|revenir|pv|A2|When are you coming back?|Quand est-ce que tu reviens ?
sit down|s'asseoir|pv|A2|Please sit down.|Asseyez-vous, s'il vous plaît.
stand up|se lever|pv|A2|Everybody stood up.|Tout le monde s'est levé.
pick up|aller chercher/ramasser|pv|B1|I'll pick you up at the station.|Je viendrai te chercher à la gare.
set off|partir/se mettre en route|pv|B1|We set off early in the morning.|Nous sommes partis tôt le matin.
get on|monter (dans)|pv|B1|Get on the bus here.|Monte dans le bus ici.
get off|descendre (de)|pv|B1|Get off at the next stop.|Descends au prochain arrêt.
run out of|être à court de|pv|B1|We've run out of milk.|Nous n'avons plus de lait.
fill in|remplir|pv|B1|Fill in this form, please.|Remplissez ce formulaire, s'il vous plaît.
put off|repousser/remettre à plus tard|pv|B1|They put off the meeting until Monday.|Ils ont repoussé la réunion à lundi.
call back|rappeler|pv|B1|I'll call you back later.|Je te rappellerai plus tard.
hang up|raccrocher|pv|B1|Don't hang up!|Ne raccroche pas !
take up|se mettre à|pv|B1|I've taken up yoga.|Je me suis mis au yoga.
carry on|continuer|pv|B1|Carry on, you're doing well!|Continue, tu t'en sors bien !
break down|tomber en panne|pv|B1|Our car broke down on the motorway.|Notre voiture est tombée en panne sur l'autoroute.
work out|faire du sport/trouver (une solution)|pv|B1|I work out at the gym twice a week.|Je fais du sport à la salle deux fois par semaine.
throw away|jeter|pv|B1|Don't throw away that box.|Ne jette pas cette boîte.
turn down|baisser (le son)/refuser|pv|B1|Can you turn down the music?|Peux-tu baisser la musique ?
eat out|manger au restaurant|pv|B1|We usually eat out on Saturdays.|Nous mangeons généralement au restaurant le samedi.
slow down|ralentir|pv|B1|Slow down, you're driving too fast!|Ralentis, tu conduis trop vite !
come in|entrer|pv|A2|Come in and sit down.|Entre et assieds-toi.
go back|retourner|pv|A2|I want to go back to Italy.|Je veux retourner en Italie.
## falsefriends|Faux amis et collocations|alert
actually|en fait|ff|B1|Actually, I don't agree.|En fait, je ne suis pas d'accord.
currently|actuellement|ff|B1|She is currently living in Rome.|Elle vit actuellement à Rome.
eventually|finalement|ff|B1|We eventually found the hotel.|Nous avons finalement trouvé l'hôtel.
library|bibliothèque|ff|A2
bookshop/bookstore|librairie|ff|A2
sensible|raisonnable|ff|B1|That's a sensible decision.|C'est une décision raisonnable.
sensitive|sensible|ff|B1
attend|assister à|ff|B1
journey|trajet/voyage|ff|A2
coin|pièce de monnaie|ff|B1
corner|coin|ff|A2
lecture|cours magistral/conférence|ff|B1
reading|lecture|ff|A2
luck|chance|ff|A2
coach|car (autocar)|ff|B1
disappointment|déception|ff|B1
injure|blesser|ff|B1
make a mistake|faire une erreur|coll|A2|I made a mistake in my homework.|J'ai fait une erreur dans mes devoirs.
make a decision|prendre une décision|coll|B1
make friends|se faire des amis|coll|A2
do homework|faire ses devoirs|coll|A2
do the shopping|faire les courses|coll|A2
take a photo|prendre une photo|coll|A2
take a break|faire une pause|coll|A2
have fun|s'amuser|coll|A2|Have fun at the party!|Amuse-toi bien à la fête !
pay attention|faire attention|coll|B1
tell the truth|dire la vérité|coll|B1
say goodbye|dire au revoir|coll|A2
catch a cold|attraper un rhume|coll|B1
## nature|Nature, météo et environnement|leaf
weather|temps/météo|n|A2|What's the weather like today?|Quel temps fait-il aujourd'hui ?
sunny|ensoleillé|adj|A2|It's sunny, let's go to the beach.|Il fait beau, allons à la plage.
rainy|pluvieux|adj|A2
cloudy|nuageux|adj|A2|It's cloudy, but it isn't raining.|Le ciel est nuageux, mais il ne pleut pas.
windy|venteux|adj|A2|It's too windy to go sailing.|Il y a trop de vent pour faire de la voile.
foggy|brumeux|adj|B1
snow|neige|n|A2
storm|orage/tempête|n|B1|The storm woke me up last night.|L'orage m'a réveillé cette nuit.
temperature|température|n|A2
forecast|prévisions/météo|n|B1|The forecast says it will rain tomorrow.|La météo annonce de la pluie pour demain.
season|saison|n|A2
spring|printemps|n|A2
summer|été|n|A2
autumn/fall|automne|n|A2
winter|hiver|n|A2
mountain|montagne|n|A2
river|rivière/fleuve|n|A2
lake|lac|n|A2
sea|mer|n|A2
forest|forêt|n|A2
island|île|n|B1|They spent their holiday on a small island.|Ils ont passé leurs vacances sur une petite île.
environment|environnement|n|B1
pollution|pollution|n|B1|Air pollution is a big problem in big cities.|La pollution de l'air est un gros problème dans les grandes villes.
recycle|recycler|v|B1|We recycle paper, glass and plastic.|Nous recyclons le papier, le verre et le plastique.
rubbish/trash|déchets/ordures|n|B1
climate change|changement climatique|n|B1|Climate change affects everyone.|Le changement climatique touche tout le monde.
animal|animal|n|A2
`;

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function parse(): VocabTheme[] {
  const themes: VocabTheme[] = [];
  let current: VocabTheme | null = null;
  const seen = new Set<string>();
  for (const raw of RAW.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('## ')) {
      const [id, title, icon] = line.slice(3).split('|');
      current = { id, title, icon, items: [] };
      themes.push(current);
      continue;
    }
    if (!current) continue;
    const [enF, frF, pos, lv, exEn, exFr] = line.split('|');
    const en = enF.split('/').map((x) => x.trim());
    // « fr » peut contenir des « / » à l'intérieur d'expressions ; on découpe prudemment
    const fr = frF.split(/\/(?=[^ ])/).map((x) => x.trim());
    let id = `voc:${current.id}:${slug(en[0])}`;
    if (seen.has(id)) id = `${id}_${seen.size}`;
    seen.add(id);
    current.items.push({
      id,
      theme: current.id,
      en,
      fr,
      pos,
      lv: (lv as Level) ?? 'A2',
      ...(exEn && exFr ? { ex: { en: exEn, fr: exFr } } : {}),
    });
  }
  return themes;
}

export const VOCAB_THEMES: VocabTheme[] = parse();

export const VOCAB_BY_ID: Record<string, VocabItem> = Object.fromEntries(VOCAB_THEMES.flatMap((t) => t.items.map((i) => [i.id, i])));

export const ALL_VOCAB: VocabItem[] = VOCAB_THEMES.flatMap((t) => t.items);

/** Libellé de la nature grammaticale. */
export const POS_LABELS: Record<string, string> = {
  n: 'nom',
  v: 'verbe',
  adj: 'adjectif',
  adv: 'adverbe',
  expr: 'expression',
  pv: 'phrasal verb',
  idiom: 'expression idiomatique',
  ff: 'faux ami',
  coll: 'collocation',
};

/**
 * Prédicats : verbe + complément(s) + traduction française + contraintes
 * d'emploi. Le générateur ne combine que ce que ces contraintes autorisent,
 * ce qui garantit des phrases naturelles (pas de « I am knowing », pas de
 * « I lose my keys every day »…).
 *
 * Aspects par défaut :
 *  - act   : habitude ✔, action en cours ✔, durée (for/since) ✘ sauf dur
 *  - evt   : habitude ✘ sauf hab, action en cours ✘ sauf prog
 *  - state : habitude ✔, action en cours ✘, durée ✔ si dur
 */
import type { Predicate } from './types';

type P = Omit<Predicate, 'lv'> & { lv?: Predicate['lv'] };

const LIST: P[] = [
  // ----- repas, nourriture
  { id: 'eat_food', v: 'eat', obj: { cats: ['count_food'], dets: ['a', 'the'] }, fv: 'manger', k: 'act' },
  { id: 'eat_unc', v: 'eat', obj: { cats: ['unc_food'], dets: ['a'] }, fv: 'manger', k: 'act' },
  { id: 'drink', v: 'drink', obj: { cats: ['drink'], dets: ['a'] }, fv: 'boire', k: 'act' },
  { id: 'cook_dish', v: 'make', obj: { cats: ['dish'], dets: ['a'] }, fv: 'préparer', k: 'act' },
  { id: 'have_breakfast', v: 'have', tail: 'breakfast', fv: 'prendre', ftail: 'le petit-déjeuner', k: 'act' },
  { id: 'have_lunch', v: 'have', tail: 'lunch', fv: 'déjeuner', k: 'act' },
  { id: 'have_dinner', v: 'have', tail: 'dinner', fv: 'dîner', k: 'act' },
  { id: 'cook_dinner', v: 'cook', tail: 'dinner', fv: 'préparer', ftail: 'le dîner', k: 'act' },
  { id: 'buy_food', v: 'buy', obj: { cats: ['food'], dets: ['a'] }, fv: 'acheter', k: 'evt', hab: true },
  { id: 'order_dish', v: 'order', obj: { cats: ['dish'], dets: ['a'] }, fv: 'commander', k: 'evt', hab: true },
  // ----- lecture, écriture, écrans
  { id: 'read', v: 'read', obj: { cats: ['reading'], dets: ['a', 'the'] }, fv: 'lire', k: 'act' },
  { id: 'write', v: 'write', obj: { cats: ['writing'], dets: ['a'] }, fv: 'écrire', k: 'act' },
  { id: 'watch', v: 'watch', obj: { cats: ['watch'], dets: ['a', 'the'] }, fv: 'regarder', k: 'act' },
  { id: 'watch_tv', v: 'watch', tail: 'TV', fv: 'regarder', ftail: 'la télé', k: 'act' },
  { id: 'listen_radio', v: 'listen', prt: 'to', tail: 'the radio', fv: 'écouter', ftail: 'la radio', k: 'act' },
  { id: 'listen_podcast', v: 'listen', prt: 'to', obj: { nouns: ['podcast', 'song'], dets: ['a'] }, fv: 'écouter', k: 'act' },
  { id: 'listen_music_bare', v: 'listen', prt: 'to', tail: 'music', fv: 'écouter', ftail: '~de la musique', k: 'act' },
  { id: 'check_emails', v: 'check', tail: '{poss} emails', fv: 'consulter', ftail: '{poss:pl} e-mails', k: 'act' },
  { id: 'play_video_games', v: 'play', tail: 'video games', fv: 'jouer', ftail: 'aux jeux vidéo', k: 'act' },
  // ----- sport, musique, loisirs
  { id: 'play_sport', v: 'play', obj: { cats: ['sport'], dets: ['none'] }, fv: 'jouer', fprep: 'à', fdet: { none: 'def' }, k: 'act', dur: true },
  { id: 'play_instrument', v: 'play', obj: { cats: ['instrument'], dets: ['the'] }, fv: 'jouer', fprep: 'de', k: 'act', dur: true, skill: true },
  { id: 'play_game', v: 'play', obj: { nouns: ['chess', 'cards', 'board_games'], dets: ['none'] }, fv: 'jouer', fprep: 'à', fdet: { none: 'def' }, k: 'act' },
  { id: 'go_swimming', v: 'go', tail: 'swimming', fv: 'aller', ftail: 'nager', k: 'act' },
  { id: 'go_running', v: 'go', tail: 'running', fv: 'aller', ftail: 'courir', k: 'act' },
  { id: 'go_shopping', v: 'go', tail: 'shopping', fv: 'faire', ftail: '~du shopping', k: 'act' },
  { id: 'go_cycling', v: 'go', tail: 'cycling', fv: 'faire', ftail: '~du vélo', k: 'act' },
  { id: 'go_skiing', v: 'go', tail: 'skiing', fv: 'faire', ftail: '~du ski', k: 'act' },
  { id: 'do_yoga', v: 'do', tail: 'yoga', fv: 'faire', ftail: '~du yoga', k: 'act', dur: true },
  { id: 'do_exercise', v: 'do', tail: '{some} exercise', fv: 'faire', ftail: '~de l\'exercice', k: 'act' },
  { id: 'ride_bike', v: 'ride', tail: '{poss} bike', fv: 'faire', ftail: '~du vélo', k: 'act' },
  { id: 'take_photos', v: 'take', tail: 'photos', fv: 'prendre', ftail: '~des photos', k: 'act' },
  { id: 'dance', v: 'dance', fv: 'danser', k: 'act', skill: true },
  { id: 'sing', v: 'sing', fv: 'chanter', k: 'act', skill: true },
  { id: 'swim', v: 'swim', fv: 'nager', k: 'act', skill: true },
  { id: 'run_park', v: 'run', tail: 'in the park', fv: 'courir', ftail: 'dans le parc', k: 'act' },
  { id: 'walk_dog', v: 'walk', tail: 'the dog', fv: 'promener', ftail: 'le chien', k: 'act' },
  { id: 'paint_pictures', v: 'paint', tail: 'pictures', fv: 'peindre', ftail: '~des tableaux', k: 'act', lv: 'B1' },
  // ----- études, travail
  { id: 'study_subject', v: 'study', obj: { cats: ['subject'], dets: ['none'] }, fv: 'étudier', fdet: { none: 'def' }, k: 'act', dur: true },
  { id: 'learn_language', v: 'learn', obj: { cats: ['language'], dets: ['none'] }, fv: 'apprendre', fdet: { none: 'def' }, k: 'act' },
  { id: 'speak_language', v: 'speak', obj: { cats: ['language'], dets: ['none'] }, fv: 'parler', fdet: { none: 'none' }, k: 'state', skill: true },
  { id: 'teach_subject', v: 'teach', obj: { cats: ['subject'], dets: ['none'] }, fv: 'enseigner', fdet: { none: 'def' }, k: 'act', dur: true, adult: true },
  { id: 'do_homework', v: 'do', tail: '{poss} homework', fv: 'faire', ftail: '{poss:pl} devoirs', k: 'act' },
  { id: 'work_office', v: 'work', tail: 'in an office', fv: 'travailler', ftail: 'dans un bureau', k: 'act', dur: true, adult: true },
  { id: 'work_hospital', v: 'work', tail: 'in a hospital', fv: 'travailler', ftail: 'dans un hôpital', k: 'act', dur: true, adult: true },
  { id: 'work_home', v: 'work', tail: 'from home', fv: 'travailler', ftail: 'à domicile', k: 'act', dur: true, adult: true },
  { id: 'work_late', v: 'work', tail: 'late', fv: 'travailler', ftail: 'tard', k: 'act', adult: true },
  { id: 'start_work', v: 'start', tail: 'work', fv: 'commencer', ftail: 'le travail', k: 'evt', hab: true, adult: true },
  { id: 'finish_work', v: 'finish', tail: 'work', fv: 'finir', ftail: 'le travail', k: 'evt', hab: true, adult: true },
  { id: 'write_report', v: 'write', tail: 'a report', fv: 'écrire', ftail: '~un rapport', k: 'act', adult: true, lv: 'B1' },
  { id: 'have_meeting', v: 'have', tail: 'a meeting', fv: 'avoir', ftail: '~une réunion', k: 'evt', hab: true, prog: true, adult: true, lv: 'B1' },
  { id: 'pass_exam', v: 'pass', tail: '{poss} exam', fv: 'réussir', ftail: '{poss:m} examen', k: 'evt' },
  { id: 'revise_exam', v: 'study', tail: 'for {poss} exam', fv: 'réviser', ftail: 'pour {poss:m} examen', k: 'act' },
  // ----- déplacements
  { id: 'go_place', v: 'go', prt: 'to', obj: { cats: ['place'], dets: ['the'] }, fv: 'aller', fprep: 'à', k: 'act', ppBeen: true },
  { id: 'go_school', v: 'go', tail: 'to school', fv: 'aller', ftail: 'à l\'école', k: 'act' },
  { id: 'go_work', v: 'go', tail: 'to work', fv: 'aller', ftail: 'au travail', k: 'act', adult: true },
  { id: 'go_bed_early', v: 'go', tail: 'to bed early', fv: 'coucher', fpron: true, ftail: 'tôt', k: 'act' },
  { id: 'go_home', v: 'go', tail: 'home', fv: 'rentrer', ftail: 'à la maison', k: 'act' },
  { id: 'go_country', v: 'go', prt: 'to', obj: { cats: ['country'], dets: ['none'] }, fv: 'aller', fdet: { none: 'none' }, floc: true, k: 'act', ppBeen: true },
  { id: 'go_city', v: 'go', prt: 'to', obj: { cats: ['city'], dets: ['none'] }, fv: 'aller', fdet: { none: 'none' }, floc: true, k: 'act', ppBeen: true },
  { id: 'visit_city', v: 'visit', obj: { cats: ['city'], dets: ['none'] }, fv: 'visiter', fdet: { none: 'none' }, k: 'evt' },
  { id: 'visit_museum', v: 'visit', obj: { nouns: ['museum', 'zoo', 'church'], dets: ['a', 'the'] }, fv: 'visiter', k: 'evt', hab: true },
  { id: 'visit_family', v: 'visit', obj: { nouns: ['grandparents', 'aunt', 'uncle', 'cousin', 'grandmother', 'grandfather'], dets: ['poss'] }, fv: 'rendre', ftail: 'visite', ftailFirst: true, fprep: 'à', k: 'evt', hab: true },
  { id: 'take_transport', v: 'take', obj: { nouns: ['bus', 'train', 'metro', 'tram'], dets: ['the'] }, fv: 'prendre', k: 'act' },
  { id: 'take_taxi', v: 'take', tail: 'a taxi', fv: 'prendre', ftail: '~un taxi', k: 'evt', hab: true },
  { id: 'drive_work', v: 'drive', tail: 'to work', fv: 'aller', ftail: 'au travail en voiture', k: 'act', adult: true },
  { id: 'walk_school', v: 'walk', tail: 'to school', fv: 'aller', ftail: 'à l\'école à pied', k: 'act' },
  { id: 'travel_train', v: 'travel', tail: 'by train', fv: 'voyager', ftail: 'en train', k: 'act' },
  { id: 'arrive_late', v: 'arrive', tail: 'late', fv: 'arriver', ftail: 'en retard', k: 'evt', hab: true },
  { id: 'leave_home', v: 'leave', tail: 'home early', fv: 'partir', ftail: 'tôt de la maison', k: 'evt', hab: true },
  { id: 'live_city', v: 'live', prt: 'in', obj: { cats: ['city'], dets: ['none'] }, fv: 'habiter', fdet: { none: 'none' }, floc: true, k: 'state', dur: true, prog: true },
  { id: 'live_country', v: 'live', prt: 'in', obj: { cats: ['country'], dets: ['none'] }, fv: 'habiter', fdet: { none: 'none' }, floc: true, k: 'state', dur: true, prog: true },
  { id: 'stay_home', v: 'stay', tail: 'at home', fv: 'rester', ftail: 'à la maison', k: 'act' },
  { id: 'stay_hotel', v: 'stay', tail: 'in a hotel', fv: 'loger', ftail: 'à l\'hôtel', k: 'act' },
  { id: 'fly_country', v: 'fly', prt: 'to', obj: { cats: ['country'], dets: ['none'] }, fv: 'partir', fdet: { none: 'none' }, floc: true, ftail: 'en avion', k: 'evt', lv: 'B1' },
  // ----- maison, tâches
  { id: 'clean_room', v: 'clean', obj: { cats: ['room'], dets: ['the'] }, fv: 'nettoyer', k: 'act' },
  { id: 'tidy_room', v: 'tidy', tail: '{poss} room', fv: 'ranger', ftail: '{poss:f} chambre', k: 'act' },
  { id: 'do_shopping', v: 'do', tail: 'the shopping', fv: 'faire', ftail: 'les courses', k: 'act' },
  { id: 'do_housework', v: 'do', tail: 'the housework', fv: 'faire', ftail: 'le ménage', k: 'act' },
  { id: 'do_washing_up', v: 'do', tail: 'the washing-up', fv: 'faire', ftail: 'la vaisselle', k: 'act' },
  { id: 'wash_car', v: 'wash', tail: 'the car', fv: 'laver', ftail: 'la voiture', k: 'act' },
  { id: 'water_plants', v: 'water', tail: 'the plants', fv: 'arroser', ftail: 'les plantes', k: 'act' },
  { id: 'repair_thing', v: 'repair', obj: { nouns: ['bike', 'car', 'computer', 'washing_machine', 'printer'], dets: ['poss', 'the'] }, fv: 'réparer', k: 'act' },
  { id: 'paint_room', v: 'paint', obj: { nouns: ['kitchen', 'bedroom', 'bathroom', 'living_room'], dets: ['the'] }, fv: 'peindre', k: 'act', hab: false, lv: 'B1' },
  { id: 'open_window', v: 'open', obj: { nouns: ['window', 'door'], dets: ['the'] }, fv: 'ouvrir', k: 'evt' },
  { id: 'close_window', v: 'close', obj: { nouns: ['window', 'door'], dets: ['the'] }, fv: 'fermer', k: 'evt' },
  // ----- objets, achats
  { id: 'lose_item', v: 'lose', obj: { cats: ['smallitem'], dets: ['poss'] }, fv: 'perdre', k: 'evt' },
  { id: 'find_item', v: 'find', obj: { cats: ['smallitem'], dets: ['poss'] }, fv: 'trouver', k: 'evt' },
  { id: 'forget_item', v: 'forget', obj: { nouns: ['umbrella', 'key', 'passport', 'ticket', 'password', 'wallet'], dets: ['poss'] }, fv: 'oublier', k: 'evt' },
  { id: 'look_for_item', v: 'look', prt: 'for', obj: { cats: ['smallitem'], dets: ['poss'] }, fv: 'chercher', k: 'act' },
  { id: 'buy_thing', v: 'buy', obj: { cats: ['buyable'], dets: ['a'] }, fv: 'acheter', k: 'evt' },
  { id: 'sell_thing', v: 'sell', obj: { nouns: ['car', 'bike', 'house', 'motorbike', 'laptop'], dets: ['poss'] }, fv: 'vendre', k: 'evt', adult: true },
  { id: 'break_thing', v: 'break', obj: { nouns: ['window', 'phone', 'glasses', 'camera', 'lamp'], dets: ['the', 'poss'] }, fv: 'casser', k: 'evt' },
  { id: 'charge_phone', v: 'charge', tail: '{poss} phone', fv: 'recharger', ftail: '{poss:m} téléphone', k: 'act' },
  { id: 'download_app', v: 'download', tail: 'a new app', fv: 'télécharger', ftail: '~une nouvelle application', k: 'evt' },
  { id: 'use_laptop', v: 'use', obj: { nouns: ['laptop', 'computer', 'tablet', 'phone'], dets: ['poss'] }, fv: 'utiliser', k: 'act' },
  { id: 'rent_flat', v: 'rent', tail: 'a flat', fv: 'louer', ftail: 'un appartement', k: 'evt', adult: true, lv: 'B1' },
  { id: 'book_table', v: 'book', tail: 'a table', fv: 'réserver', ftail: 'une table', k: 'evt', lv: 'B1' },
  { id: 'pay_bill', v: 'pay', tail: 'the bill', fv: 'payer', ftail: "l'addition", k: 'evt' },
  { id: 'send_message', v: 'send', obj: { nouns: ['message', 'email', 'postcard', 'letter'], dets: ['a'] }, fv: 'envoyer', k: 'evt', hab: true },
  { id: 'wear_clothes', v: 'wear', obj: { nouns: ['jacket', 'coat', 'hat', 'scarf', 'dress', 't_shirt', 'jumper'], dets: ['a'] }, fv: 'porter', k: 'act' },
  { id: 'wear_glasses', v: 'wear', tail: 'glasses', fv: 'porter', ftail: '~des lunettes', k: 'state', dur: true },
  // ----- relations
  { id: 'call_person', v: 'call', obj: { nouns: ['mother', 'father', 'parents', 'sister', 'brother', 'grandparents', 'aunt', 'uncle', 'cousin', 'grandmother', 'grandfather'], dets: ['poss'] }, fv: 'appeler', k: 'act' },
  { id: 'help_person', v: 'help', obj: { nouns: ['mother', 'father', 'brother', 'sister', 'friend', 'neighbour', 'colleague'], dets: ['poss'] }, fv: 'aider', k: 'act' },
  { id: 'meet_friends', v: 'meet', tail: '{poss} friends', fv: 'retrouver', ftail: '{poss:pl} amis', k: 'act' },
  { id: 'wait_for_bus', v: 'wait', prt: 'for', obj: { nouns: ['bus', 'train', 'taxi'], dets: ['the'] }, fv: 'attendre', k: 'act' },
  { id: 'wait_for_person', v: 'wait', prt: 'for', obj: { nouns: ['friend', 'brother', 'sister', 'mother', 'father'], dets: ['poss'] }, fv: 'attendre', k: 'act' },
  { id: 'chat_friends', v: 'chat', tail: 'with {poss} friends', fv: 'discuter', ftail: 'avec {poss:pl} amis', k: 'act' },
  { id: 'invite_friends', v: 'invite', tail: '{poss} friends to dinner', fv: 'inviter', ftail: '{poss:pl} amis à dîner', k: 'evt', hab: true, lv: 'B1' },
  // ----- routine (pronominaux en français)
  { id: 'get_up', v: 'get', prt: 'up', tail: 'early', fv: 'lever', fpron: true, ftail: 'tôt', k: 'evt', hab: true },
  { id: 'wake_up', v: 'wake', prt: 'up', tail: 'early', fv: 'réveiller', fpron: true, ftail: 'tôt', k: 'evt', hab: true },
  { id: 'have_shower', v: 'have', tail: 'a shower', fv: 'doucher', fpron: true, k: 'act' },
  { id: 'get_dressed', v: 'get', tail: 'dressed', fv: 'habiller', fpron: true, k: 'act' },
  { id: 'rest', v: 'rest', fv: 'reposer', fpron: true, k: 'act' },
  { id: 'sleep_well', v: 'sleep', tail: 'well', fv: 'dormir', ftail: 'bien', k: 'act' },
  { id: 'relax_sofa', v: 'relax', tail: 'on the sofa', fv: 'détendre', fpron: true, ftail: 'sur le canapé', k: 'act' },
  { id: 'brush_teeth', v: 'brush', tail: '{poss} teeth', fv: 'brosser', fpron: true, ftail: 'les dents', k: 'act' },
  { id: 'hurry', v: 'hurry', fv: 'dépêcher', fpron: true, k: 'act' },
  // ----- routine avec heure précise (« at seven o'clock »)
  { id: 'get_up_t', v: 'get', prt: 'up', fv: 'lever', fpron: true, k: 'evt', hab: true, routine: true },
  { id: 'wake_up_t', v: 'wake', prt: 'up', fv: 'réveiller', fpron: true, k: 'evt', hab: true, routine: true },
  { id: 'go_bed_t', v: 'go', tail: 'to bed', fv: 'coucher', fpron: true, k: 'evt', hab: true, routine: true },
  { id: 'leave_home_t', v: 'leave', tail: 'home', fv: 'partir', ftail: 'de la maison', k: 'evt', hab: true, routine: true },
  { id: 'have_breakfast_t', v: 'have', tail: 'breakfast', fv: 'prendre', ftail: 'le petit-déjeuner', k: 'evt', hab: true, routine: true },
  { id: 'have_lunch_t', v: 'have', tail: 'lunch', fv: 'déjeuner', k: 'evt', hab: true, routine: true },
  { id: 'have_dinner_t', v: 'have', tail: 'dinner', fv: 'dîner', k: 'evt', hab: true, routine: true },
  { id: 'start_work_t', v: 'start', tail: 'work', fv: 'commencer', ftail: 'le travail', k: 'evt', hab: true, routine: true, adult: true },
  { id: 'finish_work_t', v: 'finish', tail: 'work', fv: 'finir', ftail: 'le travail', k: 'evt', hab: true, routine: true, adult: true },
  { id: 'arrive_work_t', v: 'arrive', tail: 'at work', fv: 'arriver', ftail: 'au travail', k: 'evt', hab: true, routine: true, adult: true },
  { id: 'get_home_t', v: 'get', tail: 'home', fv: 'rentrer', ftail: 'à la maison', k: 'evt', hab: true, routine: true },
  // ----- états (pas de forme continue)
  { id: 'like_food', v: 'like', obj: { cats: ['food', 'drink'], dets: ['gen'] }, fv: 'aimer', fdet: { gen: 'def' }, k: 'state', hab: false },
  { id: 'love_thing', v: 'love', obj: { cats: ['sport', 'subject', 'food'], dets: ['gen'] }, fv: 'adorer', fdet: { gen: 'def' }, k: 'state' },
  { id: 'hate_thing', v: 'hate', obj: { cats: ['food', 'subject'], dets: ['gen'] }, fv: 'détester', fdet: { gen: 'def' }, k: 'state' },
  { id: 'want_thing', v: 'want', obj: { nouns: ['car', 'bike', 'phone', 'laptop', 'watch', 'dress', 'jacket', 'camera'], dets: ['a'] }, fv: 'vouloir', k: 'state' },
  { id: 'need_thing', v: 'need', obj: { nouns: ['umbrella', 'car', 'laptop', 'charger', 'ticket', 'map', 'pen'], dets: ['a'] }, fv: 'avoir', ftail: 'besoin', ftailFirst: true, fprep: 'de', k: 'state' },
  { id: 'have_car', v: 'have', obj: { nouns: ['car', 'bike', 'motorbike', 'laptop', 'tablet', 'camera'], dets: ['a'] }, fv: 'avoir', k: 'state', dur: true },
  { id: 'have_sibling', v: 'have', obj: { nouns: ['brother', 'sister', 'cousin'], dets: ['a'] }, fv: 'avoir', k: 'state' },
  { id: 'know_city', v: 'know', obj: { cats: ['city'], dets: ['none'] }, tail: 'well', fv: 'connaître', fdet: { none: 'none' }, ftail: 'bien', k: 'state' },
  { id: 'understand_question', v: 'understand', tail: 'the question', fv: 'comprendre', ftail: 'la question', k: 'state' },
  { id: 'remember_name', v: 'remember', tail: 'her name', fv: 'souvenir', fpron: true, ftail: 'de son nom', k: 'state' },
  { id: 'prefer_tea', v: 'prefer', tail: 'tea to coffee', fv: 'préférer', ftail: 'le thé au café', k: 'state' },
  // ----- prédicats utiles aux conditionnels, connecteurs et conseils
  { id: 'have_time', v: 'have', tail: 'time', fv: 'avoir', ftail: 'le temps', k: 'state' },
  { id: 'have_money', v: 'have', tail: 'enough money', fv: 'avoir', ftail: "assez d'argent", k: 'state' },
  { id: 'miss_bus', v: 'miss', tail: 'the bus', fv: 'rater', ftail: 'le bus', k: 'evt' },
  { id: 'win_lottery', v: 'win', tail: 'the lottery', fv: 'gagner', ftail: 'au loto', k: 'evt', adult: true },
  { id: 'travel_world', v: 'travel', tail: 'around the world', fv: 'faire', ftail: 'le tour du monde', k: 'act', hab: false, prog: false },
  { id: 'drink_coffee_evening', v: 'drink', tail: 'coffee in the evening', fv: 'boire', ftail: '~du café le soir', k: 'act' },
  { id: 'eat_too_much', v: 'eat', tail: 'too much', fv: 'manger', ftail: 'trop', k: 'act' },
  { id: 'feel_sick', v: 'feel', tail: 'sick', fv: 'avoir', ftail: 'mal au cœur', k: 'state' },
  { id: 'have_exam', v: 'have', tail: 'an exam', fv: 'avoir', ftail: '~un examen', k: 'evt', hab: true },
  { id: 'get_wet', v: 'get', tail: 'wet', fv: 'être', ftail: '{agr:trempé|trempée}', k: 'state' },
  { id: 'put_on_jumper', v: 'put', prt: 'on', tail: 'a jumper', fv: 'mettre', ftail: '~un pull', k: 'evt' },
  { id: 'study_hard', v: 'study', tail: 'hard', fv: 'travailler', ftail: 'dur', k: 'act' },
  { id: 'arrive', v: 'arrive', fv: 'arriver', k: 'evt' },
  { id: 'drive', v: 'drive', fv: 'conduire', k: 'act', skill: true, prog: false },
  { id: 'take_umbrella', v: 'take', tail: '{poss} umbrella', fv: 'prendre', ftail: '{poss:m} parapluie', k: 'evt' },
  { id: 'go_cinema', v: 'go', tail: 'to the cinema', fv: 'aller', ftail: 'au cinéma', k: 'act' },
  { id: 'eat_vegetables', v: 'eat', tail: 'more vegetables', fv: 'manger', ftail: 'plus de légumes', k: 'act' },
  { id: 'see_doctor', v: 'see', tail: 'a doctor', fv: 'aller', ftail: 'voir un médecin', k: 'evt' },
  { id: 'drink_water', v: 'drink', tail: 'more water', fv: 'boire', ftail: "plus d'eau", k: 'act' },
  { id: 'join_club', v: 'join', tail: 'a club', fv: 'inscrire', fpron: true, ftail: 'dans un club', k: 'evt', lv: 'B1' },
  { id: 'be_rich', v: 'be', tail: 'rich', fv: 'être', ftail: '{agr:riche|riche}', k: 'state', be: true },
  // ----- « be » + attribut (accord en français, avoir faim…)
  { id: 'be_tired', v: 'be', tail: 'tired', fv: 'être', ftail: '{agr:fatigué|fatiguée}', k: 'state', be: true },
  { id: 'be_late', v: 'be', tail: 'late', fv: 'être', ftail: 'en retard', k: 'state', be: true },
  { id: 'be_hungry', v: 'be', tail: 'hungry', fv: 'avoir', ftail: 'faim', k: 'state', be: true },
  { id: 'be_thirsty', v: 'be', tail: 'thirsty', fv: 'avoir', ftail: 'soif', k: 'state', be: true },
  { id: 'be_cold', v: 'be', tail: 'cold', fv: 'avoir', ftail: 'froid', k: 'state', be: true },
  { id: 'be_afraid_dogs', v: 'be', tail: 'afraid of dogs', fv: 'avoir', ftail: 'peur des chiens', k: 'state', be: true, dur: true },
  { id: 'be_right', v: 'be', tail: 'right', fv: 'avoir', ftail: 'raison', k: 'state', be: true },
  { id: 'be_home', v: 'be', tail: 'at home', fv: 'être', ftail: 'à la maison', k: 'state', be: true },
  { id: 'be_work', v: 'be', tail: 'at work', fv: 'être', ftail: 'au travail', k: 'state', be: true, adult: true },
  { id: 'be_busy', v: 'be', tail: 'busy', fv: 'être', ftail: '{agr:occupé|occupée}', k: 'state', be: true },
  { id: 'be_ready', v: 'be', tail: 'ready', fv: 'être', ftail: '{agr:prêt|prête}', k: 'state', be: true },
  { id: 'be_ill', v: 'be', tail: 'ill', fv: 'être', ftail: '{agr:malade|malade}', k: 'state', be: true },
  { id: 'be_happy', v: 'be', tail: 'happy', fv: 'être', ftail: '{agr:heureux|heureuse}', k: 'state', be: true },
  { id: 'be_holiday', v: 'be', tail: 'on holiday', fv: 'être', ftail: 'en vacances', k: 'state', be: true },
  { id: 'be_married', v: 'be', tail: 'married', fv: 'être', ftail: '{agr:marié|mariée}', k: 'state', be: true, dur: true, adult: true, lv: 'B1' },
  { id: 'be_interested_art', v: 'be', tail: 'interested in art', fv: 'intéresser', fpron: true, ftail: "à l'art", k: 'state', be: true, lv: 'B1' },
  { id: 'be_bored', v: 'be', tail: 'bored', fv: 'ennuyer', fpron: true, k: 'state', be: true, lv: 'B1' },
];

export const PREDICATES: Predicate[] = LIST.map((p) => ({ lv: 'A2', ...p }));

export const PREDICATE_BY_ID: Record<string, Predicate> = Object.fromEntries(PREDICATES.map((p) => [p.id, p]));

export function predicate(id: string): Predicate {
  const p = PREDICATE_BY_ID[id];
  if (!p) throw new Error(`Prédicat inconnu : ${id}`);
  return p;
}

/** Peut-on employer ce prédicat pour une habitude (présent simple + fréquence) ? */
export function allowsHabit(p: Predicate): boolean {
  if (p.hab !== undefined) return p.hab;
  return p.k === 'act';
}

/**
 * Échelle temporelle naturelle d'un prédicat : une action quotidienne se situe
 * « hier » ou « demain », un voyage « l'été dernier », un apprentissage
 * « l'année dernière ». Cela évite « I went to bed last month ».
 */
export type TimeScale = 'day' | 'trip' | 'long' | 'any';

const DAY_SCALE = new Set([
  'have_breakfast', 'have_lunch', 'have_dinner', 'cook_dinner', 'have_shower', 'get_dressed', 'brush_teeth', 'get_up', 'wake_up',
  'go_bed_early', 'leave_home', 'arrive_late', 'go_home', 'do_washing_up', 'check_emails', 'charge_phone', 'walk_dog',
  'water_plants', 'take_umbrella', 'open_window', 'close_window', 'do_homework', 'tidy_room', 'finish_work', 'start_work',
  'go_work', 'go_school', 'walk_school', 'drive_work', 'rest', 'relax_sofa', 'sleep_well', 'hurry', 'listen_radio', 'watch_tv',
  'be_home', 'be_work', 'be_late', 'be_tired', 'be_hungry', 'be_thirsty', 'be_cold', 'take_transport', 'wait_for_bus',
  'wait_for_person', 'pay_bill', 'have_meeting', 'look_for_item', 'put_on_jumper', 'eat_too_much', 'drink_coffee_evening',
  'do_shopping', 'do_housework', 'wash_car', 'clean_room', 'meet_friends', 'chat_friends', 'call_person', 'help_person',
  'listen_music_bare', 'listen_podcast', 'read', 'write', 'watch', 'eat_food', 'eat_unc', 'drink', 'cook_dish', 'order_dish',
  'buy_food', 'go_running', 'go_swimming', 'go_cycling', 'run_park', 'take_taxi', 'miss_bus', 'go_cinema', 'see_doctor',
  'study_hard', 'revise_exam', 'arrive', 'take_photos', 'send_message', 'feel_sick', 'be_busy', 'be_ready', 'get_wet',
  'use_laptop', 'download_app', 'drink_water', 'eat_vegetables', 'go_shopping', 'play_video_games', 'do_exercise', 'do_yoga',
  'ride_bike', 'book_table', 'forget_item', 'have_time', 'have_exam',
]);
const TRIP_SCALE = new Set(['visit_city', 'go_city', 'go_country', 'fly_country', 'stay_hotel', 'travel_train', 'visit_museum', 'go_skiing', 'be_holiday', 'go_place']);
const LONG_SCALE = new Set([
  'learn_language', 'study_subject', 'teach_subject', 'live_city', 'live_country', 'work_office', 'work_hospital', 'work_home',
  'have_car', 'be_married', 'wear_glasses', 'rent_flat', 'travel_world', 'play_instrument', 'paint_room', 'speak_language',
  'be_afraid_dogs', 'be_interested_art', 'know_city',
]);

export function timeScale(p: Predicate): TimeScale {
  if (p.routine || DAY_SCALE.has(p.id)) return 'day';
  if (TRIP_SCALE.has(p.id)) return 'trip';
  if (LONG_SCALE.has(p.id)) return 'long';
  return 'any';
}

const PAST_BY_SCALE: Record<TimeScale, string[] | null> = {
  day: ['yesterday', 'last_night', 'yesterday_morning', 'day_before_yesterday'],
  trip: ['last_summer', 'last_year', 'last_month', 'three_years_ago', 'in_2019', 'last_week', 'week_ago', 'last_weekend'],
  long: ['last_year', 'three_years_ago', 'in_2019', 'last_summer'],
  any: null,
};

const FUTURE_BY_SCALE: Record<TimeScale, string[] | null> = {
  day: ['tomorrow', 'tonight', 'tomorrow_morning', 'day_after_tomorrow'],
  trip: ['next_summer', 'next_year', 'next_month', 'next_week', 'next_weekend', 'in_two_weeks'],
  long: ['next_year', 'next_summer', 'next_month'],
  any: null,
};

const EVENING_ONLY = new Set(['have_dinner', 'cook_dinner', 'have_dinner_t', 'go_bed_early', 'go_bed_t', 'drink_coffee_evening']);
const MORNING_ONLY = new Set(['have_breakfast', 'have_breakfast_t', 'get_up', 'get_up_t', 'wake_up', 'wake_up_t']);

/** L'expression de temps (id) est-elle naturelle avec ce prédicat ? */
export function timeFits(p: Predicate, timeId: string | undefined, cls: 'past' | 'future'): boolean {
  if (!timeId) return true;
  const allowed = (cls === 'past' ? PAST_BY_SCALE : FUTURE_BY_SCALE)[timeScale(p)];
  if (allowed && !allowed.includes(timeId)) return false;
  if (EVENING_ONLY.has(p.id) && /morning/.test(timeId)) return false;
  if (MORNING_ONLY.has(p.id) && /(night|tonight|evening)/.test(timeId)) return false;
  return true;
}

/** États compatibles avec le futur (I'll be busy, you'll need an umbrella). */
export const FUTURE_STATES = new Set(['be_busy', 'be_home', 'be_work', 'be_late', 'be_ready', 'be_holiday', 'be_tired', 'have_time', 'need_thing', 'have_exam', 'be_hungry']);

/** Prédicats « nus » (sans complément), réservés aux emplois habituels ou modaux. */
export const BARE_SKILLS = new Set(['drive', 'swim', 'sing', 'dance']);

/**
 * Prédicats très spécifiques, réservés aux générateurs qui les citent
 * explicitement (conseils, conditionnels, connecteurs).
 */
export const NARROW = new Set([
  'eat_vegetables', 'drink_water', 'eat_too_much', 'feel_sick', 'get_wet', 'have_money', 'win_lottery', 'travel_world',
  'be_rich', 'study_hard', 'have_time', 'miss_bus', 'join_club', 'have_exam', 'take_umbrella', 'put_on_jumper', 'see_doctor',
  'drink_coffee_evening', 'arrive',
]);

/** Événements accidentels : pas de projets ni de prédictions (✗ I'm going to lose my keys). */
export const ACCIDENTS = new Set(['lose_item', 'forget_item', 'break_thing', 'find_item', 'miss_bus', 'get_wet']);

/** Peut-on employer ce prédicat à la forme continue ? */
export function allowsProgressive(p: Predicate): boolean {
  if (p.prog !== undefined) return p.prog;
  return p.k === 'act';
}

/** Peut-on employer ce prédicat avec for/since (durée) ? */
export function allowsDuration(p: Predicate): boolean {
  return !!p.dur;
}

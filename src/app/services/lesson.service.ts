import { Injectable } from '@angular/core';

export type BaseLanguage = 'amharic' | 'oromo' | 'tigrigna' | 'spanish' | 'english';
export type CourseId = 'spanish' | 'english' | 'oromo' | 'amharic' | 'tigrigna';

/** Voice locale used for text-to-speech pronunciation of each course:
 *  Latin American Spanish accent for Spanish, North American English for English,
 *  Ethiopian locales for Afaan Oromo, Amharic, and Tigrinya (used when learners cross-translate
 *  between local languages). Browser support for am-ET/om-ET/ti-ET voices varies,
 *  but AudioService.speak() already falls back gracefully when a voice is unavailable. */
export function voiceLangFor(courseId: CourseId): string {
  switch (courseId) {
    case 'spanish': return 'es-MX';
    case 'english': return 'en-US';
    case 'oromo': return 'om-ET';
    case 'amharic': return 'am-ET';
    case 'tigrigna': return 'ti-ET';
  }
}

/** Whether spoken pronunciation should play for a given target course.
 *  Speech is enabled only for Spanish and English. It is off for Amharic,
 *  Afaan Oromo and Tigrinya, so those words are never read aloud. */
export function hasVoice(courseId: CourseId): boolean {
  return courseId === 'spanish' || courseId === 'english';
}

export interface WordPair {
  amharic: string;   // Amharic gloss (with transliteration + meaning)
  oromo: string;      // Afaan Oromo gloss (with transliteration + meaning)
  tigrinya: string;   // Tigrinya gloss (with transliteration + meaning)
  spanish: string;    // Spanish translation
  english: string;    // English translation
}

export interface Question {
  prompt: string;
  sourcePhrase: string;
  answer: string;
  options: string[];
  explanation: string;
}

export interface Unit {
  id: string;
  title: string;
  amharicTitle: string;
  oromoTitle: string;
  tigrinyaTitle: string;
  spanishTitle: string;
  icon: string;
  words: WordPair[];
}

export interface Course {
  id: CourseId;
  name: string;
  amharicName: string;
  oromoName: string;
  tigrinyaName: string;
  spanishName: string;
  flag: 'spain' | 'usa' | 'ethiopia' | 'oromia' | 'tigray';
  color: string;
  units: Unit[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

@Injectable({ providedIn: 'root' })
export class LessonService {

  private unitDefs: { title: string; amharicTitle: string; oromoTitle: string; tigrinyaTitle: string; spanishTitle: string; icon: string }[] = [
    { title: 'Greetings', amharicTitle: 'ሰላምታ', oromoTitle: 'Nagaa Gaafachuu', tigrinyaTitle: 'ሰላምታ (selamta)', spanishTitle: 'Saludos', icon: '👋' },
    { title: 'Food & Drink', amharicTitle: 'ምግብና መጠጥ', oromoTitle: 'Nyaataa fi Dhugaatii', tigrinyaTitle: 'ብልዕን መስተን (bil\'ini mesteni)', spanishTitle: 'Comida y Bebida', icon: '🍎' },
    { title: 'Family', amharicTitle: 'ቤተሰብ', oromoTitle: 'Maatii', tigrinyaTitle: 'ስድራቤት (sidra-bet)', spanishTitle: 'Familia', icon: '👨‍👩‍👧' },
    { title: 'Numbers', amharicTitle: 'ቁጥሮች', oromoTitle: 'Lakkoofsa', tigrinyaTitle: 'ቁጽርታት (qutsritat)', spanishTitle: 'Números', icon: '🔢' },
    { title: 'Colors', amharicTitle: 'ቀለማት', oromoTitle: 'Halluuwwan', tigrinyaTitle: 'ሕብርታት (hibritat)', spanishTitle: 'Colores', icon: '🎨' },
    { title: 'Animals', amharicTitle: 'እንስሳት', oromoTitle: 'Bineensota', tigrinyaTitle: 'እንስሳታት (ensisatat)', spanishTitle: 'Animales', icon: '🐾' },
    { title: 'Body', amharicTitle: 'የሰውነት ክፍሎች', oromoTitle: 'Kutaalee Qaamaa', tigrinyaTitle: 'ኣካላት ሰብነት (akalat sebnet)', spanishTitle: 'Cuerpo', icon: '🧍' },
    { title: 'Clothing', amharicTitle: 'ልብስ', oromoTitle: 'Uffata', tigrinyaTitle: 'ክዳውንቲ (kidawinti)', spanishTitle: 'Ropa', icon: '👕' },
    { title: 'Weather', amharicTitle: 'የአየር ሁኔታ', oromoTitle: 'Haala Qilleensaa', tigrinyaTitle: 'ኩነታት ኣየር (kunetat ayer)', spanishTitle: 'Clima', icon: '☀️' },
    { title: 'Time', amharicTitle: 'ጊዜ', oromoTitle: 'Yeroo', tigrinyaTitle: 'ግዜ (gize)', spanishTitle: 'Tiempo', icon: '⏰' },
    { title: 'Travel', amharicTitle: 'ጉዞ', oromoTitle: 'Imala', tigrinyaTitle: 'ጉዕዞ (gu\'izo)', spanishTitle: 'Viajes', icon: '✈️' },
    { title: 'Verbs', amharicTitle: 'ግሶች', oromoTitle: 'Jechoota Gochaa', tigrinyaTitle: 'ግስታት (gistat)', spanishTitle: 'Verbos', icon: '🏃' },
    { title: 'Adjectives', amharicTitle: 'ቅጽሎች', oromoTitle: 'Ibsituu', tigrinyaTitle: 'ቅጽላት (qitslat)', spanishTitle: 'Adjetivos', icon: '✨' },
    { title: 'House', amharicTitle: 'ቤት', oromoTitle: 'Mana', tigrinyaTitle: 'ገዛ (geza)', spanishTitle: 'Casa', icon: '🏠' },
    { title: 'Days of the Week', amharicTitle: 'የሳምንት ቀናት', oromoTitle: 'Guyyoota Torbanii', tigrinyaTitle: 'መዓልትታት ሰሙን (me\'altitat semun)', spanishTitle: 'Días de la Semana', icon: '📅' },
    { title: 'Sports', amharicTitle: 'ስፖርት', oromoTitle: 'Ispoortii', tigrinyaTitle: 'ስፖርት (sport)', spanishTitle: 'Deportes', icon: '🏀' },
    { title: 'Emotions', amharicTitle: 'ስሜቶች', oromoTitle: 'Miira', tigrinyaTitle: 'ስምዒታት (sim\'itat)', spanishTitle: 'Emociones', icon: '😊' },
    { title: 'Shopping', amharicTitle: 'ግዢ', oromoTitle: 'Bittaa', tigrinyaTitle: 'ዕዳጋ (edaga)', spanishTitle: 'Compras', icon: '🛍️' },
    { title: 'School', amharicTitle: 'ትምህርት ቤት', oromoTitle: 'Mana Barumsaa', tigrinyaTitle: 'ቤት ትምህርቲ (bet timhirti)', spanishTitle: 'Escuela', icon: '🏫' },
    { title: 'Technology', amharicTitle: 'ቴክኖሎጂ', oromoTitle: 'Teeknooloojii', tigrinyaTitle: 'ቴክኖሎጂ (teknoloji)', spanishTitle: 'Tecnología', icon: '💻' },
    { title: 'Nature', amharicTitle: 'ተፈጥሮ', oromoTitle: 'Uumama', tigrinyaTitle: 'ተፈጥሮ (tefetro)', spanishTitle: 'Naturaleza', icon: '🌳' },
    { title: 'Kitchen', amharicTitle: 'ወጥ ቤት', oromoTitle: 'Kicheenii', tigrinyaTitle: 'ክሽነ (kishine)', spanishTitle: 'Cocina', icon: '🍳' },
    { title: 'Directions', amharicTitle: 'አቅጣጫዎች', oromoTitle: 'Qajeelfama', tigrinyaTitle: 'ኣንፈታት (anfetat)', spanishTitle: 'Direcciones', icon: '🧭' },
    { title: 'Occupations', amharicTitle: 'ሙያዎች', oromoTitle: 'Ogummaa', tigrinyaTitle: 'ሞያታት (moyatat)', spanishTitle: 'Ocupaciones', icon: '👷' },
    { title: 'Health', amharicTitle: 'ጤና', oromoTitle: 'Fayyaa', tigrinyaTitle: 'ጥዕና (t\'i\'ina)', spanishTitle: 'Salud', icon: '🏥' },
    { title: 'Transportation', amharicTitle: 'መጓጓዣ', oromoTitle: 'Geejjiba', tigrinyaTitle: 'መጓዓዝያ (megua\'azia)', spanishTitle: 'Transporte', icon: '🚌' },
    { title: 'Music & Arts', amharicTitle: 'ሙዚቃና ስነ ጥበብ', oromoTitle: 'Muuziqaa fi Ogbarruu', tigrinyaTitle: 'ሙዚቃን ስነ-ጥበብን (muziqan sine-tibebin)', spanishTitle: 'Música y Arte', icon: '🎵' },
    { title: 'Seasons', amharicTitle: 'ወቅቶች', oromoTitle: 'Waqtiiwwan', tigrinyaTitle: 'ወቅትታት (weqtitat)', spanishTitle: 'Estaciones', icon: '🍂' },
    { title: 'Money & Bank', amharicTitle: 'ገንዘብና ባንክ', oromoTitle: 'Maallaqaa fi Baankii', tigrinyaTitle: 'ገንዘብን ባንክን (genzebin bankin)', spanishTitle: 'Dinero y Banco', icon: '🏦' },
    { title: 'Restaurant', amharicTitle: 'ምግብ ቤት', oromoTitle: 'Mana Nyaataa', tigrinyaTitle: 'ቤት መግቢ (bet megbi)', spanishTitle: 'Restaurante', icon: '🍽️' },
    { title: 'City Life', amharicTitle: 'የከተማ ኑሮ', oromoTitle: 'Jireenya Magaalaa', tigrinyaTitle: 'ናብራ ከተማ (nabra ketema)', spanishTitle: 'Vida en la Ciudad', icon: '🏙️' },
    { title: 'Farm & Agriculture', amharicTitle: 'እርሻ', oromoTitle: 'Qonnaa', tigrinyaTitle: 'ሕርሻ (hirsha)', spanishTitle: 'Granja y Agricultura', icon: '🚜' },
    { title: 'Communication', amharicTitle: 'ግንኙነት', oromoTitle: 'Walitti Dhufeenya', tigrinyaTitle: 'ርክብ (rikib)', spanishTitle: 'Comunicación', icon: '📞' },
    { title: 'Holidays & Celebrations', amharicTitle: 'በዓላት', oromoTitle: 'Ayyaanota', tigrinyaTitle: 'በዓላት (be\'alat)', spanishTitle: 'Fiestas y Celebraciones', icon: '🎉' },
    { title: 'Space', amharicTitle: 'ጠፈር', oromoTitle: 'Samii', tigrinyaTitle: 'ጠፈር (teafer)', spanishTitle: 'Espacio', icon: '🌌' },
    { title: 'Months', amharicTitle: 'ወራት', oromoTitle: "Ji'oota", tigrinyaTitle: 'ኣዋርሕ (awarih)', spanishTitle: 'Meses', icon: '📅' },
    { title: 'Countries', amharicTitle: 'ሀገራት', oromoTitle: 'Biyyoota', tigrinyaTitle: 'ሃገራት (hagerat)', spanishTitle: 'Países', icon: '🌍' },
    { title: 'Hobbies', amharicTitle: 'የትርፍ ጊዜ ማሳለፊያ', oromoTitle: 'Hojii Bashannanaa', tigrinyaTitle: 'መዘናግዒ (mezenagi)', spanishTitle: 'Pasatiempos', icon: '🎨' },
    { title: 'Furniture', amharicTitle: 'የቤት እቃዎች', oromoTitle: 'Miʼa Manaa', tigrinyaTitle: 'ናውቲ ገዛ (nawti geza)', spanishTitle: 'Muebles', icon: '🛋️' },
    { title: 'Insects', amharicTitle: 'ነፍሳት', oromoTitle: 'Ilbiisota', tigrinyaTitle: 'ሳሬት (saret)', spanishTitle: 'Insectos', icon: '🐝' }
  ];

  // One canonical vocabulary table: each concept carries glosses in BOTH
  // possible source languages (Amharic / Afaan Oromo) plus both possible
  // target languages (Spanish / English).
  private vocab: WordPair[][] = [
    [ // Greetings
      { amharic: 'ሰላም (selam) — Hello', oromo: 'Akkam (akkam) — Hello', tigrinya: 'ሰላም (selam) — Hello', spanish: 'Hola', english: 'Hello' },
      { amharic: 'እናመሰግናለን (enameseginalen) — Thank you', oromo: 'Galatoomi (galatoomi) — Thank you', tigrinya: 'የቐንየለይ (yeqeneyeley) — Thank you', spanish: 'Gracias', english: 'Thank you' },
      { amharic: 'አዎ (awo) — Yes', oromo: 'Eeyyee (eeyyee) — Yes', tigrinya: 'እወ (ewe) — Yes', spanish: 'Sí', english: 'Yes' },
      { amharic: 'አይ (ay) — No', oromo: 'Lakki (lakki) — No', tigrinya: 'ኣይፋል (ayfal) — No', spanish: 'No', english: 'No' },
      { amharic: 'ደህና ዋል (dehna wal) — Good morning', oromo: 'Akkam bultan (akkam bultan) — Good morning', tigrinya: 'ደሓን ሓዲርኩም (dehan hadirkum) — Good morning', spanish: 'Buenos días', english: 'Good morning' }
    ],
    [ // Food & Drink
      { amharic: 'ውሃ (wiha) — Water', oromo: 'Bishaan (bishaan) — Water', tigrinya: 'ማይ (may) — Water', spanish: 'Agua', english: 'Water' },
      { amharic: 'ዳቦ (dabo) — Bread', oromo: 'Buddeena (buddeena) — Bread', tigrinya: 'ባኒ (bani) — Bread', spanish: 'Pan', english: 'Bread' },
      { amharic: 'ወተት (wetet) — Milk', oromo: 'Aannan (aannan) — Milk', tigrinya: 'ጸባ (tseba) — Milk', spanish: 'Leche', english: 'Milk' },
      { amharic: 'ፍራፍሬ (frafre) — Fruit', oromo: 'Ija muka (ija muka) — Fruit', tigrinya: 'ፍረ (fire) — Fruit', spanish: 'Fruta', english: 'Fruit' },
      { amharic: 'ቡና (buna) — Coffee', oromo: 'Buna (buna) — Coffee', tigrinya: 'ቡን (bun) — Coffee', spanish: 'Café', english: 'Coffee' }
    ],
    [ // Family
      { amharic: 'እናት (enat) — Mother', oromo: 'Haadha (haadha) — Mother', tigrinya: 'ኣደ (ade) — Mother', spanish: 'Madre', english: 'Mother' },
      { amharic: 'አባት (abat) — Father', oromo: 'Abbaa (abbaa) — Father', tigrinya: 'ኣቦ (abo) — Father', spanish: 'Padre', english: 'Father' },
      { amharic: 'ወንድም (wendim) — Brother', oromo: 'Obboleessa (obboleessa) — Brother', tigrinya: 'ሓው (haw) — Brother', spanish: 'Hermano', english: 'Brother' },
      { amharic: 'እህት (ehit) — Sister', oromo: 'Obboleettii (obboleettii) — Sister', tigrinya: 'ሓፍቲ (hafti) — Sister', spanish: 'Hermana', english: 'Sister' },
      { amharic: 'ልጅ (lij) — Child', oromo: 'Mucaa (mucaa) — Child', tigrinya: 'ቆልዓ (qol\'a) — Child', spanish: 'Niño', english: 'Child' }
    ],
    [ // Numbers
      { amharic: 'አንድ (and) — One', oromo: 'Tokko (tokko) — One', tigrinya: 'ሓደ (hade) — One', spanish: 'Uno', english: 'One' },
      { amharic: 'ሁለት (hulet) — Two', oromo: 'Lama (lama) — Two', tigrinya: 'ክልተ (kilte) — Two', spanish: 'Dos', english: 'Two' },
      { amharic: 'ሶስት (sost) — Three', oromo: 'Sadii (sadii) — Three', tigrinya: 'ሰለስተ (seleste) — Three', spanish: 'Tres', english: 'Three' },
      { amharic: 'አራት (arat) — Four', oromo: 'Afur (afur) — Four', tigrinya: 'ኣርባዕተ (arba\'ate) — Four', spanish: 'Cuatro', english: 'Four' },
      { amharic: 'አምስት (amist) — Five', oromo: 'Shan (shan) — Five', tigrinya: 'ሓሙሽተ (hamushte) — Five', spanish: 'Cinco', english: 'Five' }
    ],
    [ // Colors
      { amharic: 'ቀይ (qey) — Red', oromo: 'Diimaa (diimaa) — Red', tigrinya: 'ቀይሕ (qeyih) — Red', spanish: 'Rojo', english: 'Red' },
      { amharic: 'ሰማያዊ (semayawi) — Blue', oromo: 'Cuquliisa (cuquliisa) — Blue', tigrinya: 'ሰማያዊ (semayawi) — Blue', spanish: 'Azul', english: 'Blue' },
      { amharic: 'አረንጓዴ (arenguade) — Green', oromo: 'Magariisa (magariisa) — Green', tigrinya: 'ቀጠልያ (qetelya) — Green', spanish: 'Verde', english: 'Green' },
      { amharic: 'ቢጫ (bicha) — Yellow', oromo: 'Keelloo (keelloo) — Yellow', tigrinya: 'ብጫ (bicha) — Yellow', spanish: 'Amarillo', english: 'Yellow' },
      { amharic: 'ጥቁር (t\'iqur) — Black', oromo: 'Gurraacha (gurraacha) — Black', tigrinya: 'ጸሊም (tselim) — Black', spanish: 'Negro', english: 'Black' }
    ],
    [ // Animals
      { amharic: 'ውሻ (wisha) — Dog', oromo: 'Saree (saree) — Dog', tigrinya: 'ከልቢ (kelbi) — Dog', spanish: 'Perro', english: 'Dog' },
      { amharic: 'ድመት (dimet) — Cat', oromo: 'Adurree (adurree) — Cat', tigrinya: 'ድሙ (dimu) — Cat', spanish: 'Gato', english: 'Cat' },
      { amharic: 'ወፍ (wef) — Bird', oromo: 'Simbira (simbira) — Bird', tigrinya: 'ዑፍ (uf) — Bird', spanish: 'Pájaro', english: 'Bird' },
      { amharic: 'አሳ (asa) — Fish', oromo: 'Qurxummii (qurxummii) — Fish', tigrinya: 'ዓሳ (asa) — Fish', spanish: 'Pez', english: 'Fish' },
      { amharic: 'ፈረስ (feres) — Horse', oromo: 'Fardaa (fardaa) — Horse', tigrinya: 'ፈረስ (feres) — Horse', spanish: 'Caballo', english: 'Horse' }
    ],
    [ // Body
      { amharic: 'ራስ (ras) — Head', oromo: 'Mataa (mataa) — Head', tigrinya: 'ርእሲ (re\'si) — Head', spanish: 'Cabeza', english: 'Head' },
      { amharic: 'እጅ (ej) — Hand', oromo: 'Harka (harka) — Hand', tigrinya: 'ኢድ (id) — Hand', spanish: 'Mano', english: 'Hand' },
      { amharic: 'አይን (ayn) — Eye', oromo: 'Ija (ija) — Eye', tigrinya: 'ዓይኒ (ayni) — Eye', spanish: 'Ojo', english: 'Eye' },
      { amharic: 'እግር (egir) — Foot', oromo: 'Miila (miila) — Foot', tigrinya: 'እግሪ (egri) — Foot', spanish: 'Pie', english: 'Foot' },
      { amharic: 'ልብ (lib) — Heart', oromo: 'Onnee (onnee) — Heart', tigrinya: 'ልቢ (libi) — Heart', spanish: 'Corazón', english: 'Heart' }
    ],
    [ // Clothing
      { amharic: 'ሸሚዝ (shemiz) — Shirt', oromo: 'Shaartii (shaartii) — Shirt', tigrinya: 'ካምቻ (kamcha) — Shirt', spanish: 'Camisa', english: 'Shirt' },
      { amharic: 'ጫማ (chama) — Shoes', oromo: 'Kophee (kophee) — Shoes', tigrinya: 'ጫማ (chama) — Shoes', spanish: 'Zapatos', english: 'Shoes' },
      { amharic: 'ኮፍያ (kofya) — Hat', oromo: 'Kofiyaa (kofiyaa) — Hat', tigrinya: 'ቆቢዕ (qobi\'e) — Hat', spanish: 'Sombrero', english: 'Hat' },
      { amharic: 'ቀሚስ (qemis) — Dress', oromo: 'Uffata (uffata) — Dress', tigrinya: 'ቀሚሽ (qemish) — Dress', spanish: 'Vestido', english: 'Dress' },
      { amharic: 'ጃኬት (jaket) — Jacket', oromo: 'Jaaketii (jaaketii) — Jacket', tigrinya: 'ጃኬት (jaket) — Jacket', spanish: 'Chaqueta', english: 'Jacket' }
    ],
    [ // Weather
      { amharic: 'ፀሐይ (tsehay) — Sun', oromo: 'Aduu (aduu) — Sun', tigrinya: 'ጸሓይ (tsehay) — Sun', spanish: 'Sol', english: 'Sun' },
      { amharic: 'ዝናብ (zinab) — Rain', oromo: 'Bokkaa (bokkaa) — Rain', tigrinya: 'ዝናብ (zinab) — Rain', spanish: 'Lluvia', english: 'Rain' },
      { amharic: 'ንፋስ (nifas) — Wind', oromo: 'Bubbee (bubbee) — Wind', tigrinya: 'ንፋስ (nifas) — Wind', spanish: 'Viento', english: 'Wind' },
      { amharic: 'በረዶ (beredo) — Snow', oromo: 'Cabbii (cabbii) — Snow', tigrinya: 'በረድ (bered) — Snow', spanish: 'Nieve', english: 'Snow' },
      { amharic: 'ደመና (demena) — Cloud', oromo: 'Duumessa (duumessa) — Cloud', tigrinya: 'ደበና (debena) — Cloud', spanish: 'Nube', english: 'Cloud' }
    ],
    [ // Time
      { amharic: 'ዛሬ (zare) — Today', oromo: 'Har\'a (har\'a) — Today', tigrinya: 'ሎሚ (lomi) — Today', spanish: 'Hoy', english: 'Today' },
      { amharic: 'ነገ (nege) — Tomorrow', oromo: 'Boru (boru) — Tomorrow', tigrinya: 'ጽባሕ (tsibah) — Tomorrow', spanish: 'Mañana', english: 'Tomorrow' },
      { amharic: 'ትናንት (tinant) — Yesterday', oromo: 'Kaleessa (kaleessa) — Yesterday', tigrinya: 'ትማሊ (timali) — Yesterday', spanish: 'Ayer', english: 'Yesterday' },
      { amharic: 'ሳምንት (samint) — Week', oromo: 'Torban (torban) — Week', tigrinya: 'ሰሙን (semun) — Week', spanish: 'Semana', english: 'Week' },
      { amharic: 'ዓመት (amet) — Year', oromo: 'Waggaa (waggaa) — Year', tigrinya: 'ዓመት (amet) — Year', spanish: 'Año', english: 'Year' }
    ],
    [ // Travel
      { amharic: 'አውሮፕላን ማረፊያ (awroplan marefia) — Airport', oromo: 'Buufata Xiyyaaraa (buufata xiyyaaraa) — Airport', tigrinya: 'መዓረፎ ነፈርቲ (me\'arefo neferti) — Airport', spanish: 'Aeropuerto', english: 'Airport' },
      { amharic: 'ባቡር (babur) — Train', oromo: 'Baaburaa (baaburaa) — Train', tigrinya: 'ባቡር (babur) — Train', spanish: 'Tren', english: 'Train' },
      { amharic: 'መኪና (mekina) — Car', oromo: 'Konkolaataa (konkolaataa) — Car', tigrinya: 'መኪና (mekina) — Car', spanish: 'Coche', english: 'Car' },
      { amharic: 'ትኬት (tiket) — Ticket', oromo: 'Tiketii (tiketii) — Ticket', tigrinya: 'ቲኬት (tiket) — Ticket', spanish: 'Boleto', english: 'Ticket' },
      { amharic: 'ሆቴል (hotel) — Hotel', oromo: 'Hoteela (hoteela) — Hotel', tigrinya: 'ሆቴል (hotel) — Hotel', spanish: 'Hotel', english: 'Hotel' }
    ],
    [ // Verbs
      { amharic: 'መብላት (meblat) — Eat', oromo: 'Nyaachuu (nyaachuu) — Eat', tigrinya: 'ምብላዕ (mibla\'e) — Eat', spanish: 'Comer', english: 'Eat' },
      { amharic: 'መጠጣት (metetat) — Drink', oromo: 'Dhuguu (dhuguu) — Drink', tigrinya: 'ምስታይ (mistay) — Drink', spanish: 'Beber', english: 'Drink' },
      { amharic: 'መተኛት (metenyat) — Sleep', oromo: 'Rafuu (rafuu) — Sleep', tigrinya: 'ምድቃስ (midqas) — Sleep', spanish: 'Dormir', english: 'Sleep' },
      { amharic: 'መሮጥ (merot) — Run', oromo: 'Fiiguu (fiiguu) — Run', tigrinya: 'ምጉያይ (miguyay) — Run', spanish: 'Correr', english: 'Run' },
      { amharic: 'መናገር (menager) — Speak', oromo: 'Dubbachuu (dubbachuu) — Speak', tigrinya: 'ምዝራብ (mizrab) — Speak', spanish: 'Hablar', english: 'Speak' }
    ],
    [ // Adjectives
      { amharic: 'ትልቅ (tiliq) — Big', oromo: 'Guddaa (guddaa) — Big', tigrinya: 'ዓቢይ (abiy) — Big', spanish: 'Grande', english: 'Big' },
      { amharic: 'ትንሽ (tinish) — Small', oromo: 'Xiqqaa (xiqqaa) — Small', tigrinya: 'ንእሽቶ (ni\'ishto) — Small', spanish: 'Pequeño', english: 'Small' },
      { amharic: 'ደስተኛ (destegna) — Happy', oromo: 'Gammadaa (gammadaa) — Happy', tigrinya: 'ሕጉስ (higus) — Happy', spanish: 'Feliz', english: 'Happy' },
      { amharic: 'ያዘነ (yazene) — Sad', oromo: 'Gaddaa (gaddaa) — Sad', tigrinya: 'ሓዚን (hazin) — Sad', spanish: 'Triste', english: 'Sad' },
      { amharic: 'ፈጣን (fetan) — Fast', oromo: 'Ariifataa (ariifataa) — Fast', tigrinya: 'ቅልጡፍ (qiltuf) — Fast', spanish: 'Rápido', english: 'Fast' }
    ],
    [ // House
      { amharic: 'ቤት (bet) — House', oromo: 'Mana (mana) — House', tigrinya: 'ገዛ (geza) — House', spanish: 'Casa', english: 'House' },
      { amharic: 'በር (ber) — Door', oromo: 'Balbala (balbala) — Door', tigrinya: 'ማዕጾ (ma\'itso) — Door', spanish: 'Puerta', english: 'Door' },
      { amharic: 'መስኮት (meskot) — Window', oromo: 'Foddaa (foddaa) — Window', tigrinya: 'መስኮት (meskot) — Window', spanish: 'Ventana', english: 'Window' },
      { amharic: 'ጠረጴዛ (t\'eret\'eza) — Table', oromo: 'Minjaala (minjaala) — Table', tigrinya: 'ጣውላ (tawla) — Table', spanish: 'Mesa', english: 'Table' },
      { amharic: 'ወንበር (wenber) — Chair', oromo: 'Barcuma (barcuma) — Chair', tigrinya: 'ወንበር (wenber) — Chair', spanish: 'Silla', english: 'Chair' }
    ],
    [ // Days of the Week
      { amharic: 'ሰኞ (segno) — Monday', oromo: 'Wiixata (wiixata) — Monday', tigrinya: 'ሰኑይ (senuy) — Monday', spanish: 'Lunes', english: 'Monday' },
      { amharic: 'ማክሰኞ (maksegno) — Tuesday', oromo: 'Kibxata (kibxata) — Tuesday', tigrinya: 'ሰሉስ (selus) — Tuesday', spanish: 'Martes', english: 'Tuesday' },
      { amharic: 'ረቡዕ (rebu) — Wednesday', oromo: 'Roobii (roobii) — Wednesday', tigrinya: 'ረቡዕ (rebu\'i) — Wednesday', spanish: 'Miércoles', english: 'Wednesday' },
      { amharic: 'ሐሙስ (hamus) — Thursday', oromo: 'Kamiisa (kamiisa) — Thursday', tigrinya: 'ሓሙስ (hamus) — Thursday', spanish: 'Jueves', english: 'Thursday' },
      { amharic: 'ዓርብ (arb) — Friday', oromo: 'Jimaata (jimaata) — Friday', tigrinya: 'ዓርቢ (arbi) — Friday', spanish: 'Viernes', english: 'Friday' }
    ],
    [ // Sports
      { amharic: 'ኳስ (kwas) — Ball', oromo: 'Kubbaa (kubbaa) — Ball', tigrinya: 'ኩዕሶ (ku\'iso) — Ball', spanish: 'Pelota', english: 'Ball' },
      { amharic: 'ቡድን (budin) — Team', oromo: 'Garee (garee) — Team', tigrinya: 'ጋንታ (ganta) — Team', spanish: 'Equipo', english: 'Team' },
      { amharic: 'ጨዋታ (chewata) — Game', oromo: 'Taphaa (taphaa) — Game', tigrinya: 'ጸወታ (tsaweta) — Game', spanish: 'Juego', english: 'Game' },
      { amharic: 'አሸናፊ (ashenafi) — Winner', oromo: 'Injifataa (injifataa) — Winner', tigrinya: 'ተዓዋቲ (te\'awati) — Winner', spanish: 'Ganador', english: 'Winner' },
      { amharic: 'ግብ (gib) — Goal', oromo: 'Galma (galma) — Goal', tigrinya: 'ግብ (gib) — Goal', spanish: 'Gol', english: 'Goal' }
    ],
    [ // Emotions
      { amharic: 'ፍቅር (fiqir) — Love', oromo: 'Jaalala (jaalala) — Love', tigrinya: 'ፍቕሪ (fiqri) — Love', spanish: 'Amor', english: 'Love' },
      { amharic: 'ተቆጣ (teqota) — Angry', oromo: 'Aaruu (aaruu) — Angry', tigrinya: 'ሓራቕ (haraq) — Angry', spanish: 'Enojado', english: 'Angry' },
      { amharic: 'ፈራ (fera) — Scared', oromo: 'Sodaachuu (sodaachuu) — Scared', tigrinya: 'ፈራሂ (ferahi) — Scared', spanish: 'Asustado', english: 'Scared' },
      { amharic: 'ተገረመ (tegereme) — Surprised', oromo: 'Dinqisiifannaa (dinqisiifannaa) — Surprised', tigrinya: 'ዝገረሞ (zigeremo) — Surprised', spanish: 'Sorprendido', english: 'Surprised' },
      { amharic: 'ደከመው (dekemew) — Tired', oromo: 'Dadhabuu (dadhabuu) — Tired', tigrinya: 'ደኺሙ (dekhimu) — Tired', spanish: 'Cansado', english: 'Tired' }
    ],
    [ // Shopping
      { amharic: 'ገንዘብ (genzeb) — Money', oromo: 'Maallaqa (maallaqa) — Money', tigrinya: 'ገንዘብ (genzeb) — Money', spanish: 'Dinero', english: 'Money' },
      { amharic: 'ዋጋ (waga) — Price', oromo: 'Gatii (gatii) — Price', tigrinya: 'ዋጋ (waga) — Price', spanish: 'Precio', english: 'Price' },
      { amharic: 'መግዛት (megzat) — Buy', oromo: 'Bituu (bituu) — Buy', tigrinya: 'ምግዛእ (migza\'e) — Buy', spanish: 'Comprar', english: 'Buy' },
      { amharic: 'መሸጥ (meshet) — Sell', oromo: 'Gurguruu (gurguruu) — Sell', tigrinya: 'ምሻጥ (mishat) — Sell', spanish: 'Vender', english: 'Sell' },
      { amharic: 'ገበያ (gebeya) — Market', oromo: 'Gabaa (gabaa) — Market', tigrinya: 'ዕዳጋ (edaga) — Market', spanish: 'Mercado', english: 'Market' }
    ],
    [ // School
      { amharic: 'መምህር (memhir) — Teacher', oromo: 'Barsiisaa (barsiisaa) — Teacher', tigrinya: 'መምህር (memhir) — Teacher', spanish: 'Profesor', english: 'Teacher' },
      { amharic: 'ተማሪ (temari) — Student', oromo: 'Barataa (barataa) — Student', tigrinya: 'ተምሃራይ (temeharay) — Student', spanish: 'Estudiante', english: 'Student' },
      { amharic: 'መጽሐፍ (mets\'ihaf) — Book', oromo: 'Kitaaba (kitaaba) — Book', tigrinya: 'መጽሓፍ (metsihaf) — Book', spanish: 'Libro', english: 'Book' },
      { amharic: 'እስክርቢቶ (eskiribito) — Pen', oromo: 'Kalamaa (kalamaa) — Pen', tigrinya: 'እስክርቢቶ (eskiribito) — Pen', spanish: 'Bolígrafo', english: 'Pen' },
      { amharic: 'ክፍል (kifil) — Class', oromo: 'Kutaa (kutaa) — Class', tigrinya: 'ክፍሊ (kifli) — Class', spanish: 'Clase', english: 'Class' }
    ],
    [ // Technology
      { amharic: 'ስልክ (silk) — Phone', oromo: 'Bilbila (bilbila) — Phone', tigrinya: 'ተለፎን (telefon) — Phone', spanish: 'Teléfono', english: 'Phone' },
      { amharic: 'ኮምፒውተር (computer) — Computer', oromo: 'Kompiitara (kompiitara) — Computer', tigrinya: 'ኮምፒተር (kompiter) — Computer', spanish: 'Computadora', english: 'Computer' },
      { amharic: 'ኢንተርኔት (internet) — Internet', oromo: 'Interneetii (interneetii) — Internet', tigrinya: 'ኢንተርኔት (internet) — Internet', spanish: 'Internet', english: 'Internet' },
      { amharic: 'ቪዲዮ (video) — Video', oromo: 'Viidiyoo (viidiyoo) — Video', tigrinya: 'ቪድዮ (vidyo) — Video', spanish: 'Video', english: 'Video' },
      { amharic: 'ፎቶ (foto) — Photo', oromo: 'Suuraa (suuraa) — Photo', tigrinya: 'ስእሊ (si\'ili) — Photo', spanish: 'Foto', english: 'Photo' }
    ],
    [ // Nature
      { amharic: 'ዛፍ (zaf) — Tree', oromo: 'Muka (muka) — Tree', tigrinya: 'ገረብ (gereb) — Tree', spanish: 'Árbol', english: 'Tree' },
      { amharic: 'ተራራ (terara) — Mountain', oromo: 'Tulluu (tulluu) — Mountain', tigrinya: 'ጎቦ (gobo) — Mountain', spanish: 'Montaña', english: 'Mountain' },
      { amharic: 'ወንዝ (wenz) — River', oromo: 'Laga (laga) — River', tigrinya: 'ፈለግ (feleg) — River', spanish: 'Río', english: 'River' },
      { amharic: 'ጫካ (chaka) — Forest', oromo: 'Bosona (bosona) — Forest', tigrinya: 'ዱር (dur) — Forest', spanish: 'Bosque', english: 'Forest' },
      { amharic: 'ሰማይ (semay) — Sky', oromo: 'Samii (samii) — Sky', tigrinya: 'ሰማይ (semay) — Sky', spanish: 'Cielo', english: 'Sky' }
    ],
    [ // Kitchen
      { amharic: 'ሳህን (sahin) — Plate', oromo: 'Waciitii (waciitii) — Plate', tigrinya: 'ሸሓኒ (shehani) — Plate', spanish: 'Plato', english: 'Plate' },
      { amharic: 'ኩባያ (kubaya) — Cup', oromo: 'Kubbaayaa (kubbaayaa) — Cup', tigrinya: 'ኩባያ (kubaya) — Cup', spanish: 'Taza', english: 'Cup' },
      { amharic: 'ማንኪያ (mankiya) — Spoon', oromo: 'Sipoonii (sipoonii) — Spoon', tigrinya: 'ማንካ (manka) — Spoon', spanish: 'Cuchara', english: 'Spoon' },
      { amharic: 'ቢላ (bila) — Knife', oromo: 'Billaa (billaa) — Knife', tigrinya: 'ካራ (kara) — Knife', spanish: 'Cuchillo', english: 'Knife' },
      { amharic: 'ድስት (dist) — Pot', oromo: 'Okotee (okotee) — Pot', tigrinya: 'ድስቲ (disti) — Pot', spanish: 'Olla', english: 'Pot' }
    ],
    [ // Directions
      { amharic: 'ግራ (gra) — Left', oromo: 'Bitaa (bitaa) — Left', tigrinya: 'ጸጋም (tsegam) — Left', spanish: 'Izquierda', english: 'Left' },
      { amharic: 'ቀኝ (qegn) — Right', oromo: 'Mirga (mirga) — Right', tigrinya: 'የማን (yeman) — Right', spanish: 'Derecha', english: 'Right' },
      { amharic: 'ቀጥታ (qetita) — Straight', oromo: 'Qajeelaa (qajeelaa) — Straight', tigrinya: 'ትኽ (tikh) — Straight', spanish: 'Derecho', english: 'Straight' },
      { amharic: 'ቅርብ (qirb) — Near', oromo: 'Dhihoo (dhihoo) — Near', tigrinya: 'ቀረባ (qereba) — Near', spanish: 'Cerca', english: 'Near' },
      { amharic: 'ሩቅ (ruq) — Far', oromo: 'Fagoo (fagoo) — Far', tigrinya: 'ርሑቕ (rihuq) — Far', spanish: 'Lejos', english: 'Far' }
    ],
    [ // Occupations
      { amharic: 'ዶክተር (doctor) — Doctor', oromo: 'Doktora (doktora) — Doctor', tigrinya: 'ሓኪም (hakim) — Doctor', spanish: 'Doctor', english: 'Doctor' },
      { amharic: 'መሐንዲስ (mehandis) — Engineer', oromo: 'Injinara (injinara) — Engineer', tigrinya: 'ኢንጂነር (injinar) — Engineer', spanish: 'Ingeniero', english: 'Engineer' },
      { amharic: 'ገበሬ (gebere) — Farmer', oromo: "Qonnaan Bulaa (qonnaan bulaa) — Farmer", tigrinya: "ሓረስታይ (harestay) — Farmer", spanish: 'Agricultor', english: 'Farmer' },
      { amharic: 'ፖሊስ (police) — Police', oromo: 'Poolisii (poolisii) — Police', tigrinya: 'ፖሊስ (polis) — Police', spanish: 'Policía', english: 'Police' },
      { amharic: 'ሹፌር (shufer) — Driver', oromo: 'Konkolaachisaa (konkolaachisaa) — Driver', tigrinya: 'ሹፌር (shufer) — Driver', spanish: 'Conductor', english: 'Driver' }
    ],
    [ // Health
      { amharic: 'ታመመ (tameme) — Sick', oromo: 'Dhukkubsatee (dhukkubsatee) — Sick', tigrinya: 'ሓሚሙ (hamimu) — Sick', spanish: 'Enfermo', english: 'Sick' },
      { amharic: 'መድሃኒት (medhanit) — Medicine', oromo: 'Qoricha (qoricha) — Medicine', tigrinya: 'መድሃኒት (medhanit) — Medicine', spanish: 'Medicina', english: 'Medicine' },
      { amharic: 'ሆስፒታል (hospital) — Hospital', oromo: 'Hospitaala (hospitaala) — Hospital', tigrinya: 'ሆስፒታል (hospital) — Hospital', spanish: 'Hospital', english: 'Hospital' },
      { amharic: 'ህመም (himem) — Pain', oromo: 'Dhukkubbii (dhukkubbii) — Pain', tigrinya: 'ቃንዛ (qanza) — Pain', spanish: 'Dolor', english: 'Pain' },
      { amharic: 'ጤናማ (t\'enama) — Healthy', oromo: 'Fayyaa Qabu (fayyaa qabu) — Healthy', tigrinya: 'ጥዑይ (t\'uy) — Healthy', spanish: 'Saludable', english: 'Healthy' }
    ],
    [ // Transportation
      { amharic: 'አውቶብስ (awtobus) — Bus', oromo: 'Awtoobusii (awtoobusii) — Bus', tigrinya: 'ኣውቶቡስ (awtobus) — Bus', spanish: 'Autobús', english: 'Bus' },
      { amharic: 'ብስክሌት (bisiklet) — Bicycle', oromo: 'Bisikiletii (bisikiletii) — Bicycle', tigrinya: 'ብሽክለታ (bishkileta) — Bicycle', spanish: 'Bicicleta', english: 'Bicycle' },
      { amharic: 'ጀልባ (jelba) — Boat', oromo: 'Bidiruu (bidiruu) — Boat', tigrinya: 'ጃልባ (jalba) — Boat', spanish: 'Barco', english: 'Boat' },
      { amharic: 'መንገድ (menged) — Road', oromo: 'Karaa (karaa) — Road', tigrinya: 'ጽርግያ (tsirgiya) — Road', spanish: 'Camino', english: 'Road' },
      { amharic: 'ድልድይ (dildiy) — Bridge', oromo: 'Riqicha (riqicha) — Bridge', tigrinya: 'ድልድል (dildil) — Bridge', spanish: 'Puente', english: 'Bridge' }
    ],
    [ // Music & Arts
      { amharic: 'ዘፈን (zefen) — Song', oromo: 'Sirba (sirba) — Song', tigrinya: 'ደርፊ (derfi) — Song', spanish: 'Canción', english: 'Song' },
      { amharic: 'ዳንስ (dans) — Dance', oromo: 'Shubbisa (shubbisa) — Dance', tigrinya: 'ስዕስዓ (si\'is\'a) — Dance', spanish: 'Bailar', english: 'Dance' },
      { amharic: 'ቀለም መቀባት (kelem meqebat) — Paint', oromo: 'Halluu Dibuu (halluu dibuu) — Paint', tigrinya: 'ምቕባእ (miqiba\'e) — Paint', spanish: 'Pintar', english: 'Paint' },
      { amharic: 'መሳል (mesal) — Draw', oromo: 'Fakkeessuu (fakkeessuu) — Draw', tigrinya: 'ምስኣል (misi\'al) — Draw', spanish: 'Dibujar', english: 'Draw' },
      { amharic: 'የሙዚቃ መሳሪያ (yemuziqa mesarya) — Instrument', oromo: 'Meeshaa Muuziqaa (meeshaa muuziqaa) — Instrument', tigrinya: 'ናይ ሙዚቃ መሳርሒ (nay muziqa mesarhi) — Instrument', spanish: 'Instrumento', english: 'Instrument' }
    ],
    [ // Seasons
      { amharic: 'በጋ (bega) — Summer', oromo: 'Bona (bona) — Summer', tigrinya: 'ሓጋይ (hagay) — Summer', spanish: 'Verano', english: 'Summer' },
      { amharic: 'ክረምት (kremt) — Winter', oromo: 'Ganna (ganna) — Winter', tigrinya: 'ክረምቲ (kiremti) — Winter', spanish: 'Invierno', english: 'Winter' },
      { amharic: 'ጸደይ (tsedey) — Spring', oromo: 'Arfaasaa (arfaasaa) — Spring', tigrinya: 'ጸደይ (tsedey) — Spring', spanish: 'Primavera', english: 'Spring' },
      { amharic: 'መኸር (meher) — Autumn', oromo: 'Birraa (birraa) — Autumn', tigrinya: 'መጸው (metsew) — Autumn', spanish: 'Otoño', english: 'Autumn' },
      { amharic: 'ወቅት (weqt) — Season', oromo: 'Waqtii (waqtii) — Season', tigrinya: 'ወቕቲ (weqti) — Season', spanish: 'Estación', english: 'Season' }
    ],
    [ // Money & Bank
      { amharic: 'ባንክ (bank) — Bank', oromo: 'Baankii (baankii) — Bank', tigrinya: 'ባንክ (bank) — Bank', spanish: 'Banco', english: 'Bank' },
      { amharic: 'መቆጠብ (meqotob) — Save', oromo: 'Qusachuu (qusachuu) — Save', tigrinya: 'ምቁጣብ (miqutab) — Save', spanish: 'Ahorrar', english: 'Save' },
      { amharic: 'ማውጣት (mawtat) — Spend', oromo: 'Baasuu (baasuu) — Spend', tigrinya: 'ምጥፋእ (mitfa\'e) — Spend', spanish: 'Gastar', english: 'Spend' },
      { amharic: 'ሳንቲም (santim) — Coin', oromo: 'Saantima (saantima) — Coin', tigrinya: 'ሳንቲም (santim) — Coin', spanish: 'Moneda', english: 'Coin' },
      { amharic: 'ቦርሳ ገንዘብ (borsa genzeb) — Wallet', oromo: 'Baksaa Maallaqaa (baksaa maallaqaa) — Wallet', tigrinya: 'ቦርሳ ገንዘብ (borsa genzeb) — Wallet', spanish: 'Billetera', english: 'Wallet' }
    ],
    [ // Restaurant
      { amharic: 'ምናሌ (minale) — Menu', oromo: 'Miinuu (miinuu) — Menu', tigrinya: 'ዝርዝር መግቢ (zirzir megbi) — Menu', spanish: 'Menú', english: 'Menu' },
      { amharic: 'ማዘዝ (mazezz) — Order', oromo: 'Ajajuu (ajajuu) — Order', tigrinya: 'ትእዛዝ (ti\'izaz) — Order', spanish: 'Pedido', english: 'Order' },
      { amharic: 'አስተናጋጅ (astenagaj) — Waiter', oromo: 'Tajaajilaa (tajaajilaa) — Waiter', tigrinya: 'ኣገልጋሊ (agelgali) — Waiter', spanish: 'Camarero', english: 'Waiter' },
      { amharic: 'ደረሰኝ (deresegn) — Bill', oromo: 'Herrega (herrega) — Bill', tigrinya: 'ሕሳብ (hisab) — Bill', spanish: 'Cuenta', english: 'Bill' },
      { amharic: 'ጣፋጭ (t\'afach) — Delicious', oromo: "Mi'aawaa (mi'aawaa) — Delicious", tigrinya: "ጥዑም (t\'um) — Delicious", spanish: 'Delicioso', english: 'Delicious' }
    ],
    [ // City Life
      { amharic: 'ጎዳና (godana) — Street', oromo: 'Daandii (daandii) — Street', tigrinya: 'ጎደና (godena) — Street', spanish: 'Calle', english: 'Street' },
      { amharic: 'ህንፃ (hintsa) — Building', oromo: 'Ijaarsa (ijaarsa) — Building', tigrinya: 'ህንጻ (hintsa) — Building', spanish: 'Edificio', english: 'Building' },
      { amharic: 'ፓርክ (park) — Park', oromo: 'Paarkii (paarkii) — Park', tigrinya: 'ፓርክ (park) — Park', spanish: 'Parque', english: 'Park' },
      { amharic: 'ትራፊክ (traffic) — Traffic', oromo: 'Dhiddiqqoo Konkolaataa (dhiddiqqoo konkolaataa) — Traffic', tigrinya: 'ትራፊክ (trafik) — Traffic', spanish: 'Tráfico', english: 'Traffic' },
      { amharic: 'ጎረቤት (gorebet) — Neighbor', oromo: 'Ollaa (ollaa) — Neighbor', tigrinya: 'ጎረቤት (gorebet) — Neighbor', spanish: 'Vecino', english: 'Neighbor' }
    ],
    [ // Farm & Agriculture
      { amharic: 'ሰብል (sebl) — Crop', oromo: 'Midhaan (midhaan) — Crop', tigrinya: 'ምህርቲ (mihirti) — Crop', spanish: 'Cosecha', english: 'Crop' },
      { amharic: 'ላም (lam) — Cow', oromo: "Sa'a (sa'a) — Cow", tigrinya: "ላም (lam) — Cow", spanish: 'Vaca', english: 'Cow' },
      { amharic: 'እርሻ (irsha) — Field', oromo: 'Lafa Qonnaa (lafa qonnaa) — Field', tigrinya: 'ግራት (girat) — Field', spanish: 'Campo', english: 'Field' },
      { amharic: 'መከር (mekr) — Harvest', oromo: 'Haamuu (haamuu) — Harvest', tigrinya: 'ዓጺድ (atsid) — Harvest', spanish: 'Cosechar', english: 'Harvest' },
      { amharic: 'ዘር (zer) — Seed', oromo: 'Sanyii (sanyii) — Seed', tigrinya: 'ዘርኢ (zer\'i) — Seed', spanish: 'Semilla', english: 'Seed' }
    ],
    [ // Communication
      { amharic: 'መደወል (medewel) — Call', oromo: 'Bilbiluu (bilbiluu) — Call', tigrinya: 'ምድዋል (midwal) — Call', spanish: 'Llamar', english: 'Call' },
      { amharic: "መልእክት (mel'ikt) — Message", oromo: 'Ergaa (ergaa) — Message', tigrinya: 'መልእኽቲ (mel\'ikti) — Message', spanish: 'Mensaje', english: 'Message' },
      { amharic: 'ደብዳቤ (debdabe) — Letter', oromo: 'Xalayaa (xalayaa) — Letter', tigrinya: 'ደብዳበ (debdabe) — Letter', spanish: 'Carta', english: 'Letter' },
      { amharic: 'ስብሰባ (sibseba) — Meeting', oromo: "Walga'ii (walga'ii) — Meeting", tigrinya: "ኣኼባ (akheba) — Meeting", spanish: 'Reunión', english: 'Meeting' },
      { amharic: 'መልስ (mels) — Answer', oromo: 'Deebii (deebii) — Answer', tigrinya: 'መልሲ (melsi) — Answer', spanish: 'Respuesta', english: 'Answer' }
    ],
    [ // Holidays & Celebrations
      { amharic: "በዓል (be'al) — Holiday", oromo: 'Ayyaana (ayyaana) — Holiday', tigrinya: 'በዓል (be\'al) — Holiday', spanish: 'Feriado', english: 'Holiday' },
      { amharic: 'ልደት (lidet) — Birthday', oromo: 'Guyyaa Dhalootaa (guyyaa dhalootaa) — Birthday', tigrinya: 'ልደት (lidet) — Birthday', spanish: 'Cumpleaños', english: 'Birthday' },
      { amharic: 'ሰርግ (serg) — Wedding', oromo: 'Cidha (cidha) — Wedding', tigrinya: 'መርዓ (mer\'a) — Wedding', spanish: 'Boda', english: 'Wedding' },
      { amharic: 'ስጦታ (sitota) — Gift', oromo: 'Kennaa (kennaa) — Gift', tigrinya: 'ህያብ (hiyab) — Gift', spanish: 'Regalo', english: 'Gift' },
      { amharic: 'ማክበር (makber) — Celebrate', oromo: 'Kabajuu (kabajuu) — Celebrate', tigrinya: 'ምብዓል (mib\'al) — Celebrate', spanish: 'Celebrar', english: 'Celebrate' }
    ],
    [ // Space
      { amharic: 'ኮከብ (kokeb) — Star', oromo: 'Urjii (urjii) — Star', tigrinya: 'ኮኸብ (kokeb) — Star', spanish: 'Estrella', english: 'Star' },
      { amharic: "ጨረቃ (cherqa) — Moon", oromo: "Ji'a (ji'a) — Moon", tigrinya: "ወርሒ (werhi) — Moon", spanish: 'Luna', english: 'Moon' },
      { amharic: 'ምድር (midir) — Earth', oromo: 'Lafa (lafa) — Earth', tigrinya: 'ምድሪ (midri) — Earth', spanish: 'Tierra', english: 'Earth' },
      { amharic: 'ፕላኔት (planet) — Planet', oromo: 'Piilaaneetii (piilaaneetii) — Planet', tigrinya: 'ፕላኔት (planet) — Planet', spanish: 'Planeta', english: 'Planet' },
      { amharic: 'አጽናፈ ዓለም (atsinafe alem) — Universe', oromo: 'Addunyaa Guutuu (addunyaa guutuu) — Universe', tigrinya: 'ኮስሞስ (kosmos) — Universe', spanish: 'Universo', english: 'Universe' }
    ],
    [ // Months
      { amharic: 'ጥር (tir) — January', oromo: 'Amajjii (amajjii) — January', tigrinya: 'ጥሪ (tri) — January', spanish: 'Enero', english: 'January' },
      { amharic: 'የካቲት (yekatit) — February', oromo: 'Guraandhala (guraandhala) — February', tigrinya: 'ለካቲት (lekatit) — February', spanish: 'Febrero', english: 'February' },
      { amharic: 'መጋቢት (megabit) — March', oromo: 'Bitootessa (bitootessa) — March', tigrinya: 'መጋቢት (megabit) — March', spanish: 'Marzo', english: 'March' },
      { amharic: 'ሚያዝያ (miazia) — April', oromo: 'Elba (elba) — April', tigrinya: 'ሚያዝያ (miazia) — April', spanish: 'Abril', english: 'April' },
      { amharic: 'ግንቦት (ginbot) — May', oromo: 'Caamsaa (caamsaa) — May', tigrinya: 'ግንቦት (ginbot) — May', spanish: 'Mayo', english: 'May' }
    ],
    [ // Countries
      { amharic: "ኢትዮጵያ (ityop'ya) — Ethiopia", oromo: 'Itoophiyaa (itoophiyaa) — Ethiopia', tigrinya: 'ኢትዮጵያ (ityopia) — Ethiopia', spanish: 'Etiopía', english: 'Ethiopia' },
      { amharic: 'ኬንያ (kenya) — Kenya', oromo: 'Keeniyaa (keeniyaa) — Kenya', tigrinya: 'ኬንያ (kenya) — Kenya', spanish: 'Kenia', english: 'Kenya' },
      { amharic: 'አሜሪካ (amerika) — America', oromo: 'Ameerikaa (ameerikaa) — America', tigrinya: 'ኣመሪካ (amerika) — America', spanish: 'Estados Unidos', english: 'America' },
      { amharic: 'ስፔን (ispein) — Spain', oromo: 'Ispeen (ispeen) — Spain', tigrinya: 'ስጳኝ (ispagn) — Spain', spanish: 'España', english: 'Spain' },
      { amharic: 'ሱዳን (sudan) — Sudan', oromo: 'Sudaan (sudaan) — Sudan', tigrinya: 'ሱዳን (sudan) — Sudan', spanish: 'Sudán', english: 'Sudan' }
    ],
    [ // Hobbies
      { amharic: 'ማንበብ (manbeb) — Reading', oromo: 'Dubbisuu (dubbisuu) — Reading', tigrinya: 'ምንባብ (minbab) — Reading', spanish: 'Lectura', english: 'Reading' },
      { amharic: 'መዋኘት (mewanyet) — Swimming', oromo: 'Daaquu (daaquu) — Swimming', tigrinya: 'ምሕምባስ (mihmbas) — Swimming', spanish: 'Natación', english: 'Swimming' },
      { amharic: 'እግር ኳስ (egir kwas) — Football', oromo: 'Kubbaa Miilaa (kubbaa miilaa) — Football', tigrinya: "ኩዕሶ እግሪ (ku'iso egri) — Football", spanish: 'Fútbol', english: 'Football' },
      { amharic: 'ማብሰል (mabsel) — Cooking', oromo: 'Bilcheessuu (bilcheessuu) — Cooking', tigrinya: 'ምብሳል (mibsal) — Cooking', spanish: 'Cocina', english: 'Cooking' },
      { amharic: 'መጓዝ (megwaz) — Traveling', oromo: 'Imaluu (imaluu) — Traveling', tigrinya: "ጉዕዞ (gu'izo) — Traveling", spanish: 'Viajar', english: 'Traveling' }
    ],
    [ // Furniture
      { amharic: 'አልጋ (aliga) — Bed', oromo: 'Siree (siree) — Bed', tigrinya: 'ዓራት (arat) — Bed', spanish: 'Cama', english: 'Bed' },
      { amharic: 'ሶፋ (sofa) — Sofa', oromo: 'Sofaa (sofaa) — Sofa', tigrinya: 'ሶፋ (sofa) — Sofa', spanish: 'Sofá', english: 'Sofa' },
      { amharic: 'መደርደሪያ (mederderiya) — Shelf', oromo: 'Kabata (kabata) — Shelf', tigrinya: 'መደርደሪ (mederderi) — Shelf', spanish: 'Estante', english: 'Shelf' },
      { amharic: 'መስታወት (mestawet) — Mirror', oromo: 'Calaqqee (calaqqee) — Mirror', tigrinya: 'መስትያት (mestyat) — Mirror', spanish: 'Espejo', english: 'Mirror' },
      { amharic: 'መብራት (mebrat) — Lamp', oromo: 'Ibsaa (ibsaa) — Lamp', tigrinya: 'መብራሂ (mebrahi) — Lamp', spanish: 'Lámpara', english: 'Lamp' }
    ],
    [ // Insects
      { amharic: 'ንብ (nib) — Bee', oromo: 'Kanniisa (kanniisa) — Bee', tigrinya: 'ንህቢ (nihbi) — Bee', spanish: 'Abeja', english: 'Bee' },
      { amharic: 'ጉንዳን (gundan) — Ant', oromo: 'Goondaa (goondaa) — Ant', tigrinya: 'ጻጸ (tsatse) — Ant', spanish: 'Hormiga', english: 'Ant' },
      { amharic: 'ቢራቢሮ (birabiro) — Butterfly', oromo: 'Baaballoo (baaballoo) — Butterfly', tigrinya: 'ቢራቢሮ (birabiro) — Butterfly', spanish: 'Mariposa', english: 'Butterfly' },
      { amharic: 'ሸረሪት (sherarit) — Spider', oromo: 'Manshaakkoo (manshaakkoo) — Spider', tigrinya: 'ሸረርቲ (shererti) — Spider', spanish: 'Araña', english: 'Spider' },
      { amharic: 'ዝንብ (zinb) — Fly', oromo: 'Tisiisa (tisiisa) — Fly', tigrinya: 'ዝንቢ (zinbi) — Fly', spanish: 'Mosca', english: 'Fly' }
    ]
  ];

  private courses: Course[] = [
    {
      id: 'spanish',
      name: 'Spanish',
      amharicName: 'ስፓንኛ',
      oromoName: 'Afaan Ispaanish',
      tigrinyaName: 'ስጳንኛ',
      spanishName: 'Español',
      flag: 'spain',
      color: '#AA151B',
      units: this.unitDefs.map((def, i) => ({
        id: 'unit' + (i + 1),
        title: def.title,
        amharicTitle: def.amharicTitle,
        oromoTitle: def.oromoTitle,
        tigrinyaTitle: def.tigrinyaTitle,
        spanishTitle: def.spanishTitle,
        icon: def.icon,
        words: this.vocab[i]
      }))
    },
    {
      id: 'english',
      name: 'English',
      amharicName: 'እንግሊዝኛ',
      oromoName: 'Afaan Ingiliffaa',
      tigrinyaName: 'እንግሊዝኛ',
      spanishName: 'Inglés',
      flag: 'usa',
      color: '#3C3B6E',
      units: this.unitDefs.map((def, i) => ({
        id: 'unit' + (i + 1),
        title: def.title,
        amharicTitle: def.amharicTitle,
        oromoTitle: def.oromoTitle,
        tigrinyaTitle: def.tigrinyaTitle,
        spanishTitle: def.spanishTitle,
        icon: def.icon,
        words: this.vocab[i]
      }))
    },
    {
      // For learners whose base language is Amharic or Tigrinya, wanting to learn Afaan Oromo.
      id: 'oromo',
      name: 'Afaan Oromo',
      amharicName: 'ኦሮምኛ',
      oromoName: 'Afaan Oromo',
      tigrinyaName: 'ኦሮምኛ',
      spanishName: 'Oromo',
      flag: 'oromia',
      color: '#078930',
      units: this.unitDefs.map((def, i) => ({
        id: 'unit' + (i + 1),
        title: def.title,
        amharicTitle: def.amharicTitle,
        oromoTitle: def.oromoTitle,
        tigrinyaTitle: def.tigrinyaTitle,
        spanishTitle: def.spanishTitle,
        icon: def.icon,
        words: this.vocab[i]
      }))
    },
    {
      // For learners whose base language is Afaan Oromo or Tigrinya, wanting to learn Amharic.
      id: 'amharic',
      name: 'Amharic',
      amharicName: 'አማርኛ',
      oromoName: 'Afaan Amaaraa',
      tigrinyaName: 'ኣምሓርኛ',
      spanishName: 'Amárico',
      flag: 'ethiopia',
      color: '#DA121A',
      units: this.unitDefs.map((def, i) => ({
        id: 'unit' + (i + 1),
        title: def.title,
        amharicTitle: def.amharicTitle,
        oromoTitle: def.oromoTitle,
        tigrinyaTitle: def.tigrinyaTitle,
        spanishTitle: def.spanishTitle,
        icon: def.icon,
        words: this.vocab[i]
      }))
    },
    {
      // For learners whose base language is Amharic or Afaan Oromo, wanting to learn Tigrinya.
      id: 'tigrigna',
      name: 'Tigrinya',
      amharicName: 'ትግርኛ',
      oromoName: 'Afaan Tigree',
      tigrinyaName: 'ትግርኛ',
      spanishName: 'Tigriña',
      flag: 'ethiopia',
      color: '#FCDD09',
      units: this.unitDefs.map((def, i) => ({
        id: 'unit' + (i + 1),
        title: def.title,
        amharicTitle: def.amharicTitle,
        oromoTitle: def.oromoTitle,
        tigrinyaTitle: def.tigrinyaTitle,
        spanishTitle: def.spanishTitle,
        icon: def.icon,
        words: this.vocab[i]
      }))
    }
  ];

  getCourses(): Course[] {
    return this.courses;
  }

  getCourse(id: string): Course | undefined {
    return this.courses.find(c => c.id === id);
  }

  getUnit(courseId: string, unitId: string): Unit | undefined {
    return this.getCourse(courseId)?.units.find(u => u.id === unitId);
  }

  /** Strips the trailing "— meaning" gloss (e.g. "ሰላም (selam) — Hello" -> "ሰላም (selam)").
   *  Needed for the English course specifically, since that gloss is itself the English
   *  answer — showing it in the question would give the answer away. */
  private stripGloss(phrase: string): string {
    return phrase.split(' — ')[0];
  }

  /** Removes the parenthetical pronunciation guide (e.g. "ሰላም (selam) — Hello" ->
   *  "ሰላም — Hello"). Used so Amharic/Oromo/Tigrinya source phrases show just the
   *  native word and its English gloss, without the phonetic transliteration. */
  private stripTransliteration(phrase: string): string {
    return phrase.replace(/\s*\([^)]*\)/, '').trim();
  }

  /** Amharic/Oromo vocab entries are stored as "NativeWord (transliteration) — English gloss".
   *  When the target course itself IS Amharic or Oromo, the answer option should just be the
   *  plain native word (e.g. "ሰላም" or "Akkam"), not the full annotated gloss string. */
  private extractWord(phrase: string): string {
    const match = phrase.match(/^(.*?)\s*\(/);
    return (match ? match[1] : phrase.split(' — ')[0]).trim();
  }

  /** Returns the correct-answer string for a given target course. */
  private targetWord(courseId: CourseId, word: WordPair): string {
    switch (courseId) {
      case 'spanish': return word.spanish;
      case 'english': return word.english;
      case 'oromo': return this.extractWord(word.oromo);
      case 'amharic': return this.extractWord(word.amharic);
      case 'tigrigna': return this.extractWord(word.tigrinya);
    }
  }

  /** Build a randomized multiple-choice question set for a unit, sourced from the chosen base language. */
  buildQuestions(course: Course, unit: Unit, baseLanguage: BaseLanguage): Question[] {
    const promptText = `Select the ${course.name} word`;
    const baseLabel = baseLanguage === 'amharic' ? 'Amharic' : baseLanguage === 'oromo' ? 'Afaan Oromo' : baseLanguage === 'tigrigna' ? 'Tigrinya' : baseLanguage === 'spanish' ? 'Spanish' : 'English';
    return unit.words.map(word => {
      const answer = this.targetWord(course.id, word);
      const distractorPool = unit.words
        .filter(w => w !== word)
        .map(w => this.targetWord(course.id, w));
      const distractors = shuffle(distractorPool).slice(0, 3);
      const options = shuffle([answer, ...distractors]);
      const rawSourceWithTranslit = baseLanguage === 'amharic' ? word.amharic : baseLanguage === 'oromo' ? word.oromo : baseLanguage === 'tigrigna' ? word.tigrinya : baseLanguage === 'spanish' ? word.spanish : word.english;
      const rawSource = this.stripTransliteration(rawSourceWithTranslit);
      const cleanSource = this.stripGloss(rawSource);
      // Only the English course's source gloss needs stripping — its trailing "— meaning"
      // literally IS the English answer. Oromo/Amharic answers never appear in that gloss,
      // so their source phrase can safely show the full annotated word.
      return {
        prompt: promptText,
        sourcePhrase: course.id === 'english' ? cleanSource : rawSource,
        answer,
        options,
        explanation: `"${answer}" is how you say this in ${course.name}. In ${baseLabel}, it's "${cleanSource}" — part of the "${unit.title}" unit.`
      };
    });
  }
}

import { Injectable } from '@angular/core';
import { BaseLanguage } from './base-language.service';

export type UiKey =
  | 'check' | 'continue' | 'correct' | 'correctAnswer'
  | 'outOfHearts' | 'tryAgain' | 'backToUnits'
  | 'unitComplete' | 'continueLearning' | 'practiceAgain' | 'score';

interface UiStrings {
  amharic: string;
  oromo: string;
  tigrinya: string;
  english: string;
  spanish: string;
}

const UI_TEXT: Record<UiKey, UiStrings> = {
  check:            { amharic: 'አረጋግጥ',              oromo: 'Mirkaneessi',              tigrinya: 'ኣረጋግጽ',              english: 'Check',              spanish: 'Comprobar' },
  continue:         { amharic: 'ቀጥል',                oromo: "Itti Fufi",                tigrinya: 'ቀጽል',                english: 'Continue',           spanish: 'Continuar' },
  correct:          { amharic: '✅ ትክክል ነው!',         oromo: '✅ Sirrii dha!',            tigrinya: '✅ ልክዕ እዩ!',           english: 'Correct!',           spanish: '✅ ¡Correcto!' },
  correctAnswer:    { amharic: '❌ ትክክለኛው መልስ:',      oromo: '❌ Deebiin sirrii:',        tigrinya: '❌ ልክዕ መልሲ:',         english: 'Correct answer:',    spanish: '❌ Respuesta correcta:' },
  outOfHearts:      { amharic: 'ልቦች አልቀዋል!',         oromo: 'Onneen dhumeera!',          tigrinya: 'ልብታት ወዲኡ!',          english: 'Out of hearts!',     spanish: '¡Sin corazones!' },
  tryAgain:         { amharic: 'እንደገና ሞክር',          oromo: "Irra Deebi'ii Yaali",       tigrinya: 'ደጊምካ ፈትን',           english: 'Try Again',          spanish: 'Inténtalo de nuevo' },
  backToUnits:      { amharic: 'ወደ ትምህርቶች ተመለስ',    oromo: "Gara Kutaalee Deebi'i",     tigrinya: 'ናብ ትምህርትታት ተመለስ',    english: 'Back to Units',      spanish: 'Volver a las unidades' },
  unitComplete:     { amharic: 'ትምህርቱ ተጠናቋል! 🎉',    oromo: 'Kutaan Xumurameera! 🎉',    tigrinya: 'ትምህርቲ ተዛዚሙ! 🎉',      english: 'Unit Complete!',     spanish: '¡Unidad completada! 🎉' },
  continueLearning: { amharic: 'መማር ቀጥል',            oromo: 'Barachuu Itti Fufi',        tigrinya: 'ምምሃር ቀጽል',           english: 'Continue Learning',  spanish: 'Seguir aprendiendo' },
  practiceAgain:    { amharic: 'እንደገና ተለማመድ',       oromo: "Irra Deebi'ii Shaakali",    tigrinya: 'ደጊምካ ተለማመድ',         english: 'Practice Again',     spanish: 'Practicar de nuevo' },
  score:            { amharic: 'ውጤት',                oromo: 'Qabxii',                    tigrinya: 'ውጽኢት',               english: 'Score',              spanish: 'Puntuación' }
};

export interface BilingualLabel {
  primary: string;
  english: string;
  showEnglish: boolean; // false when baseLanguage IS english-adjacent (avoids redundant duplicate captions)
}

@Injectable({ providedIn: 'root' })
export class UiTextService {

  label(key: UiKey, lang: BaseLanguage): BilingualLabel {
    const entry = UI_TEXT[key];
    const primary = lang === 'amharic' ? entry.amharic
      : lang === 'oromo' ? entry.oromo
      : lang === 'tigrigna' ? entry.tigrinya
      : lang === 'spanish' ? entry.spanish
      : entry.english;
    return { primary, english: entry.english, showEnglish: lang !== 'english' };
  }
}

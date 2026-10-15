import { Injectable } from '@angular/core';
import { BaseLanguage, CourseId } from './lesson.service';

export interface TenseVerb {
  amharicVerb: string;   // Amharic infinitive gloss
  oromoVerb: string;     // Afaan Oromo infinitive gloss
  tigrinyaVerb: string;  // Tigrinya infinitive gloss
  spanishVerb: string;   // Spanish infinitive gloss (used when base language is Spanish)
  englishVerb: string;   // English infinitive gloss (used when base language is English)
  infinitive: string;    // target-language infinitive / dictionary form
  present: string;
  past: string;
  future: string;
}

export type Tense = 'present' | 'past' | 'future';

export interface TenseQuestion {
  cue: string;
  infinitive: string;
  tense: Tense;
  answer: string;
  options: string[];
  explanation: string;
}

const CUES: Record<BaseLanguage, Record<Tense, string>> = {
  amharic: {
    present: 'ዛሬ... (zare) — Today / right now...',
    past: 'ትናንት... (tinant) — Yesterday...',
    future: 'ነገ... (nege) — Tomorrow...'
  },
  oromo: {
    present: "Har'a... (har'a) — Today / right now...",
    past: 'Kaleessa... (kaleessa) — Yesterday...',
    future: 'Boru... (boru) — Tomorrow...'
  },
  tigrigna: {
    present: 'ሎሚ... (lomi) — Today / right now...',
    past: 'ትማሊ... (timali) — Yesterday...',
    future: 'ጽባሕ... (tsibah) — Tomorrow...'
  },
  spanish: {
    present: 'Hoy... (today) / ahora mismo (right now)...',
    past: 'Ayer... (yesterday)...',
    future: 'Mañana... (tomorrow)...'
  },
  english: {
    present: 'Today... / right now...',
    past: 'Yesterday...',
    future: 'Tomorrow...'
  }
};

const TENSE_TIME_WORD: Record<BaseLanguage, Record<Tense, string>> = {
  amharic: { present: 'ዛሬ (today)', past: 'ትናንት (yesterday)', future: 'ነገ (tomorrow)' },
  oromo: { present: "har'a (today)", past: 'kaleessa (yesterday)', future: 'boru (tomorrow)' },
  tigrigna: { present: 'ሎሚ (today)', past: 'ትማሊ (yesterday)', future: 'ጽባሕ (tomorrow)' },
  spanish: { present: 'hoy (today)', past: 'ayer (yesterday)', future: 'mañana (tomorrow)' },
  english: { present: 'today', past: 'yesterday', future: 'tomorrow' }
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

@Injectable({ providedIn: 'root' })
export class TenseService {

  // Partial: the tense-conjugation drill only exists for the Spanish/English courses today.
  // The Amharic <-> Afaan Oromo cross-translation courses don't have entries here, and
  // getVerbs() below already falls back to an empty array for them.
  private data: Partial<Record<CourseId, TenseVerb[]>> = {
    spanish: [
      { amharicVerb: 'መብላት (meblat) — to eat', oromoVerb: 'Nyaachuu (nyaachuu) — to eat', tigrinyaVerb: "ምብላዕ (mibla'e) — to eat", spanishVerb: 'comer', englishVerb: 'to eat', infinitive: 'Comer', present: 'Como', past: 'Comí', future: 'Comeré' },
      { amharicVerb: 'መጠጣት (metetat) — to drink', oromoVerb: 'Dhuguu (dhuguu) — to drink', tigrinyaVerb: 'ምስታይ (mistay) — to drink', spanishVerb: 'beber', englishVerb: 'to drink', infinitive: 'Beber', present: 'Bebo', past: 'Bebí', future: 'Beberé' },
      { amharicVerb: 'መተኛት (metenyat) — to sleep', oromoVerb: 'Rafuu (rafuu) — to sleep', tigrinyaVerb: 'ምድቃስ (midqas) — to sleep', spanishVerb: 'dormir', englishVerb: 'to sleep', infinitive: 'Dormir', present: 'Duermo', past: 'Dormí', future: 'Dormiré' },
      { amharicVerb: 'መሮጥ (merot) — to run', oromoVerb: 'Fiiguu (fiiguu) — to run', tigrinyaVerb: 'ምጉያይ (miguyay) — to run', spanishVerb: 'correr', englishVerb: 'to run', infinitive: 'Correr', present: 'Corro', past: 'Corrí', future: 'Correré' },
      { amharicVerb: 'መናገር (menager) — to speak', oromoVerb: 'Dubbachuu (dubbachuu) — to speak', tigrinyaVerb: 'ምዝራብ (mizrab) — to speak', spanishVerb: 'hablar', englishVerb: 'to speak', infinitive: 'Hablar', present: 'Hablo', past: 'Hablé', future: 'Hablaré' },
      { amharicVerb: 'መሄድ (mehed) — to go', oromoVerb: 'Deemuu (deemuu) — to go', tigrinyaVerb: 'ምኻድ (mikhad) — to go', spanishVerb: 'ir', englishVerb: 'to go', infinitive: 'Ir', present: 'Voy', past: 'Fui', future: 'Iré' }
    ],
    english: [
      { amharicVerb: 'መብላት (meblat) — to eat', oromoVerb: 'Nyaachuu (nyaachuu) — to eat', tigrinyaVerb: "ምብላዕ (mibla'e) — to eat", spanishVerb: 'comer', englishVerb: 'to eat', infinitive: 'Eat', present: 'I eat', past: 'I ate', future: 'I will eat' },
      { amharicVerb: 'መጠጣት (metetat) — to drink', oromoVerb: 'Dhuguu (dhuguu) — to drink', tigrinyaVerb: 'ምስታይ (mistay) — to drink', spanishVerb: 'beber', englishVerb: 'to drink', infinitive: 'Drink', present: 'I drink', past: 'I drank', future: 'I will drink' },
      { amharicVerb: 'መተኛት (metenyat) — to sleep', oromoVerb: 'Rafuu (rafuu) — to sleep', tigrinyaVerb: 'ምድቃስ (midqas) — to sleep', spanishVerb: 'dormir', englishVerb: 'to sleep', infinitive: 'Sleep', present: 'I sleep', past: 'I slept', future: 'I will sleep' },
      { amharicVerb: 'መሮጥ (merot) — to run', oromoVerb: 'Fiiguu (fiiguu) — to run', tigrinyaVerb: 'ምጉያይ (miguyay) — to run', spanishVerb: 'correr', englishVerb: 'to run', infinitive: 'Run', present: 'I run', past: 'I ran', future: 'I will run' },
      { amharicVerb: 'መናገር (menager) — to speak', oromoVerb: 'Dubbachuu (dubbachuu) — to speak', tigrinyaVerb: 'ምዝራብ (mizrab) — to speak', spanishVerb: 'hablar', englishVerb: 'to speak', infinitive: 'Speak', present: 'I speak', past: 'I spoke', future: 'I will speak' },
      { amharicVerb: 'መሄድ (mehed) — to go', oromoVerb: 'Deemuu (deemuu) — to go', tigrinyaVerb: 'ምኻድ (mikhad) — to go', spanishVerb: 'ir', englishVerb: 'to go', infinitive: 'Go', present: 'I go', past: 'I went', future: 'I will go' }
    ]
  };

  getVerbs(courseId: CourseId): TenseVerb[] {
    return this.data[courseId] ?? [];
  }

  getCue(baseLanguage: BaseLanguage, tense: Tense): string {
    return CUES[baseLanguage][tense];
  }

  getVerbGloss(verb: TenseVerb, baseLanguage: BaseLanguage): string {
    return baseLanguage === 'amharic' ? verb.amharicVerb
      : baseLanguage === 'oromo' ? verb.oromoVerb
      : baseLanguage === 'tigrigna' ? verb.tigrinyaVerb
      : baseLanguage === 'spanish' ? verb.spanishVerb
      : verb.englishVerb;
  }

  /** Builds a randomized quiz: pick a verb + a tense, ask the learner to choose the correct form. */
  buildQuestions(courseId: CourseId, baseLanguage: BaseLanguage): TenseQuestion[] {
    const verbs = this.getVerbs(courseId);
    const tenses: Tense[] = ['present', 'past', 'future'];
    const questions: TenseQuestion[] = [];
    const tenseName = { present: 'present', past: 'past', future: 'future' };

    for (const verb of verbs) {
      for (const tense of tenses) {
        const answer = verb[tense];
        const distractors = tenses.filter(t => t !== tense).map(t => verb[t]);
        const options = shuffle([answer, ...distractors]);
        const timeWord = TENSE_TIME_WORD[baseLanguage][tense];
        questions.push({
          cue: CUES[baseLanguage][tense],
          infinitive: verb.infinitive,
          tense,
          answer,
          options,
          explanation: `"${answer}" is the ${tenseName[tense]}-tense form of "${verb.infinitive}" — used with ${timeWord}.`
        });
      }
    }
    return shuffle(questions);
  }
}

import { Injectable } from '@angular/core';
import { Course, CourseId, Unit } from './lesson.service';
import { BaseLanguage, BaseLanguageService } from './base-language.service';

export interface BaseLanguageOption {
  id: BaseLanguage;
  label: string;
  flag: string;
}

/**
 * Centralizes the "From" language picker list and the display-name/title lookups
 * that depend on it. This logic used to be duplicated byte-for-byte in both
 * LearnComponent and VocabularyComponent; pulling it into one injectable service
 * means there's a single place to update when a new base language is added,
 * and both pages stay in sync automatically.
 */
@Injectable({ providedIn: 'root' })
export class LanguageDisplayService {
  /** Base ("From") language choices, alphabetical by display label. */
  readonly baseLanguageOptions: BaseLanguageOption[] = (
    [
      { id: 'oromo', label: 'Afaan Oromo', flag: '🇪🇹' },
      { id: 'amharic', label: 'Amharic', flag: '🇪🇹' },
      { id: 'tigrigna', label: 'Tigrinya', flag: '🇪🇹' },
      { id: 'spanish', label: 'Spanish', flag: '🇪🇸' },
      { id: 'english', label: 'English', flag: '🇺🇸' }
    ] as BaseLanguageOption[]
  ).sort((a, b) => a.label.localeCompare(b.label));

  constructor(private baseLang: BaseLanguageService) {}

  /** Courses to show for the currently selected base language — hides learning
   *  a language from itself (e.g. no "learn Amharic" card when base is Amharic). */
  availableCourses(courses: Course[]): Course[] {
    return courses.filter(c => c.id !== this.baseLang.lang());
  }

  /** Same list, alphabetical by course name, for the "Learn" picker dropdown. */
  sortedAvailableCourses(courses: Course[]): Course[] {
    return [...this.availableCourses(courses)].sort((a, b) => a.name.localeCompare(b.name));
  }

  /** A course's display name in whichever base language the learner currently reads in. */
  nameFor(course: Course): string {
    const l = this.baseLang.lang();
    return l === 'amharic' ? course.amharicName
      : l === 'oromo' ? course.oromoName
      : l === 'tigrigna' ? course.tigrinyaName
      : l === 'spanish' ? course.spanishName
      : course.name;
  }

  /** A unit's display title in whichever base language the learner currently reads in.
   *  Tigrinya titles are stored with a parenthetical pronunciation guide (e.g.
   *  "ትግርኛ (tigrinya)") — stripped here so only the native word is shown. */
  unitTitleFor(unit: Unit): string {
    const l = this.baseLang.lang();
    const title = l === 'amharic' ? unit.amharicTitle
      : l === 'oromo' ? unit.oromoTitle
      : l === 'tigrigna' ? unit.tigrinyaTitle
      : l === 'spanish' ? unit.spanishTitle
      : unit.title;
    return title.replace(/\s*\([^)]*\)/, '').trim();
  }

  flagFor(l: BaseLanguage): string {
    return this.baseLanguageOptions.find(o => o.id === l)?.flag ?? '';
  }

  labelFor(l: BaseLanguage): string {
    return this.baseLanguageOptions.find(o => o.id === l)?.label ?? '';
  }

  /** The course to fall back to when the currently selected one is no longer valid
   *  after switching base language (e.g. it now equals the new base language). */
  firstAvailableCourseId(courses: Course[]): CourseId {
    return this.availableCourses(courses)[0].id;
  }
}

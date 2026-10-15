import { Component } from '@angular/core';
import { Course, CourseId, Unit, LessonService } from '../services/lesson.service';
import { AuthService } from '../services/auth.service';
import { BaseLanguage, BaseLanguageService } from '../services/base-language.service';
import { ProgressService } from '../services/progress.service';
import { LanguageDisplayService } from '../services/language-display.service';

@Component({
  selector: 'app-learn',
  templateUrl: './learn.component.html',
  styleUrls: ['./learn.component.css']
})
export class LearnComponent {
  courses: Course[];
  selectedCourseId: CourseId = 'spanish';

  /** Dropdown open/close state for the two From/Learn picker cards. */
  fromOpen = false;
  toOpen = false;

  constructor(
    private lessonService: LessonService,
    public auth: AuthService,
    public baseLang: BaseLanguageService,
    public progress: ProgressService,
    public langDisplay: LanguageDisplayService
  ) {
    this.courses = this.lessonService.getCourses();
    const preferred = this.auth.user()?.preferredCourse;
    if (preferred) {
      this.selectedCourseId = preferred;
    }
  }

  get selectedCourse(): Course {
    return this.courses.find(c => c.id === this.selectedCourseId)!;
  }

  /** Base ("From") language choices — delegated to the shared service so this
   *  list stays in sync with the Vocabulary page automatically. */
  get baseLanguageOptions() {
    return this.langDisplay.baseLanguageOptions;
  }

  /** Courses to show for the currently selected base language. Hides "learn Amharic"
   *  when the base language already IS Amharic (and likewise for Afaan Oromo) — you
   *  don't need a course to translate a language into itself. */
  get availableCourses(): Course[] {
    return this.langDisplay.availableCourses(this.courses);
  }

  /** Same list, alphabetical by course name, for the "Learn" picker dropdown. */
  get sortedAvailableCourses(): Course[] {
    return this.langDisplay.sortedAvailableCourses(this.courses);
  }

  /** The tense/verb-conjugation drill only exists for the Spanish and English courses. */
  get hasTenses(): boolean {
    return this.selectedCourseId === 'spanish' || this.selectedCourseId === 'english';
  }

  /** A course's display name in whichever base language the learner currently reads in. */
  nameFor(course: Course): string {
    return this.langDisplay.nameFor(course);
  }

  flagFor(l: BaseLanguage): string {
    return this.langDisplay.flagFor(l);
  }

  labelFor(l: BaseLanguage): string {
    return this.langDisplay.labelFor(l);
  }

  selectCourse(id: CourseId) {
    this.selectedCourseId = id;
  }

  selectBaseLanguage(l: BaseLanguage) {
    this.baseLang.set(l);
    // If the course they were on is no longer valid for the new base language
    // (e.g. switching to Afaan Oromo while "Learn Afaan Oromo" was selected),
    // fall back to the first still-available course.
    if (!this.availableCourses.some(c => c.id === this.selectedCourseId)) {
      this.selectedCourseId = this.langDisplay.firstAvailableCourseId(this.courses);
    }
  }

  get unitTitle(): (unit: Unit) => string {
    return unit => this.langDisplay.unitTitleFor(unit);
  }

  /** trackBy for the unit-path *ngFor — avoids re-rendering every node (and
   *  re-triggering entrance animations) when unrelated component state changes. */
  trackByUnitId(_index: number, unit: Unit): string {
    return unit.id;
  }

  /** trackBy for the course-picker and base-language-picker dropdown *ngFor loops. */
  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  get genderAvatar(): string {
    const g = this.auth.user()?.gender;
    if (g === 'female') return '👩';
    if (g === 'male') return '👨';
    return '🧑';
  }

  get unitIds(): string[] {
    return this.selectedCourse.units.map(u => u.id);
  }

  isUnitComplete(unit: Unit): boolean {
    return this.progress.isComplete(this.selectedCourse.id, unit.id);
  }

  isUnitUnlocked(index: number): boolean {
    return this.progress.isUnlocked(this.selectedCourse.id, this.unitIds, index);
  }

  /** First not-yet-completed unit — where the START button jumps to. */
  get nextUnit(): Unit {
    const units = this.selectedCourse.units;
    const next = units.find(u => !this.isUnitComplete(u));
    return next ?? units[units.length - 1];
  }

  get courseComplete(): boolean {
    return this.selectedCourse.units.every(u => this.isUnitComplete(u));
  }

  /** Alternating horizontal offset so the path meanders like a game board.
   *  Uses min() so the offsets shrink on narrow phones instead of overflowing. */
  nodeOffset(index: number): string {
    const pattern = ['0px', 'min(64px, 16vw)', 'min(104px, 26vw)', 'min(40px, 10vw)'];
    return pattern[index % pattern.length];
  }
}

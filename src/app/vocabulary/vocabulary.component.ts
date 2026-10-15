import { Component } from '@angular/core';
import { Course, CourseId, LessonService, Question, Unit } from '../services/lesson.service';
import { BaseLanguage, BaseLanguageService } from '../services/base-language.service';
import { ProgressService } from '../services/progress.service';
import { LanguageDisplayService } from '../services/language-display.service';

@Component({
  selector: 'app-vocabulary',
  templateUrl: './vocabulary.component.html',
  styleUrls: ['./vocabulary.component.css']
})
export class VocabularyComponent {
  courses: Course[];
  selectedCourseId: CourseId = 'spanish';
  search = '';

  /** Dropdown open/close state for the two From/Learn picker cards. */
  fromOpen = false;
  toOpen = false;

  constructor(
    private lessonService: LessonService,
    public baseLang: BaseLanguageService,
    public progress: ProgressService,
    public langDisplay: LanguageDisplayService
  ) {
    this.courses = this.lessonService.getCourses();
  }

  get selectedCourse(): Course {
    return this.courses.find(c => c.id === this.selectedCourseId)!;
  }

  /** Base ("From") language choices — delegated to the shared service so this
   *  list stays in sync with the Courses page automatically. */
  get baseLanguageOptions() {
    return this.langDisplay.baseLanguageOptions;
  }

  get availableCourses(): Course[] {
    return this.langDisplay.availableCourses(this.courses);
  }

  get sortedAvailableCourses(): Course[] {
    return this.langDisplay.sortedAvailableCourses(this.courses);
  }

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
    if (!this.availableCourses.some(c => c.id === this.selectedCourseId)) {
      this.selectedCourseId = this.langDisplay.firstAvailableCourseId(this.courses);
    }
  }

  get unitTitle(): (unit: Unit) => string {
    return unit => this.langDisplay.unitTitleFor(unit);
  }

  /** trackBy for unit and word-row *ngFor loops — avoids needless DOM churn when
   *  the search box filters the list or progress state changes. */
  trackByUnitId(_index: number, entry: { unit: Unit }): string {
    return entry.unit.id;
  }

  trackByWord(_index: number, word: Question): string {
    return word.sourcePhrase + '→' + word.answer;
  }

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  get unitIds(): string[] {
    return this.selectedCourse.units.map(u => u.id);
  }

  isUnitUnlocked(index: number): boolean {
    return this.progress.isUnlocked(this.selectedCourse.id, this.unitIds, index);
  }

  isUnitComplete(unit: Unit): boolean {
    return this.progress.isComplete(this.selectedCourse.id, unit.id);
  }

  /** Every word in a unit as a plain {sourcePhrase, answer} pair — reuses the same
   *  lookup/stripping logic as the quiz, just without the quiz options/shuffling. */
  wordsFor(unit: Unit): Question[] {
    return this.lessonService.buildQuestions(this.selectedCourse, unit, this.baseLang.lang());
  }

  /** All units for the selected course, in order, each tagged with its unlocked state —
   *  vocabulary for a unit only becomes visible once its lesson has been reached, same
   *  progression rule as the Courses page. */
  get orderedUnits(): { unit: Unit; index: number; unlocked: boolean }[] {
    return this.selectedCourse.units.map((unit, index) => ({
      unit, index, unlocked: this.isUnitUnlocked(index)
    }));
  }

  /** Units matching the search box. Locked units are never searchable — their words
   *  aren't shown until the learner reaches that lesson, so they drop out of results
   *  entirely rather than leaking their content through search. */
  get visibleUnitEntries(): { unit: Unit; index: number; unlocked: boolean }[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.orderedUnits;
    return this.orderedUnits.filter(e =>
      e.unlocked && (
        this.unitTitle(e.unit).toLowerCase().includes(q) ||
        this.wordsFor(e.unit).some(w => w.answer.toLowerCase().includes(q) || w.sourcePhrase.toLowerCase().includes(q))
      )
    );
  }

  matchesSearch(word: Question): boolean {
    const q = this.search.trim().toLowerCase();
    if (!q) return true;
    return word.answer.toLowerCase().includes(q) || word.sourcePhrase.toLowerCase().includes(q);
  }

  get totalWordCount(): number {
    return this.selectedCourse.units.reduce((sum, u) => sum + u.words.length, 0);
  }

  get unlockedWordCount(): number {
    return this.orderedUnits.filter(e => e.unlocked).reduce((sum, e) => sum + e.unit.words.length, 0);
  }
}

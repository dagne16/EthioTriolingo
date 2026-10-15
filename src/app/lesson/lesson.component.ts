import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Course, LessonService, Question, Unit, hasVoice, voiceLangFor } from '../services/lesson.service';
import { AudioService } from '../services/audio.service';
import { AuthService } from '../services/auth.service';
import { BaseLanguageService } from '../services/base-language.service';
import { ProgressService } from '../services/progress.service';
import { UiKey, UiTextService } from '../services/ui-text.service';

@Component({
  selector: 'app-lesson',
  templateUrl: './lesson.component.html',
  styleUrls: ['./lesson.component.css']
})
export class LessonComponent implements OnInit {
  course?: Course;
  unit?: Unit;
  questions: Question[] = [];

  currentIndex = 0;
  selectedOption: string | null = null;
  answered = false;
  isCorrect = false;
  hearts = 5;
  correctCount = 0;
  finished = false;
  xpEarned = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lessonService: LessonService,
    private audio: AudioService,
    private auth: AuthService,
    public baseLang: BaseLanguageService,
    private progress: ProgressService,
    private uiText: UiTextService
  ) {}

  /** Bilingual label for buttons/feedback (Amharic or Oromo, plus an English caption).
   *  This never touches the actual quiz question or vocabulary options — only surrounding UI text. */
  t(key: UiKey) {
    return this.uiText.label(key, this.baseLang.lang());
  }

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('courseId')!;
    const unitId = this.route.snapshot.paramMap.get('unitId')!;
    this.course = this.lessonService.getCourse(courseId);
    this.unit = this.lessonService.getUnit(courseId, unitId);
    if (this.course && this.unit) {
      this.questions = this.lessonService.buildQuestions(this.course, this.unit, this.baseLang.lang());
    }
  }

  get currentQuestion(): Question | undefined {
    return this.questions[this.currentIndex];
  }

  get progressPercent(): number {
    if (!this.questions.length) return 0;
    return Math.round((this.currentIndex / this.questions.length) * 100);
  }

  selectOption(opt: string) {
    if (this.answered) return;
    this.selectedOption = opt;
    this.audio.playClick();
    if (this.course && hasVoice(this.course.id)) {
      this.audio.speak(opt, voiceLangFor(this.course.id));
    }
  }

  checkAnswer() {
    if (!this.selectedOption || !this.currentQuestion) return;
    this.answered = true;
    this.isCorrect = this.selectedOption === this.currentQuestion.answer;
    if (this.isCorrect) {
      this.correctCount++;
      this.audio.playCorrect();
    } else {
      this.hearts = Math.max(0, this.hearts - 1);
      this.audio.playIncorrect();
    }
  }

  next() {
    if (!this.questions.length) return;
    this.answered = false;
    this.selectedOption = null;
    if (this.currentIndex < this.questions.length - 1 && this.hearts > 0) {
      this.currentIndex++;
    } else {
      this.finishUnit();
    }
  }

  private finishUnit() {
    this.finished = true;
    this.xpEarned = this.correctCount * 10;
    this.auth.addXp(this.xpEarned);
    this.audio.playComplete();
    if (this.course && this.unit) {
      this.progress.markComplete(this.course.id, this.unit.id);
    }
  }

  retryUnit() {
    if (this.course && this.unit) {
      this.questions = this.lessonService.buildQuestions(this.course, this.unit, this.baseLang.lang());
    }
    this.currentIndex = 0;
    this.hearts = 5;
    this.correctCount = 0;
    this.finished = false;
    this.answered = false;
    this.selectedOption = null;
    this.xpEarned = 0;
  }

  backToLearn() {
    this.router.navigateByUrl('/learn');
  }
}

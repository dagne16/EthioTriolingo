import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Course, CourseId, LessonService, hasVoice, voiceLangFor } from '../services/lesson.service';
import { TenseQuestion, TenseService, TenseVerb } from '../services/tense.service';
import { AudioService } from '../services/audio.service';
import { AuthService } from '../services/auth.service';
import { BaseLanguageService } from '../services/base-language.service';
import { UiKey, UiTextService } from '../services/ui-text.service';

@Component({
  selector: 'app-tense',
  templateUrl: './tense.component.html',
  styleUrls: ['./tense.component.css']
})
export class TenseComponent implements OnInit {
  course?: Course;
  verbs: TenseVerb[] = [];
  sampleVerb?: TenseVerb;

  mode: 'explainer' | 'quiz' | 'result' = 'explainer';

  questions: TenseQuestion[] = [];
  currentIndex = 0;
  selectedOption: string | null = null;
  answered = false;
  isCorrect = false;
  hearts = 5;
  correctCount = 0;
  xpEarned = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lessonService: LessonService,
    private tenseService: TenseService,
    private audio: AudioService,
    private auth: AuthService,
    public baseLang: BaseLanguageService,
    private uiText: UiTextService
  ) {}

  t(key: UiKey) {
    return this.uiText.label(key, this.baseLang.lang());
  }

  /** Human-readable name of the learner's current base language, for the explainer copy. */
  get baseLabel(): string {
    const l = this.baseLang.lang();
    return l === 'amharic' ? 'Amharic' : l === 'oromo' ? 'Afaan Oromo' : l === 'tigrigna' ? 'Tigrinya' : l === 'spanish' ? 'Spanish' : 'English';
  }

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('courseId') as CourseId;
    this.course = this.lessonService.getCourse(courseId);
    this.verbs = this.tenseService.getVerbs(courseId);
    this.sampleVerb = this.verbs[0];
  }

  verbGloss(v: TenseVerb): string {
    return this.tenseService.getVerbGloss(v, this.baseLang.lang());
  }

  get todayCue(): string { return this.tenseService.getCue(this.baseLang.lang(), 'present'); }
  get yesterdayCue(): string { return this.tenseService.getCue(this.baseLang.lang(), 'past'); }
  get tomorrowCue(): string { return this.tenseService.getCue(this.baseLang.lang(), 'future'); }

  startQuiz() {
    if (!this.course) return;
    this.questions = this.tenseService.buildQuestions(this.course.id, this.baseLang.lang()).slice(0, 12);
    this.currentIndex = 0;
    this.hearts = 5;
    this.correctCount = 0;
    this.answered = false;
    this.selectedOption = null;
    this.xpEarned = 0;
    this.mode = 'quiz';
  }

  get currentQuestion(): TenseQuestion | undefined {
    return this.questions[this.currentIndex];
  }

  get progressPercent(): number {
    if (!this.questions.length) return 0;
    return Math.round((this.currentIndex / this.questions.length) * 100);
  }

  tenseLabel(t: string): string {
    if (t === 'present') return 'Present';
    if (t === 'past') return 'Past';
    return 'Future';
  }

  selectOption(opt: string) {
    if (this.answered) return;
    this.selectedOption = opt;
    this.audio.playClick();
    if (this.course && hasVoice(this.course.id)) {
      this.audio.speak(opt, voiceLangFor(this.course.id));
    }
  }

  speakWord(text: string) {
    this.audio.playClick();
    if (this.course && hasVoice(this.course.id)) {
      this.audio.speak(text, voiceLangFor(this.course.id));
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
    this.answered = false;
    this.selectedOption = null;
    if (this.currentIndex < this.questions.length - 1 && this.hearts > 0) {
      this.currentIndex++;
    } else {
      this.finishQuiz();
    }
  }

  private finishQuiz() {
    this.mode = 'result';
    this.xpEarned = this.correctCount * 10;
    this.auth.addXp(this.xpEarned);
    this.audio.playComplete();
  }

  retryQuiz() {
    this.startQuiz();
  }

  backToExplainer() {
    this.mode = 'explainer';
  }

  backToLearn() {
    this.router.navigateByUrl('/learn');
  }
}

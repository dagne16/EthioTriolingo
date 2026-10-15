import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, CourseId } from '../services/auth.service';
import { Course, LessonService } from '../services/lesson.service';

@Component({
  selector: 'app-choose-course',
  templateUrl: './choose-course.component.html',
  styleUrls: ['./auth-shared.css']
})
export class ChooseCourseComponent {
  /** Step 1 of onboarding — base language isn't chosen yet, so every course is on offer.
   *  The next step (choose-base-language) excludes whichever one is picked here, so the
   *  learner can never end up trying to learn a language from itself. */
  readonly options: Course[];
  selected: CourseId;
  loading = false;
  error = '';

  constructor(public auth: AuthService, private lessonService: LessonService, private router: Router) {
    this.options = this.lessonService.getCourses();
    const current = this.auth.user()?.preferredCourse;
    this.selected = current && this.options.some(c => c.id === current) ? current : this.options[0].id;
  }

  choose(id: CourseId) {
    this.selected = id;
  }

  continue() {
    this.loading = true;
    this.error = '';
    this.auth.updateProfile({ preferredCourse: this.selected }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/choose-base-language');
      },
      error: (message: string) => {
        this.loading = false;
        this.error = message;
      }
    });
  }
}

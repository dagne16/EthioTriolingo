import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LearnComponent } from './learn/learn.component';
import { LessonComponent } from './lesson/lesson.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { TenseComponent } from './tense/tense.component';
import { ChooseMascotComponent } from './auth/choose-mascot.component';
import { ChooseBaseLanguageComponent } from './auth/choose-base-language.component';
import { ChooseCourseComponent } from './auth/choose-course.component';
import { ChooseAgeComponent } from './auth/choose-age.component';
import { VocabularyComponent } from './vocabulary/vocabulary.component';
import { redirectIfLoggedInGuard, requireAuthGuard } from './services/auth.guard';

const routes: Routes = [
  // Landing page: description + sign up/log in, all in one place.
  // Already-logged-in visitors skip straight to /learn.
  { path: '', component: HomeComponent, canActivate: [redirectIfLoggedInGuard] },
  { path: 'signup', component: HomeComponent, canActivate: [redirectIfLoggedInGuard], data: { authMode: 'signup' } },
  { path: 'login', component: HomeComponent, canActivate: [redirectIfLoggedInGuard], data: { authMode: 'login' } },
  // Post-signup step-by-step onboarding: course -> base language -> age -> mascot -> /learn.
  { path: 'choose-course', component: ChooseCourseComponent, canActivate: [requireAuthGuard] },
  { path: 'choose-base-language', component: ChooseBaseLanguageComponent, canActivate: [requireAuthGuard] },
  { path: 'choose-age', component: ChooseAgeComponent, canActivate: [requireAuthGuard] },
  { path: 'choose-mascot', component: ChooseMascotComponent, canActivate: [requireAuthGuard] },
  // Everything below requires being signed in — nothing inside the app is browsable as a guest.
  { path: 'learn', component: LearnComponent, canActivate: [requireAuthGuard] },
  { path: 'vocabulary', component: VocabularyComponent, canActivate: [requireAuthGuard] },
  { path: 'lesson/:courseId/:unitId', component: LessonComponent, canActivate: [requireAuthGuard] },
  { path: 'tenses/:courseId', component: TenseComponent, canActivate: [requireAuthGuard] },
  { path: 'leaderboard', component: LeaderboardComponent, canActivate: [requireAuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
